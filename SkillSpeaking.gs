function getBootstrapData(forceRefresh) {
  ensureSchema_();
  // P3 legacy auto-reseed is disabled. Bootstrap never modifies approved content.

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
 * CacheService values are limited to about 100 KB each. Store JSON as
 * conservative UTF-16 slices (18k code units => <=72 KB UTF-8 even for emoji).
 * Write the manifest LAST: a partial/expired generation becomes a cache miss.
 * The small manifest lives at the original key; chunks are generation-scoped.
 * Cache failures must never alter stored Sheet data or block the loader.
 */
function speakingCacheRead_(cache, key) {
  const raw = cache.get(key);
  if (!raw) return null;
  let manifest;
  try { manifest = JSON.parse(raw); } catch (e) { cache.remove(key); return null; }
  if (!manifest || manifest.cacheFormat !== 'chunked-v1' ||
      !Number.isInteger(manifest.parts) || manifest.parts < 1 || manifest.parts > 200 ||
      !/^[a-zA-Z0-9-]{8,64}$/.test(String(manifest.token || ''))) {
    cache.remove(key);
    return null;
  }
  const chunks = [];
  for (let i = 0; i < manifest.parts; i++) {
    const fragment = cache.get(key + ':chunk:' + manifest.token + ':' + i);
    if (fragment === null) { cache.remove(key); return null; }
    chunks.push(fragment);
  }
  const text = chunks.join('');
  if (text.length !== manifest.length) { cache.remove(key); return null; }
  try { return JSON.parse(text); }
  catch (e) { cache.remove(key); return null; }
}

function speakingCacheWrite_(cache, key, data, ttl) {
  const json = JSON.stringify(data);
  if (!json) return;
  const chunkLength = 18000;
  const parts = Math.ceil(json.length / chunkLength);
  if (!parts || parts > 200) return; // Bypass cache, never block live content.
  const token = Utilities.getUuid().replace(/[^a-zA-Z0-9-]/g, '');
  const written = [];
  try {
    for (let i = 0; i < parts; i++) {
      const partKey = key + ':chunk:' + token + ':' + i;
      cache.put(partKey, json.slice(i * chunkLength, (i + 1) * chunkLength), ttl);
      written.push(partKey);
    }
    cache.put(key, JSON.stringify({cacheFormat:'chunked-v1',token:token,parts:parts,length:json.length}), ttl);
  } catch (e) {
    written.forEach(function(partKey) { try { cache.remove(partKey); } catch (ignored) {} });
    try { cache.remove(key); } catch (ignored) {}
    console.warn('Speaking cache skipped; direct Sheet read remains available: ' + String(e));
  }
}

function getCachedSpeakingContent_(partKey, forceRefresh, loaderFn) {
  const cache = CacheService.getScriptCache();
  const dbId = getDatabase_().getId();
  const key = 'speak-content:' + APP_CONFIG.SCHEMA_VERSION + ':' + getSpeakingContentVersion_(partKey) + ':' + dbId + ':' + partKey;
  if (!forceRefresh) {
    const hit = speakingCacheRead_(cache, key);
    if (Array.isArray(hit)) return hit;
  }
  const data = loaderFn();
  if (!Array.isArray(data)) throw new Error('Invalid Speaking content for ' + partKey + ': expected array');
  speakingCacheWrite_(cache, key, data, APP_CONFIG.CACHE_SECONDS);
  return data;
}

function getCachedProgressMap_(forceRefresh) {
  const cache = CacheService.getScriptCache();
  const dbId = getDatabase_().getId();
  const key = 'speak-progress:' + dbId;
  if (!forceRefresh) {
    const hit = speakingCacheRead_(cache, key);
    if (hit && typeof hit === 'object' && !Array.isArray(hit)) return hit;
  }
  const data = getProgressMap_();
  speakingCacheWrite_(cache, key, data, APP_CONFIG.PROGRESS_CACHE_SECONDS || 120);
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
  // Deprecated API retained for compatibility. Never write production
  // content during bootstrap. Recovery uses the independently backed-up bank.
  return { ok: true, autoSeedDisabled: true };
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

