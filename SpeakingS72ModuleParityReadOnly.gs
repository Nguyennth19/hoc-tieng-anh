/**
 * S7.2 Speaking modular refactor — source parity/manifest QA (READ ONLY).
 * No RPC, workbook access or modifications; run BEFORE opening /dev.
 * Compares the combined JS/CSS to the exact S7.2 staging source hashes
 * measured from the EXACT GitHub S7.2 base source before refactor, thus guarding against lost functionality.
 */
function testSpeakingS72ModuleParityReadOnly() {
  var failed=[],checks=[];
  function test(name,passed,detail){
    var c={name:name,pass:Boolean(passed)};
    if(!passed){c.detail=detail||'';failed.push(c);}
    checks.push(c);
  }
  function sha256(value){
    var bytes=Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,value,Utilities.Charset.UTF_8);
    return bytes.map(function(x){return ('0'+((x+256)%256).toString(16)).slice(-2);}).join('');
  }
  var cssOrder=['Styles_AppFoundation','Styles_Speaking',
    'Styles_SpeakingPart1Runtime','Styles_SpeakingTopicCards',
    'Styles_SpeakingSharedLayout','Styles_SpeakingPart4Runtime',
    'Styles_SpeakingTimer','Styles_SpeakingMemorize','Styles_SpeakingMobile'];
  var jsOrder=['JS_Speaking','JS_SpeakingBootstrap','JS_SpeakingTopicFlow',
    'JS_SpeakingAudioTimer','JS_SpeakingMemorize','JS_SpeakingPart23Flow',
    'JS_SpeakingPart1Flow','JS_SpeakingLearningFlow','JS_SpeakingExamAudio',
    'JS_SpeakingProgressTools'];
  var result={version:'S7.2-STRUCTURE-PARITY-20261023',readOnly:true,
    // User's Apps Script staging snapshot differs from the GitHub source.
    // These must be reconciled separately before Pull; do not confuse
    // GitHub lossless-source parity with real staging deployment parity.
    prePullStagingHashes:{JS_Speaking:'7b568ebe105fa78beaa944a50b7b31ca0c15af479841cf43b3df83732e597575',
      Styles_Speaking:'18a11a03577f166289c0beab43313e32dae21355142ffe675a32e0f859db9ca4'},
    stagingSourceReconciliationRequired:true,
    acceptedSourceHashes:{JS_Speaking:'8c21642fa4b103e84cd5a22630e5ad2bcf1530c2be5f00380abf1727507510fd',
      Styles_Speaking:'9574a0faa9124f5a500380ec9ba8d2bb3b7316d49488bbfeee9fd88f8178f9a9'}};
  try{
    var source=HtmlService.createHtmlOutputFromFile('Index').getContent();
    var coreJS=speakingCombinedJSReadOnly_();
    var coreCSS=speakingCombinedStylesReadOnly_();
    result.currentSourceHashes={JS_Speaking:sha256(coreJS),Styles_Speaking:sha256(coreCSS)};
    test('JSExactlyAccepted',result.currentSourceHashes.JS_Speaking===result.acceptedSourceHashes.JS_Speaking);
    test('CSSExactlyAccepted',result.currentSourceHashes.Styles_Speaking===result.acceptedSourceHashes.Styles_Speaking);
    test('JSValidScriptWrapper',coreJS.slice(0,8)==='<script>'&&coreJS.slice(-9)==='</script>');
    test('CSSValidStyleWrapper',coreCSS.slice(0,7)==='<style>'&&coreCSS.slice(-8)==='</style>');
    test('NoNestedInclude',source.indexOf("speakingCombinedJSReadOnly_()")>=0 &&
      source.indexOf("include('JS_Speaking')")<0);
    var prev=-1;
    cssOrder.forEach(function(n){var pos=source.indexOf("include('"+n+"')");
      test('CSSInclude_'+n,pos>prev);prev=pos;});
    test('JSModulesLoadedExactlyOnce',source.split('speakingCombinedJSReadOnly_()').length===2);
    test('CommonTimerExport',coreJS.indexOf('window.AptisSpeakingTimer')>=0);
    test('CommonMemorizeExport',coreJS.indexOf('window.AptisSpeakingMemorize')>=0);
    test('StartupWatchdog',coreJS.indexOf('LOADER_HARD_TIMEOUT_MS')>=0);
    test('P23TopicRenderer',coreJS.indexOf('function renderP2Unified_()')>=0);
    test('ProgressSaveManualGate',coreJS.indexOf('function saveProgress(')>=0);
    test('CompactTimerStyles',coreCSS.indexOf('.speaking-practice-timer')>=0);
    test('SharedAudioStyles',coreCSS.indexOf('.speaking-audio-controls')>=0);
    test('ResponsiveStyles',coreCSS.indexOf('S7.1 Responsive Design System')>=0);
    result.jsModules=jsOrder.length;result.cssModules=cssOrder.length;
  } catch(err){
    test('ModuleAssemblyAvailable',false,String(err&&err.message||err));
  }
  result.ok=failed.length===0;
  result.passed=checks.length-failed.length;
  result.total=checks.length;
  result.failed=failed;
  result.productionReady=false;
  Logger.log('SPEAKING_S72_MODULE_PARITY_RESULT '+JSON.stringify(result,null,2));
  if(!result.ok)throw new Error('SPEAKING_S72_MODULE_PARITY_FAILED: '+failed.map(function(f){return f.name;}).join(','));
  return result;
}
