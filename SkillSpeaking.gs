function getBootstrapData(forceRefresh) {
  ensureSchema_();
  ensurePart3ExamBankReady_();

  const bypass = forceRefresh === true;
  const p1 = getCachedSpeakingContent_('p1', bypass, getSpeakingPart1_);
  // Practice bank is strict: only complete, active three-question topics.
  // Keep original Sheet rows and progress IDs intact for audit/recovery.
  const isCompletePracticeTopic_ = function(item) {
    return item && Array.isArray(item.questions) && Array.isArray(item.models) &&
      item.questions.length === 3 && item.models.length === 3 &&
      item.questions.every(function(q){return String(q || '').trim().length > 0;}) &&
      item.models.every(function(m){return String(m || '').trim().length > 0;});
  };
  const p2 = getCachedSpeakingContent_('p2', bypass, getSpeakingPart2_)
    .filter(function(item){return item.id !== 'SP2-EX-012' && isCompletePracticeTopic_(item);});
  const p3 = getCachedSpeakingContent_('p3', bypass, getSpeakingPart3Full_)
    .filter(function(item){return item.id !== 'SP3-EX-012' && item.id !== 'SP3-EX-017' && isCompletePracticeTopic_(item);});
  const progress = getCachedProgressMap_(bypass);

  const p1Items = p1.map(function(q) {
    return Object.assign({}, q, {
      progress: progress[q.id] || defaultProgress_(q.id)
    });
  });

  const p2Items = p2.map(function(task) {
    const promptProgress = task.questions.map(function(q, i) {
      const n = i + 1;
      const key = task.id + '-' + n;
      return progress[key] || defaultProgress_(key);
    });
    const learnedCount = promptProgress.filter(function(p){return p.status === 'learned';}).length;
    const oldTopic = progress[task.id] || {};
    const topicProgress = Object.assign({}, aggregatePart2DescriptionProgress_(task.id, promptProgress, oldTopic), {
      status: learnedCount === promptProgress.length ? 'learned' : (promptProgress.some(function(p){return Number(p.reviewCount || 0) > 0;}) ? 'learning' : 'new'),
      masteredPrompts: learnedCount, totalPrompts: promptProgress.length
    });
    return Object.assign({}, task, { promptProgress: promptProgress, progress: topicProgress });
  });

  const p3Items = p3.map(function(task) {
    const promptProgress = task.questions.map(function(q,i) {
      const n = i + 1;
      const key = task.id + '-' + n;
      return progress[key] || defaultProgress_(key);
    });
    const learned = promptProgress.filter(function(p){return p.status === 'learned';}).length;
    const oldTopic = progress[task.id] || {};
    const topicProgress = Object.assign({}, aggregatePart3DescriptionProgress_(task.id, promptProgress, oldTopic), {
      status: learned === promptProgress.length && learned > 0 ? 'learned' : (promptProgress.some(function(p){return Number(p.reviewCount || 0) > 0;}) ? 'learning' : 'new'),
      masteredPrompts: learned,
      totalPrompts: promptProgress.length
    });
    return Object.assign({}, task, { promptProgress: promptProgress, progress: topicProgress });
  });

  return {
    app: {
      title: APP_CONFIG.APP_TITLE,
      version: APP_CONFIG.VERSION,
      schemaVersion: APP_CONFIG.SCHEMA_VERSION,
      timers: { part1: APP_CONFIG.PART1_TEST_SECONDS, part2: APP_CONFIG.PART2_TEST_SECONDS, part3: APP_CONFIG.PART3_TEST_SECONDS },
      loadedAt: new Date().toISOString(),
      serverCacheSeconds: APP_CONFIG.CACHE_SECONDS,
      contentRevision: buildSpeakingContentRevision_()
    },
    part1: p1Items,
    part2: p2Items,
    part3: p3Items
  };
}

