/**
 * S7.2 lossless Speaking P1–P3 client runtime assembly.
 * All 9 fragments are stored as HTML files with script wrappers.
 * Assemble their inner content into ONE <script> tag so the original IIFE,
 * function scope and execution order remain BYTE-FOR-BYTE unchanged.
 * Fail closed on a missing file — never silently leave an infinite spinner.
 */
function speakingCombinedJSReadOnly_() {
  var modules=[
    'JS_Speaking','JS_SpeakingBootstrap','JS_SpeakingTopicFlow',
    'JS_SpeakingAudioTimer','JS_SpeakingMemorize','JS_SpeakingPart23Flow',
    'JS_SpeakingPart1Flow','JS_SpeakingLearningFlow','JS_SpeakingExamAudio',
    'JS_SpeakingProgressTools'
  ];
  var combined=modules.map(function(name){
    var html=HtmlService.createHtmlOutputFromFile(name).getContent();
    if(html.slice(0,8)!=='<script>'||html.slice(-9)!=='</script>') {
      throw new Error('SPEAKING_JS_MODULE_INVALID: '+name);
    }
    return html.slice(8,-9);
  }).join('');
  if(combined.indexOf("window.AptisSpeakingMemorize")<0 ||
     combined.indexOf("function createSpeakingContentCache_")<0 ||
     combined.indexOf("function init()")<0) {
    throw new Error('SPEAKING_JS_MODULE_INCOMPLETE: missing mandatory bootstrap or Memorize');
  }
  return '<script>'+combined+'</script>';
}
