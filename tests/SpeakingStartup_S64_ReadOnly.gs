/**
 * S6.4 STARTUP HARD QA — READ ONLY.
 * Covers the previously recurring "Preparing your study plan" deadlock.
 * Never calls Sheets, migration or any save endpoint.
 * Run testSpeakingStartupS64ReadOnly() after pulling the S6.4 staging branch.
 */
function testSpeakingStartupS64ReadOnly() {
  const read = name => HtmlService.createHtmlOutputFromFile(name).getContent();
  const common = read('JS_Speaking');
  const p4 = read('JS_SpeakingPart4');
  const views = ['ViewSpeaking','ViewSpeakingPart1','ViewSpeakingPart2',
    'ViewSpeakingPart3','ViewSpeakingPart4','AppShell'].map(read);
  const fullMarkup = views.join('\n');
  const speakingView = views[0],p4View = views[4];
  const idMatches = [...fullMarkup.matchAll(/\bid\s*=\s*["']([^"']+)["']/g)];
  const markupIds = idMatches.map(m => m[1]);
  const seen = new Set(), duplicates = [];
  markupIds.forEach(id => {if (seen.has(id)) duplicates.push(id); seen.add(id);});
  const referencedIds = [...common.matchAll(/\$\('([^']+)'\)/g)]
    .map(m => m[1]).filter(x => /^[A-Za-z][\w:-]*$/.test(x));
  const missing = [...new Set(referencedIds.filter(id => !seen.has(id)))];
  // The broken S6.4 revision used $(CSS selector).forEach instead of $$(selector).
  const invalidSelectors = common.split(/\r?\n/).map((line,i) =>
    /^\s*\$\(['"][.#\[]/.test(line) ? (i+1)+':'+line.trim() : null
  ).filter(Boolean);
  const section = (text,a,b) => {
    const i=text.indexOf(a),j=text.indexOf(b,i+a.length);
    return i<0||j<=i ? null : text.slice(i,j);
  };
  const mode = section(common,'function setMode(mode) {','function setMemorizeLevel(level)');
  const init = section(common,'function init() {','function enter() {');
  const loading = section(common,'function loadData(options) {','function refreshDataInBackground(');
  // Source boundaries are named functions, not mutable editorial comments.
  // Missing anchors return null and FAIL safely.
  const p4ScopeStart=/\bfunction\s+p4Timer_\s*\(\s*\)\s*\{/.exec(p4);
  const p4ScopeEnd=/\bfunction\s+p4FormulaHtml\s*\(/.exec(p4);
  const p4Timer=p4ScopeStart && p4ScopeEnd && p4ScopeEnd.index>p4ScopeStart.index
    ? p4.slice(p4ScopeStart.index,p4ScopeEnd.index) : null;
  let jsSyntaxOK = true,p4SyntaxOK = true,jsSyntaxError = '';
  try { new Function(common.replace(/^\s*<script>/,'').replace(/<\/script>\s*$/,'')); }
  catch (e) {jsSyntaxOK=false;jsSyntaxError='JS_Speaking: '+e.message;}
  try { new Function(p4.replace(/^\s*<script>/,'').replace(/<\/script>\s*$/,'')); }
  catch (e) {p4SyntaxOK=false;jsSyntaxError+=' JS_SpeakingPart4: '+e.message;}
  const checks = {
    noSingleDollarCssSelectors: invalidSelectors.length===0,
    sharedLevelButtonsUseQuerySelectorAll:
      common.includes("$$('#speakingMemorizeLevels .level-btn').forEach"),
    modeButtonsUseQuerySelectorAll:
      mode!==null && mode.includes("$$('#speakingModeTabs .mode-tab').forEach"),
    startupErrorCaught: init!==null && init.includes('catch (error)'),
    startupErrorLogged: init!==null && init.includes('SPEAKING_BOOTSTRAP_INIT_FAILED'),
    startupShowsError: init!==null && init.includes("$('errorView')?.classList.remove('hidden')"),
    enterRespectsStartupFailure: common.includes('if (startupFailure_) {'),
    enterDoesNotReviveFailedRequest: common.includes("else if (!($('errorView')?.classList.contains('hidden')))"),
    blockingLoaderIsExplicitlyStopped: common.includes('function setLoadingVisible(visible)'),
    loaderHasHardTimeout: loading!==null && loading.includes('LOADER_HARD_TIMEOUT_MS'),
    hardTimeoutIs30Seconds: common.includes('const LOADER_HARD_TIMEOUT_MS = 30000'),
    timeoutHidesLoaderViaOnError: loading!==null && loading.includes('if (!state.data) onError(new Error('),
    stillCallsOfficialBootstrap: loading!==null && loading.includes('.getBootstrapData(Boolean(opts.force))'),
    bootstrapFailureCallbackExists: loading!==null && loading.includes('.withFailureHandler(function(err)'),
    cachedBootstrapFallbackRetained: common.includes('readBootstrapCache(true)'),
    existingStableCacheKeyRetained:
      common.includes("aptisSpeakingBootstrap:p1-reuse-49-v01-20261020"),
    speakingPart123SectionsPresent:
      speakingView.includes('id="skillHomeView"')&&speakingView.includes('id="homeView"')&&
      speakingView.includes('id="studyView"'),
    markupHasNoDuplicateIds: duplicates.length===0,
    javascriptIdReferencesExist: missing.length===0,
    part123UsesTwoLevels:
      (speakingView.match(/data-level="[12]"/g)||[]).length===2 &&
      !speakingView.includes('data-level="3"'),
    part4UsesTwoLevels:
      (p4View.match(/data-p4-level="[12]"/g)||[]).length===2 &&
      !p4View.includes('data-p4-level="3"'),
    sharedMemorizeRendererPresent: common.includes('render:speakingRenderMemorize_') &&
      p4.includes('api.render({'),
    memorandumDoesNotAutoSave:
      !section(common,'function speakingRenderMemorize_(opts){',
        'window.AptisSpeakingMemorize=Object.freeze({')?.includes('google.script.run'),
    part4TimerScopeIsBounded: p4Timer!==null && p4Timer.length<6000,
    part4TimerDoesNotWrite: p4Timer!==null &&
      !/\.saveSpeakingPart4Mastery\s*\(/.test(p4Timer) &&
      !/\.saveSpeakingPart4DevAttempt\s*\(/.test(p4Timer),
    part4ManualSaveStillExists: p4.includes("byId('p4Save').addEventListener('click'"),
    javascriptSyntaxOK: jsSyntaxOK && p4SyntaxOK
  };
  const failed=Object.keys(checks).filter(k=>!checks[k]);
  const result = {
    ok:failed.length===0,totalChecks:Object.keys(checks).length,
    passed:Object.keys(checks).length-failed.length,failed,
    diagnostics:{
      detectedS64StartupGuard:common.includes('SPEAKING_BOOTSTRAP_INIT_FAILED'),
      invalidSelectors, missingDomIds:missing, duplicateDomIds:duplicates,
      referencedDomIds:new Set(referencedIds).size,
      markupIds:markupIds.length,
      p4TimerSegmentLength:p4Timer ? p4Timer.length : -1,
      p4TimerStartLocated:Boolean(p4ScopeStart),
      p4FormulaEndLocated:Boolean(p4ScopeEnd),
      jsSyntaxError
    },
    note:'Read-only source QA. Runtime load and mobile visual testing remain separate.'
  };
  console.log('SPEAKING_S64_STARTUP_HARD_QA_RESULT '+JSON.stringify(result,null,2));
  if(failed.length) throw new Error('S64_STARTUP_HARD_QA_FAILED: '+failed.join(', '));
  return result;
}
