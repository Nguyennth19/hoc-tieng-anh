/**
 * S6.3 — Shared Compact Timer & Mode Visibility.
 * READ-ONLY: source inspection only. Run on isolated Apps Script staging.
 * Does NOT call Sheets, Drive, network or any save function.
 */
function testSpeakingCompactTimerS63ReadOnly(){
  const src=name=>HtmlService.createHtmlOutputFromFile(name).getContent();
  const common=src('JS_Speaking'),p4=src('JS_SpeakingPart4');
  const v=src('ViewSpeaking'),v4=src('ViewSpeakingPart4');
  const css=speakingCombinedStylesReadOnly_(),p4css=src('Styles_SpeakingPart4');
  const has=(s,t)=>s.includes(t);
  const n=(s,re)=>(s.match(re)||[]).length;
  const viewTimer=v.slice(v.indexOf('id="speakingPracticeTimer"'),v.indexOf('id="speakingPracticeTimer"')+800);
  const viewP4Timer=v4.slice(v4.indexOf('id="p4PracticeTimer"'),v4.indexOf('id="p4PracticeTimer"')+820);
  const mode=common.slice(common.indexOf('function setMode(mode) {'),common.indexOf('function setMemorizeLevel(level)'));
  const p4Modes=p4.slice(p4.indexOf('function p4ApplyStudyMode(){'),p4.indexOf('function p4ApplyMastery_('));
  const timerCommon=common.slice(common.indexOf('let speakingMainPracticeTimer_=null;'),common.indexOf('function formatTime(seconds)'));
  // Timer lifecycle spans named functions; never use a mutable comment marker.
  // Do not silently turn a missing anchor into a whole-file substring.
  const p4ScopeStart=/\bfunction\s+p4Timer_\s*\(\s*\)\s*\{/.exec(p4);
  const p4ScopeEnd=/\bfunction\s+p4FormulaHtml\s*\(/.exec(p4);
  const timerP4=p4ScopeStart && p4ScopeEnd && p4ScopeEnd.index>p4ScopeStart.index
    ? p4.slice(p4ScopeStart.index,p4ScopeEnd.index) : null;
  const checks={
    commonEngineRetained:has(common,'window.AptisSpeakingTimer=Object.freeze({')&&has(p4,'window.AptisSpeakingTimer.create(function(snap)'),
    durationsUnchanged:has(common,'part1:30,part2:45,part3:45,part4Preparation:60,part4Speaking:120'),
    part123TimeUsesPerPartConfig:has(common,'function currentTimerSeconds()')&&has(common,'state.data.app.timers.part1 || 30')&&has(common,'state.data.app.timers.part2 || 45')&&has(common,'state.data.app.timers.part3 || 45'),
    part123TimerStartsForCurrentQuestion:has(common,'timer.start(currentTimerSeconds())'),
    part123QSelectionIndependent:has(common,'state.currentPrompt=i+1;')&&has(common,'resetTimerDisplay();'),
    part4PreparationExactly60:has(p4,"clock('prep',60)"),
    part4SpeakingExactly120:has(p4,"clock('speak',120)"),
    part4PrepAutoTransitions:has(timerP4,"if(S.phase==='prep')startSpeaking();"),
    part4SpeakingEndsOnce:has(timerP4,"else if(S.phase==='speak')endSpeaking();"),
    part4PrepStopNeverSaves:has(timerP4,"status('Preparation cancelled. No attempt or Mastery was saved.')"),
    timerFactoryStillDeadlineBased:has(common,'Date.now()-startedAt'),
    timerFactoryStillPauses:has(common,"function pause_(){")&&has(common,"remainingMs=currentRemaining_();"),
    timerFactoryStillResumes:has(common,"function resume_(){")&&has(common,"startedAt=Date.now()"),
    timerFactoryStillStops:has(common,"function stop_(reset){"),
    p123TimeCellFirst:viewTimer.indexOf('id="timer"')>=0&&viewTimer.indexOf('id="timer"')<viewTimer.indexOf('class="speaking-timer-actions"'),
    p4TimeCellFirst:viewP4Timer.indexOf('id="p4Time"')>=0&&viewP4Timer.indexOf('id="p4Time"')<viewP4Timer.indexOf('class="speaking-timer-actions"'),
    p123ThreeActionButtons:n(viewTimer,/id="(?:startTimerBtn|pauseTimerBtn|stopTimerBtn)"/g)===3,
    p4FourActions:n(viewP4Timer,/id="(?:p4Begin|p4Next|p4Pause|p4Stop)"/g)===4,
    p123NoStatusOrBar:!has(v,'id="testLabel"')&&!has(v,'id="testInstruction"')&&!has(v,'id="speakingTimerStage"')&&!has(v,'id="timerBar"'),
    p4NoStatusOrBar:!has(v4,'id="p4Stage"')&&!has(v4,'id="p4TimerBar"')&&!has(v4,'class="test-instruction"'),
    p4RedundantDisclaimerGone:!has(v4,'class="p4dev-disclaimer"'),
    noOrphanCommonRemovedDomRefs:!has(common,"$('testLabel')")&&!has(common,"$('testInstruction')")&&!has(common,"$('speakingTimerStage')")&&!has(common,"$('timerBar')"),
    noOrphanP4RemovedDomRefs:!has(p4,"byId('p4Stage')")&&!has(p4,"byId('p4TimerBar')"),
    timerUsesSharedGrid:has(css,'.speaking-practice-timer{')&&has(css,'grid-template-columns:max-content minmax(0,1fr)'),
    rightAlignedActions:has(css,'.speaking-timer-actions{')&&has(css,'justify-content:flex-end'),
    compactClock:has(css,'.speaking-practice-timer .timer{')&&has(css,'font-variant-numeric:tabular-nums'),
    noTimerBarCSSOverride:!has(css,'.speaking-practice-timer .timer-bar{'),
    hiddenTimerWinsDisplayGrid:has(css,'.speaking-practice-timer.hidden,')&&has(css,'.speaking-practice-timer[hidden]{display:none!important}'),
    narrowMobileTwoColumnActions:has(css,'grid-template-columns:repeat(2,minmax(0,1fr))')&&has(css,'@media(max-width:650px)'),
    mobileNoButtonOverflow:has(css,'min-width:0;')&&has(css,'overflow-wrap:anywhere;'),
    p4DoesNotOverrideSharedTimer:!has(p4css,'.p4dev .p4dev-time{'),
    p123MemoryHidesTimer:has(mode,"$('speakingPracticeTimer').classList.toggle('hidden',mode==='memorize');"),
    p123MemoryHidesCompletion:has(mode,"$('markLearnedBtn').closest('.speaking-completion-actions').classList.toggle('hidden',mode==='memorize');"),
    p123MemoryStopsRunningClock:has(mode,'if (state.currentMode !== mode) {stopSpeech();stopTimer(true);}'),
    p123LearnTestRestoreTimer:has(mode,"classList.toggle('hidden',mode==='memorize')"),
    p4MemoryHidesTimer:has(p4Modes,"byId('p4PracticeTimer').hidden=memorizing;"),
    p4MemoryHidesMastery:has(p4Modes,"byId('p4LearningTools').hidden=!learn||memorizing;"),
    p4FinishedReviewHiddenOnlyInMemory:has(p4Modes,"byId('p4Review').hidden=memorizing||S.phase!=='done'||!S.current||!S.session;"),
    p4ChangingModesStopsActiveClock:has(p4,"if(['prep','speak'].includes(S.phase))"),
    p123StillManualConfirm:has(common,"onConfirm:()=>saveProgress(5,'learned')"),
    p4StillManualMastery:has(p4,".saveSpeakingPart4Mastery({questionId:id,level"),
    part4AttemptOnlyExplicit:has(p4,"byId('p4Save').addEventListener('click'")&&has(p4,'.saveSpeakingPart4DevAttempt({'),
    p123TimeHasNoWrites:!has(timerCommon,'.saveQuestionProgress('),
    p4TimerHasNoWrites:timerP4!==null &&
      !/\.saveSpeakingPart4Mastery\s*\(/.test(timerP4) &&
      !/\.saveSpeakingPart4DevAttempt\s*\(/.test(timerP4),
    p4ReviewManualSaveOnly:has(v4,'id="p4Save"')&&has(v4,'id="p4Rating"')
  };
  const failed=Object.keys(checks).filter(k=>!checks[k]);
  const result={ok:failed.length===0,totalChecks:Object.keys(checks).length,
    passed:Object.keys(checks).length-failed.length,failed,
    timings:{part1SecondsPerQuestion:30,part2SecondsPerQuestion:45,part3SecondsPerQuestion:45,part4PreparationSeconds:60,part4SpeakingSecondsAcrossThreeQuestions:120},
    p4TimerDiagnostic:{scopeFound:timerP4!==null,scopeLength:timerP4?timerP4.length:-1,
      startFound:Boolean(p4ScopeStart),endFound:Boolean(p4ScopeEnd)},
    note:'Source QA only. Browser countdown, pause/resume and responsive visual acceptance are separate.'};
  console.log('SPEAKING_S63_COMPACT_TIMER_QA_RESULT '+JSON.stringify(result,null,2));
  if(failed.length)throw new Error('S63_COMPACT_TIMER_QA_FAILED: '+failed.join(', '));
  return result;
}