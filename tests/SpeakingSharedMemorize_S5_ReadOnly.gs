/**
 * S5 Shared Memorize LV1–LV3 — source-only, read-only regression.
 * NO Google Sheets / Drive / PropertiesService / CacheService / migration calls.
 * Run in an isolated staging Apps Script project after pulling S5.
 */
function testSpeakingSharedMemorizeS5ReadOnly(){
  const src=function(n){return HtmlService.createHtmlOutputFromFile(n).getContent();};
  const common=src('JS_Speaking'),p4=src('JS_SpeakingPart4');
  const view=src('ViewSpeaking'),v4=src('ViewSpeakingPart4');
  const styles=speakingCombinedStylesReadOnly_(),p4styles=src('Styles_SpeakingPart4');
  const includes=function(s,t){return s.indexOf(t)!==-1;};
  const count=function(s,re){return (s.match(re)||[]).length;};
  const checks={
    sharedMemorizeSingleExport:count(common,/window\.AptisSpeakingMemorize=Object\.freeze\(/g)===1,
    sharedPureClozePlanner:includes(common,'function speakingMemorizePlan_('),
    sharedWordRecallScorer:includes(common,'function speakingWordRecallScore_('),
    sharedWordNormalizer:includes(common,'function speakingNormalizeRecall_('),
    sharedPlannerUsesOriginalP2Frequency:includes(common,'Number(level)===1?5:3'),
    sharedPlannerPreservesTextPieces:includes(common,'parts.push({blank:false,text:piece})'),
    sharedPlannerKeepsOriginalWords:includes(common,'parts.push({blank:true,answer:piece})'),
    part1OriginalLevelOneCadence:includes(common,'state.memorizeLevel === 1 ? 5 : 2'),
    part1UsesSharedNormalizer:includes(common,'return speakingNormalizeRecall_(value)'),
    part1UsesSharedWordScore:includes(common,'const score = speakingWordRecallScore_(currentModel(),value)'),
    p2p3UsesSharedClozePlanner:includes(common,'speakingMemorizePlan_(answer,state.memorizeLevel)'),
    p2p3UsesSharedDictationScorer:includes(common,'speakingWordRecallScore_(answer,expected[0].input.value)'),
    p123LevelClickEventsScoped:includes(common,"$$('#memorizeMode .level-btn').forEach(btn => btn.addEventListener"),
    noUnscopedLevelEvents:!includes(common,"$$('.level-btn')"),
    p4ThreeLevelButtons:count(v4,/data-p4-level="/g)===3,
    p4LevelButtonsWithinDedicatedGroup:includes(v4,'id="p4MemorizeLevels"'),
    p4HasOnlyThreeLearningModes:count(v4,/data-p4-step="/g)===3,
    p4IndependentMemorizeState:includes(p4,"studyStep:'learn',memLevel:1"),
    p4DraftsOnlyInClientMemory:includes(p4,'P4_MEM_DRAFTS=Object.create(null)'),
    p4PerQuestionDraftKey:includes(p4,":Q'+(index+1)+':L'+S.memLevel"),
    p4UsesSharedPlanner:includes(p4,'api.plan(answer,S.memLevel)'),
    p4UsesSharedRecallScorer:includes(p4,'api.recallScore(answer,value)'),
    p4UsesSharedNormalizer:includes(p4,'api.normalize(input.value)===api.normalize(plan.blanks[n])'),
    p4LevelOneTwoHaveFillInputs:includes(p4,"input.className='p1-cloze-input'"),
    p4LevelThreeHasDictationTextarea:includes(p4,"area.className='p2-dictation'"),
    p4MemorizeThreeQuestionCards:includes(p4,"(S.current?.questions||[]).forEach((question,i)=>"),
    p4MemoryRendersNoAnswerInitially:includes(p4,"feedback.textContent=answer;")&&includes(p4,'document.createTextNode(piece.text)'),
    p4CheckDoesNotWriteMastery:!includes(p4.slice(p4.indexOf('function p4RenderMemorize_()'),p4.indexOf('function p4RenderStudyCards_()')),'saveSpeakingPart4Mastery'),
    p4CheckDoesNotWriteProgress:!includes(p4.slice(p4.indexOf('function p4RenderMemorize_()'),p4.indexOf('function p4RenderStudyCards_()')),'google.script'),
    p4ExamNeverRendersMemory:includes(p4,"S.mode==='learn'&&S.studyStep==='memorize'"),
    p4ExamDoesNotRenderTeacherAnswers:includes(p4,"const answer=S.mode==='learn'&&S.current.models?S.current.models[i]:'';"),
    p4UsesS4SharedAudioForLV3:includes(p4,"group.className='speaking-audio-controls'")&&includes(p4,'group.dataset.answer=String(index)'),
    p4TestTimerIsNotRewritten:includes(p4,"clock('prep',60)")&&includes(p4,"clock('speak',120)"),
    p4TeacherFormatterStillPreserved:includes(p4,'function p4FormulaHtml(raw)')&&includes(p4,'function p4AnswerHtml(answer)'),
    p4MasteryControlStillPresent:includes(v4,'id="p4SaveMastery"')&&includes(v4,'id="p4MasteryLevel"'),
    p4MasteryApiStillPresent:includes(p4,'saveSpeakingPart4Mastery({questionId:id,level'),
    p4AudioTopSettingsRemainOnly:includes(view,'id="audioSettingsBtn"')&&!includes(v4,'p4VoiceRate'),
    p4NoDuplicateMemorizeCSS:!includes(p4styles,'.p4-memorize-levels')&&includes(styles,'.p4-memorize-levels'),
    mobileLevelControlsStyle:includes(styles,'.p4-memorize-levels .level-btn{flex:1 1 100%'),
    speakingNoExtraBackendCalls:!includes(p4.slice(p4.indexOf('function p4RenderMemorize_()'),p4.indexOf('function p4RenderStudyCards_()')),'getSpeakingPart4Dev'),
    testTemplateReadOnly:true
  };
  const failed=Object.keys(checks).filter(function(k){return !checks[k];});
  const result={ok:failed.length===0,totalChecks:Object.keys(checks).length,
    passed:Object.keys(checks).length-failed.length,failed:failed,
    note:'Source-only checks, not a substitute for browser/browser-audio QA.'};
  console.log('SPEAKING_S5_SHARED_MEMORIZE_QA_RESULT '+JSON.stringify(result,null,2));
  if(!result.ok)throw new Error('S5_MEMORIZE_SOURCE_QA_FAILED: '+failed.join(', '));
  return result;
}
