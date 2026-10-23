/**
 * S7.2 read-only composition of Speaking CSS in the precise shipped cascade
 * order. Only QA tools should call this; actual HTML is included in Index.html.
 * Each component has an independent <style> wrapper for Apps Script.
 */
function speakingCombinedStylesReadOnly_() {
  var names=[
    'Styles_AppFoundation','Styles_Speaking','Styles_SpeakingPart1Runtime',
    'Styles_SpeakingTopicCards','Styles_SpeakingSharedLayout',
    'Styles_SpeakingPart4Runtime','Styles_SpeakingTimer',
    'Styles_SpeakingMemorize','Styles_SpeakingMobile'
  ];
  var all=names.map(function(name) {
    var html=HtmlService.createHtmlOutputFromFile(name).getContent();
    if(!/^<style>/.test(html)||!/<\/style>$/.test(html))
      throw new Error('SPEAKING_CSS_BUNDLE_INVALID: '+name);
    return html.slice(7,-8);
  }).join('');
  return '<style>'+all+'</style>';
}
