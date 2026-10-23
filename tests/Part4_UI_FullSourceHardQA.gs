/**
 * UI-01B Part 4 full-source, READ-ONLY regression gate (staging only).
 * Uses Apps Script source assets; does NOT open Sheets, Drive, Script Properties,
 * call migrations, or perform writes.
 */
function testPart4FullSourceHardQAReadOnly() {
  const source = function(name) { return HtmlService.createHtmlOutputFromFile(name).getContent(); };
  const index = source('Index');
  const speaking = source('ViewSpeaking');
  const p4 = source('ViewSpeakingPart4');
  const js = source('JS_SpeakingPart4');
  const commonJs = speakingCombinedJSReadOnly_();
  const style = source('Styles_SpeakingPart4');
  const commonStyle = source('Styles_Speaking');
  const ids = {};
  const idPattern = /\bid="([^"]+)"/g;
  [speaking, p4].forEach(function(markup) {
    let match;
    while ((match = idPattern.exec(markup))) ids[match[1]] = (ids[match[1]] || 0) + 1;
    idPattern.lastIndex = 0;
  });
  const refs = Array.from(new Set(Array.from(js.matchAll(/\bbyId\(['"]([^'"]+)['"]\)/g), function(m){return m[1];})));
  const checks = {
    indexIncludesP4ExactlyOnce: (index.match(/include\('ViewSpeakingPart4'\)/g) || []).length === 1,
    noNestedTemplateInViewSpeaking: speaking.indexOf("include('ViewSpeakingPart4')") === -1,
    p4RootPresent: p4.indexOf('id="speakingPart4Future"') >= 0,
    sharedShellPresent: speaking.indexOf('class="skill-shell speaking-shell app-shell"') >= 0,
    mountHelperPresent: js.indexOf('function p4MountInsideSpeaking_()') >= 0,
    mountBeforeBinding: js.indexOf('if(!p4MountInsideSpeaking_())') >= 0,
    moduleAndDetailPresent: p4.indexOf('id="p4TopicLibrary"') >= 0 && p4.indexOf('id="p4TopicDetail"') >= 0,
    referencedIdsExist: refs.every(function(id){return ids[id] === 1;}),
    noDuplicateIds: Object.keys(ids).every(function(id){return ids[id] === 1;}),
    sharedHeroAndStats: p4.indexOf('class="welcome-card"') >= 0 && p4.indexOf('class="focus-grid"') >= 0 && p4.indexOf('class="library-section"') >= 0,
    sharedFiveColumnNav: commonStyle.indexOf('repeat(5,minmax(0,1fr))') >= 0,
    part1To3HandlersExcludeP4: (commonJs.match(/\$\$\('\.part-tab\[data-part\]'\)/g) || []).length === 3 && (commonJs.match(/(?<!\$)\$\('\.part-tab\[data-part\]'\)\.forEach/g) || []).length === 0 && commonJs.indexOf("$$('.part-tab')") === -1,
    libraryLoadingErrorVisible: p4.indexOf('id="p4LibraryStatus"') >= 0 && js.indexOf("byId('p4LibraryStatus')") >= 0,
    noLegacyP4HomeCSS: style.indexOf('.p4-unified-switch') === -1 && style.indexOf('max-width:1020px') === -1,
    noAutoHideModelOnSpeaking: js.indexOf("if(S.mode==='learn')byId('p4StudyView').value='recall'") === -1,
    validatedContentCache: js.indexOf('function p4ValidContent_(') >= 0 && js.indexOf('data.isDev!==true') >= 0 && js.indexOf('window.AptisSpeakingCache') >= 0 && js.indexOf('P4_CONTENT_CACHE') === -1,
    teacherAndMasteryWiringRetained: js.indexOf('saveSpeakingPart4Mastery') >= 0 && js.indexOf('saveSpeakingPart4DevAttempt') >= 0
  };
  const issues = Object.keys(checks).filter(function(k){return !checks[k];});
  const result = {ok: issues.length === 0, checks:checks, issues:issues, inspectedClientIds:refs.length, evaluatedOn:'STAGING_SOURCE_READ_ONLY'};
  console.log('P4_UI_FULL_SOURCE_HARD_QA_RESULT '+JSON.stringify(result,null,2));
  if(!result.ok)throw new Error('P4_UI_HARD_QA_FAIL: '+issues.join(', '));
  return result;
}
