/**
 * S6.3 — Compact shared Timer, mode-scoped controls, unchanged durations.
 * READ-ONLY: HTML source inspection only, no Sheet, Media, Properties or writes.
 * Run testSpeakingCompactTimerS63ReadOnly() on isolated Apps Script staging.
 */
function testSpeakingCompactTimerS63ReadOnly(){
 const source=n=>HtmlService.createHtmlOutputFromFile(n).getContent();
 const v=source('ViewSpeaking'),p4v=source('ViewSpeakingPart4');
 const css=source('Styles_Speaking'),j=source('JS_Speaking'),p4j=source('JS_SpeakingPart4');
 const n=(s,re)=>(s.match(re)||[]).length;
 const has=(s,t)=>s.includes(t);
 const config=APP_CONFIG;
 const p123=j.slice(j.indexOf('function p123Timer_()'),j.indexOf('function formatTime(seconds)'));
 const p4=p4j.slice(p4j.indexOf('function p4Timer_()'),p4j.indexOf('const P4_FIXED_PHRASES'));
 const checks={
   p1Duration30:config.PART1_TEST_SECONDS===30&&has(j,'state.data.app.timers.part1 || 30'),
   p2Duration45:config.PART2_TEST_SECONDS===45&&has(j,'state.data.app.timers.part2 || 45'),
   p3Duration45:config.PART3_TEST_SECONDS===45&&has(j,'state.data.app.timers.part3 || 45'),
   p2AndP3PromptScoped:has(j,"state.activePart >= 2 ? item.id + '-' + state.currentPrompt : item.id"),
   p123StartUsesPartDuration:has(p123,'timer.start(currentTimerSeconds());'),
   p123OneClock:has(v,'data-speaking-timer="p123"')&&n(v,/id="timer"/g)===1,
   p4OneClock:has(p4v,'data-speaking-timer="p4"')&&n(p4v,/id="p4Time"/g)===1,
   p4Preparation60:has(p4j,"clock('prep',60)"),
   p4Speaking120:has(p4j,"clock('speak',120)"),
   p4AutomaticPhaseTransition:has(p4,"if(S.phase==='prep')startSpeaking();")&&has(p4,"else if(S.phase==='speak')endSpeaking();"),
   p4ManualSpeakTransition:has(p4j,"if(S.phase==='prep')startSpeaking();"),
   noNewPerQuestionP4Durations:!has(p4j,"clock('speak',45)")&&!has(p4j,"clock('speak',30)"),
   commonSharedTimer:has(j,'window.AptisSpeakingTimer=Object.freeze({')&&has(p4,'window.AptisSpeakingTimer.create(function(snap)'),
   commonClockLeft:has(v,'id="timer" class="timer"')&&v.indexOf('id="timer"')<v.indexOf('class="test-actions speaking-timer-actions"'),
   p4ClockLeft:has(p4v,'id="p4Time" class="timer"')&&p4v.indexOf('id="p4Time"')<p4v.indexOf('class="speaking-timer-actions"'),
   p123ThreeActions:has(v,'id="startTimerBtn"')&&has(v,'id="pauseTimerBtn"')&&has(v,'id="stopTimerBtn"'),
   p4FourActions:has(p4v,'id="p4Begin"')&&has(p4v,'id="p4Next"')&&has(p4v,'id="p4Pause"')&&has(p4v,'id="p4Stop"'),
   noOldP123StatusDOM:!has(v,'id="speakingTimerStage"')&&!has(v,'id="testLabel"'),
   noOldP123InstructionsDOM:!has(v,'id="testInstruction"'),
   noOldP123ProgressDOM:!has(v,'id="timerBar"'),
   noOldP4StatusDOM:!has(p4v,'id="p4Stage"'),
   noOldP4ProgressDOM:!has(p4v,'id="p4TimerBar"'),
   noP4TimerInstructions:!has(p4v,'60 seconds to prepare, then 120 seconds to answer'),
   noOldP123StatusJS:!has(j,"$('speakingTimerStage')")&&!has(j,"$('testInstruction')")&&!has(j,"$('testLabel')"),
   noOldP123BarJS:!has(j,"$('timerBar')"),
   noOldP4StatusJS:!has(p4j,"byId('p4Stage')"),
   noOldP4BarJS:!has(p4j,"byId('p4TimerBar')"),
   sharedTimerRowOwnedByCommonCSS:has(css,'.speaking-shell .speaking-practice-timer{')&&has(css,'flex-direction:row;align-items:center;'),
   sharedTimerActionsRight:has(css,'justify-content:space-between;')&&has(css,'margin-left:auto;'),
   sharedTimerButtons44pxOrEquivalent:has(css,'min-height:42px;')&&has(css,'min-width:88px;'),
   mobileP4ActionGrid:has(css,'[data-speaking-timer="p4"] .speaking-timer-actions{')&&has(css,'grid-template-columns:repeat(2,minmax(0,1fr))'),
   mobileP123ActionLayout:has(css,'[data-speaking-timer="p123"] #startTimerBtn{grid-column:1/-1}'),
   sharedModeVisibilityOwner:n(j,/window\.AptisSpeakingPracticeChrome=Object\.freeze\(/g)===1,
   modeVisibilityNoWrites:has(j,"if(timer)timer.hidden=memorizing;")&&has(j,"if(completion)completion.hidden=memorizing;"),
   p123ModeUsesSharedVisibility:has(j,"window.AptisSpeakingPracticeChrome.sync($('studyView').querySelector('.study-card'),mode)"),
   p4ModeUsesSharedVisibility:has(p4j,'window.AptisSpeakingPracticeChrome?.sync('),
   p4MasteryOnlyLearn:has(p4j,"byId('p4LearningTools').hidden=!learn||isMemorize;"),
   p4VisibilityBeforeAsyncLoad: p4j.indexOf('p4ApplyStudyMode();\n  if(S.mode!==nextMode)load();')>=0,
   p123TimerHiddenStyles:has(css,'.speaking-shell .speaking-practice-timer[hidden],')&&has(css,'display:none!important'),
   p4MasteryHiddenStyles:has(css,'.speaking-shell .speaking-mastery-controls[hidden]'),
   markLearnedStillManual:has(j,"onConfirm:()=>saveProgress(5,'learned')"),
   p4MasteryStillManual:has(p4j,'.saveSpeakingPart4Mastery({questionId:id,level'),
   noTimerSaves:!has(p123,'saveQuestionProgress')&&!has(p4,'saveSpeakingPart4Mastery')&&!has(p4,'saveQuestionProgress'),
   timersPauseResume:has(p123,'function pauseTimer(){p123Timer_().pause();}')&&has(p4j,"if(snap.status==='running')timer.pause();")&&has(p4j,"else if(snap.status==='paused')timer.resume();"),
   noStorageChanges:!has(css,'localStorage')&&!has(p4v,'DATABASE_SPREADSHEET_ID')
 };
 const failed=Object.keys(checks).filter(k=>!checks[k]);
 const result={ok:failed.length===0,totalChecks:Object.keys(checks).length,passed:Object.keys(checks).length-failed.length,failed,expectedSeconds:{part1PerQuestion:30,part2PerQuestion:45,part3PerQuestion:45,part4Preparation:60,part4AllThreeQuestions:120},note:'Read-only source QA, browser mode/timer/mobile QA still required.'};
 console.log('SPEAKING_S63_COMPACT_TIMER_QA_RESULT '+JSON.stringify(result,null,2));
 if(failed.length)throw new Error('S63_TIMER_QA_FAILED: '+failed.join(', '));
 return result;
}