/**
 * R1 bounded cache: Apps Script CacheService enforces ~100 KB per value.
 * Chunk values into conservative <=18,000 UTF-16-code-unit pieces (~54 KB
 * worst-case UTF-8), publish a manifest only AFTER chunks are stored.
 * An incomplete/corrupt hit always falls back to the source loader.
 */
function readSpeakingCachedPayload_(cache, key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (hit.indexOf('speaking-chunks:v1:') !== 0) return JSON.parse(hit);
  const match = /^speaking-chunks:v1:([a-zA-Z0-9-]+):(\d+)$/.exec(hit);
  if (!match) return null;
  const count = Number(match[2]);
  if (!count || count > 16) return null;
  const keys = [];
  for (let i = 0; i < count; i++) keys.push(key + ':r1:' + match[1] + ':' + i);
  const stored = cache.getAll(keys);
  if (!keys.every(function(k) { return typeof stored[k] === 'string'; })) return null;
  return JSON.parse(keys.map(function(k) { return stored[k]; }).join(''));
}

function putSpeakingCachedPayload_(cache, key, data, seconds) {
  const serialized = JSON.stringify(data);
  // No buffer expansion for small banks and existing cache readers.
  if (serialized.length <= 18000) {
    cache.put(key, serialized, seconds);
    return;
  }
  const chunks = [];
  let offset = 0;
  while (offset < serialized.length) {
    let end = Math.min(offset + 18000, serialized.length);
    // Do not split a UTF-16 surrogate pair across CacheService values.
    if (end < serialized.length &&
        serialized.charCodeAt(end - 1) >= 0xD800 &&
        serialized.charCodeAt(end - 1) <= 0xDBFF) end--;
    chunks.push(serialized.slice(offset, end));
    if (chunks.length > 16) return; // Not worth exceeding bounded cache entries.
    offset = end;
  }
  const nonce = Utilities.getUuid();
  const values = {};
  chunks.forEach(function(chunk, i) { values[key + ':r1:' + nonce + ':' + i] = chunk; });
  cache.putAll(values, seconds);
  cache.put(key, 'speaking-chunks:v1:' + nonce + ':' + chunks.length, seconds);
}

function getCachedSpeakingContent_(partKey, forceRefresh, loaderFn) {
  const cache = CacheService.getScriptCache();
  const dbId = getDatabase_().getId();
  const key = 'speak-content:' + APP_CONFIG.SCHEMA_VERSION + ':' + getSpeakingContentVersion_(partKey) + ':' + dbId + ':' + partKey;
  if (!forceRefresh) {
    try {
      const cached = readSpeakingCachedPayload_(cache, key);
      if (cached !== null) return cached;
    } catch (e) { /* cache is best effort; reload from the authoritative bank */ }
  }
  const data = loaderFn();
  try { putSpeakingCachedPayload_(cache, key, data, APP_CONFIG.CACHE_SECONDS); } catch (e) {}
  return data;
}

function getCachedProgressMap_(forceRefresh) {
  const cache = CacheService.getScriptCache();
  const dbId = getDatabase_().getId();
  const key = 'speak-progress:' + dbId;
  if (!forceRefresh) {
    try {
      const cached = readSpeakingCachedPayload_(cache, key);
      if (cached !== null) return cached;
    } catch (e) { /* optional cache; authoritative progress remains in Sheets */ }
  }
  const data = getProgressMap_();
  try { putSpeakingCachedPayload_(cache, key, data, APP_CONFIG.PROGRESS_CACHE_SECONDS || 120); } catch (e) {}
  return data;
}

function clearSpeakingProgressCache_() {
  try { CacheService.getScriptCache().remove('speak-progress:' + getDatabase_().getId()); } catch (e) {}
}

