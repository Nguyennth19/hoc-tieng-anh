function runMigrations() {
  const ss = getDatabase_();
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);

  try {
    const report = [];

    const settings = ensureSheetWithHeaders_(ss, SHEET_NAMES.SETTINGS, HEADERS.SETTINGS, report);
    const progress = ensureSheetWithHeaders_(ss, SHEET_NAMES.PROGRESS, HEADERS.PROGRESS, report);
    const attempts = ensureSheetWithHeaders_(ss, SHEET_NAMES.ATTEMPTS, HEADERS.ATTEMPTS, report);
    const p1 = ensureSheetWithHeaders_(ss, SHEET_NAMES.SPEAKING_P1, HEADERS.SPEAKING_P1, report);
    const p2 = ensureSheetWithHeaders_(ss, SHEET_NAMES.SPEAKING_P2, HEADERS.SPEAKING_P2, report);
    const p3 = ensureSheetWithHeaders_(ss, SHEET_NAMES.SPEAKING_P3, HEADERS.SPEAKING_P3, report);
    const media = ensureSheetWithHeaders_(ss, SHEET_NAMES.MEDIA, HEADERS.MEDIA, report);

    // V1 -> V2 migrations
    ensureColumn_(progress, 'favorite', HEADERS.PROGRESS, report);
    ensureColumn_(attempts, 'part', HEADERS.ATTEMPTS, report);
    ensureColumn_(attempts, 'promptIndex', HEADERS.ATTEMPTS, report);

    // Part 1 content upgrade: preserve IDs/progress, update learning content in-place.
    upgradeSpeakingPart1Content_(p1, settings, report);
    // HARD QA 2026-10-20: Protect curated source Q2/Q3 and learner content.
    // The old seed migration resets Q2/Q3, their model answers and activation.
    // Seed only a genuinely empty bank; never reseed a populated release.
    if (p2.getLastRow() < 2) {
      upgradeSpeakingPart2Description_(p2, settings, report);
    } else {
      report.push('P2 existing bank preserved; no destructive seed replay.');
    }
    if (p3.getLastRow() < 2) {
      upgradeSpeakingPart3Description_(p3, settings, report);
    } else {
      report.push('P3 existing bank preserved; no destructive seed replay.');
    }

    const mediaCount = ensurePart2MediaAssets_(ss, p2, media, report);
    if (mediaCount) report.push('Prepared ' + mediaCount + ' Speaking Part 2 source images in Drive.');

    // Part 3 images are intentionally prepared in small background batches from the client.
    // Keeping 64 Drive file creations out of migration makes bootstrap fast and reliable.

    setSetting_(settings, 'schema_version', APP_CONFIG.SCHEMA_VERSION);
    setSetting_(settings, 'app_version', APP_CONFIG.VERSION);
    setSetting_(settings, 'last_migration_at', new Date().toISOString());

    CacheService.getScriptCache().remove('schema:' + ss.getId());
    CacheService.getScriptCache().remove('bootstrap:' + APP_CONFIG.VERSION);
    clearSpeakingContentCache_();
    clearSpeakingProgressCache_();

    return {
      ok: true,
      appVersion: APP_CONFIG.VERSION,
      schemaVersion: APP_CONFIG.SCHEMA_VERSION,
      spreadsheetId: ss.getId(),
      spreadsheetName: ss.getName(),
      changes: report
    };
  } finally {
    lock.releaseLock();
  }
}

function ensureSchema_() {
  const cache = CacheService.getScriptCache();
  const key = 'schema:' + getDatabase_().getId();
  const expected = APP_CONFIG.SCHEMA_VERSION + '|p1:' + PART1_CONTENT_VERSION + '|p2:' + PART2_DESCRIPTION_VERSION + '|p3:' + PART3_DESCRIPTION_VERSION;
  if (cache.get(key) === expected) return;

  const ss = getDatabase_();
  const settings = ss.getSheetByName(SHEET_NAMES.SETTINGS);
  const currentSchema = settings ? getSetting_(settings, 'schema_version') : '';
  const currentP1 = settings ? getSetting_(settings, 'p1_content_version') : '';
  const currentP2 = settings ? getSetting_(settings, 'p2_description_version') : '';
  const currentP3 = settings ? getSetting_(settings, 'p3_description_version') : '';

  if (currentSchema !== APP_CONFIG.SCHEMA_VERSION ||
      currentP1 !== PART1_CONTENT_VERSION ||
      currentP2 !== PART2_DESCRIPTION_VERSION ||
      currentP3 !== PART3_DESCRIPTION_VERSION) {
    runMigrations();
  }
  cache.put(key, expected, APP_CONFIG.CACHE_SECONDS);
}

