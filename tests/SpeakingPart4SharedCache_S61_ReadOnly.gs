/**
 * S6.1 — Part 4 Shared Content Cache & Mastery Isolation.
 * STRICTLY READ-ONLY. Checks staged HTML templates; no Sheets/Drive properties
 * or backend calls. Run testSpeakingPart4SharedCacheS61ReadOnly().
 */
function testSpeakingPart4SharedCacheS61ReadOnly(){
  const source=name=>HtmlService.createHtmlOutputFromFile(name).getContent();
  const shared=speakingCombinedJSReadOnly_();
  const p4=source('JS_SpeakingPart4');
  const p4View=source('ViewSpeakingPart4');
  const speakingView=source('ViewSpeaking');
  const has=(s,needle)=>s.includes(needle);
  const n=(s,re)=>(s.match(re)||[]).length;
  const read=shared.slice(shared.indexOf('function readBootstrapCache('),shared.indexOf('function persistCurrentBootstrapCache()'));
  const manager=shared.slice(shared.indexOf('function createSpeakingContentCache_(){'),shared.indexOf('window.AptisSpeakingCache=createSpeakingContentCache_();'));
  const loader=p4.slice(p4.indexOf('function load(forceRefresh){'),p4.indexOf('function setP4Step_(step)'));
  const mastery=p4.slice(p4.indexOf('function p4RefreshMastery(force){'),p4.indexOf('function p4DecorateTopics(){'));
  const apply=p4.slice(p4.indexOf('function p4ApplyPayload_('),p4.indexOf('function load(forceRefresh){'));
  const valid=p4.slice(p4.indexOf('function p4ValidContent_('),p4.indexOf('function p4ValidMastery_('));
  const checks={
    sharedCacheManagerOneOwner:n(shared,/window\.AptisSpeakingCache=createSpeakingContentCache_\(\)/g)===1,
    noObsoleteBootstrapTitleWrite:!has(shared,"$('appTitle').textContent")&&has(speakingView,'<h1>Speaking</h1>'),
    missingBootstrapIdGuard:!has(speakingView,'id="appTitle"')&&!has(shared,"$('appTitle').textContent"),
    part123UsesSharedRead:has(read,'window.AptisSpeakingCache.read({'),
    part123UsesSharedWrite:has(read,'window.AptisSpeakingCache.write({'),
    part123PrimaryKeyUnchanged:has(shared,"aptisSpeakingBootstrap:p1-reuse-49-v01-20261020"),
    part123BackupKeyUnchanged:has(shared,"aptisSpeakingBootstrap:p1-reuse-49-v01-lastGood"),
    part123SevenDayFallbackRetained:has(shared,'CLIENT_CACHE_STALE_MS = 7 * 24'),
    part123ValidationRetained:has(read,'validate:isUsableSpeakingPayload_'),
    sharedCacheLocalStorageRead:has(manager,'localStorage.getItem(key)'),
    sharedCacheLocalStorageWrite:has(manager,'localStorage.setItem(key,JSON.stringify(record))'),
    sharedCacheClearMemoryAndStorage:has(manager,'memory.delete(key)')&&has(manager,'localStorage.removeItem(key)'),
    sharedCacheRejectsInvalid:has(manager,"!valid_(record.data,opts.validate)")&&has(manager,'if(!valid_(opts.data,opts.validate))return false'),
    sharedCacheTracksFreshVsStale:has(manager,'stale:age>ageFresh'),
    sharedCacheDeduplicatesInflight:has(manager,'const existing=pending.get(key)')&&has(manager,'existing.success.push(onSuccess)'),
    sharedCacheDropsCancelledResults:has(manager,"if(pending.get(key)!==job)return;"),
    sharedCacheReportsRequestCounts:has(manager,'requests:Object.fromEntries(calls)'),
    part4UsesSharedCache:has(p4,'function p4Cache_(){return window.AptisSpeakingCache;}'),
    noPrivatePart4Cache:!has(p4,'P4_CONTENT_CACHE')&&!has(p4,'P4_CONTENT_TTL_MS'),
    part4LearnAndExamSeparate:has(p4,"return P4_CACHE_NAMESPACE+':content:'+(mode==='exam'?'exam':'learn')"),
    part4ContentNeverUsesMasteryKey:has(p4,"':mastery:live'")&&has(p4,"':content:'"),
    part4LearnRequires51:has(valid,"mode==='learn'&&data.sets.length!==51"),
    part4ValidatesUniqueIdsAndThreeQuestions:has(valid,"ids.has(String(x.id))")&&has(valid,'x.questions.length!==3'),
    part4LearnRequiresFullModels:has(valid,"mode==='learn'&&(!Array.isArray(x.models)||x.models.length!==3"),
    part4ExamPreservesApprovalGate:has(valid,"x.releaseApproved")&&has(valid,"x.qaStatus!=='APPROVED'"),
    part4DoesNotPassLearnDataIntoExam:has(valid,"data.mode!==mode")&&has(loader,"data=>p4ValidContent_(data,mode)"),
    part4CacheReadPrecedesLoader:loader.indexOf('cache.read({')>=0&&loader.indexOf('cache.read({')<loader.indexOf("status('Loading Part 4 data..."),
    part4CachedContentDoesNotClearDOM:has(loader,'if(saved){')&&has(loader,'p4ApplyPayload_(saved.data,requestId,mode);'),
    part4DoesNotRerenderUnchangedPayload:has(apply,'if(S.data===data&&S.dataMode===mode)'),
    part4StaleWhileRevalidate:has(loader,'if(!saved.stale){p4RefreshMastery();return;}'),
    part4SingleContentServerEndpoint:n(loader,/\.getSpeakingPart4Dev\(mode\)/g)===1,
    part4KeepsOfflineFallback:has(loader,"status('Saved Part 4 data · background refresh unavailable.')"),
    part4DoesNotResetRunningSpeaking:has(loader,"if(['prep','speak'].includes(S.phase))return;"),
    part4MasterySeparateShortMemoryCache:has(mastery,'memoryOnly:true')&&has(p4,'P4_MASTERY_FRESH_MS=90*1000'),
    part4MasteryChecks51UniqueRows:has(p4,'rows.length!==51')&&has(p4,'ids.has(id)'),
    part4MasteryDoesNotInventZeroOnFailure:has(mastery,'if(!P4_MASTERY.loaded)')&&!has(mastery,'P4_MASTERY.rows=[]'),
    part4MasteryFetchOnlyOncePerInflight:has(mastery,'cache.request(key,')&&n(mastery,/\.getSpeakingPart4Mastery\(\)/g)===1,
    part4SavedMasteryInvalidatesCache:has(p4,'p4RefreshMastery(true);'),
    part4HasReadOnlyRequestDiagnostics:has(p4,'qaCacheInfo:p4CacheDiagnostic_')&&has(p4,'requests:Object.fromEntries(safeKeys.map('),
    part4NoNewBackendWrites:has(p4,'saveSpeakingPart4Mastery({questionId:id,level')&&has(p4,'saveSpeakingPart4DevAttempt({'),
    part4StillShowsTopicLibraryAndDetail:has(p4View,'id="p4TopicLibrary"')&&has(p4View,'id="p4TopicDetail"'),
    part4NoBlockingGlobalLoader:!has(loader,"byId('loadingView')"),
    sameModeMemorizeDoesNotTriggerFetch:has(p4,"if(S.mode!==nextMode)load();")&&has(p4,"else {p4ApplyStudyMode();p4RenderStudyCards_();}")
  };
  const failed=Object.keys(checks).filter(k=>!checks[k]);
  const result={ok:failed.length===0,totalChecks:Object.keys(checks).length,
    passed:Object.keys(checks).length-failed.length,failed,
    note:'Read-only source QA. In-browser network count and 51-topic rendering are separate acceptance gates.'};
  console.log('SPEAKING_S61_SHARED_CACHE_QA_RESULT '+JSON.stringify(result,null,2));
  if(!result.ok)throw new Error('S61_CACHE_SOURCE_QA_FAILED: '+failed.join(', '));
  return result;
}