function clearSpeakingContentCache_() {
  try {
    const cache = CacheService.getScriptCache();
    const dbId = getDatabase_().getId();
    ['p1','p2','p3'].forEach(function(partKey) {
      // Remove current versioned key and the pre-versioning legacy key.
      cache.remove('speak-content:' + APP_CONFIG.SCHEMA_VERSION + ':' + getSpeakingContentVersion_(partKey) + ':' + dbId + ':' + partKey);
      cache.remove('speak-content:' + APP_CONFIG.SCHEMA_VERSION + ':' + dbId + ':' + partKey);
    });
  } catch (e) {}
}


function getSpeakingContentVersion_(partKey) {
  if (partKey === 'p1' && typeof PART1_CONTENT_VERSION !== 'undefined') return String(PART1_CONTENT_VERSION) + '.teacher-reuse-49-v01.20261020';
  if (partKey === 'p2' && typeof PART2_DESCRIPTION_VERSION !== 'undefined') return String(PART2_DESCRIPTION_VERSION) + '.teacher-reuse-q23-v04.20261020';
  if (partKey === 'p3' && typeof PART3_DESCRIPTION_VERSION !== 'undefined') return String(PART3_DESCRIPTION_VERSION) + '.teacher-reuse-q23-v04.20261020';
  return 'base';
}

/**
 * Defensive self-heal for deployments that previously timed out while creating Part 3 media.
 * If the active exam bank is not present, seed content only (fast) and leave images to background batches.
 */
function ensurePart3ExamBankReady_() {
  // R1: READ ONLY. Opening Speaking must never seed, reactivate, or erase P3.
  // Fail visibly when the bank is unavailable instead of masking a data issue.
  const ss = getDatabase_();
  const p3 = ss.getSheetByName(SHEET_NAMES.SPEAKING_P3);
  if (!p3 || p3.getLastRow() < 2) {
    throw new Error('R1_P3_BANK_NOT_READY: Speaking Part 3 is missing or empty. ' +
      'Restore its approved backup; no automatic seeding is allowed.');
  }
  const idx = headerIndexMap_(p3);
  const values = p3.getDataRange().getValues();
  let activeExamCount = 0;
  values.slice(1).forEach(function(row) {
    const id = String(row[idx.id] || '');
    const active = idx.active === undefined ? true :
      !(row[idx.active] === false || String(row[idx.active]).toLowerCase() === 'false');
    if (/^SP3-EX-\d{3}$/.test(id) && active) activeExamCount++;
  });
  if (activeExamCount === 0) {
    throw new Error('R1_P3_NO_ACTIVE_EXAM: No active Part 3 exam topic was found. ' +
      'Review the curated bank; automatic reseeding is prohibited.');
  }
}

/**
 * Lightweight cache manifest.
 * This intentionally does NOT read all Speaking sheets.
 * The client can compare this revision with its local cache first.
 */
function getSpeakingCacheManifest() {
  return {
    appVersion: String(APP_CONFIG.VERSION || ''),
    schemaVersion: String(APP_CONFIG.SCHEMA_VERSION || ''),
    contentRevision: buildSpeakingContentRevision_(),
    parts: {
      p1: getSpeakingContentVersion_('p1'),
      p2: getSpeakingContentVersion_('p2'),
      p3: getSpeakingContentVersion_('p3')
    },
    checkedAt: new Date().toISOString()
  };
}

/**
 * True force refresh used by the refresh button.
 * Clears only APTIS Speaking server caches, then rebuilds from the database.
 */
function forceRefreshSpeaking() {
  clearSpeakingContentCache_();
  clearSpeakingProgressCache_();
  return getBootstrapData(true);
}

/**
 * Stable revision derived from code-controlled content versions.
 * IMPORTANT: whenever a Part's source content changes, bump its content version.
 */
function buildSpeakingContentRevision_() {
  return [
    'schema=' + String(APP_CONFIG.SCHEMA_VERSION || ''),
    'p1=' + getSpeakingContentVersion_('p1'),
    'p2=' + getSpeakingContentVersion_('p2'),
    'p3=' + getSpeakingContentVersion_('p3')
  ].join('|');
}

