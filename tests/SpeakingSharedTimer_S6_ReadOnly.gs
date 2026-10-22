/**
 * S6 — Shared Timer & Manual Completion source regression.
 * READ-ONLY: only reads local HTML templates; no Sheets/Drive/ScriptProperties.
 * On isolated staging, run testSpeakingSharedTimerS6ReadOnly().
 */

/** Extract an entire named function. Fails closed if boundaries are invalid. */
function s6QaFunction_(source,name){
  const match=new RegExp('\\bfunction\\s+'+name+'\\s*\\(').exec(source);
  if(!match)return null;
  const start=source.indexOf('{',match.index+match[0].length);
  if(start<0)return null;
  let depth=0,mode='',escape=false,quote='';
  for(let i=start;i<source.length;i++){
    const c=source[i],n=source[i+1];
    if(mode==='line'){if(c==='\n')mode='';continue;}
    if(mode==='block'){if(c==='*'&&n==='/'){mode='';i++;}continue;}
    if(mode==='quote'){
      if(escape){escape=false;continue;}
      if(c==='\\'){escape=true;continue;}
      if(c===quote)mode='';
      continue;
    }
    if(c==='/'&&n==='/'){mode='line';i++;continue;}
    if(c==='/'&&n==='*'){mode='block';i++;continue;}
    if(c==="'"||c==='"'){mode='quote';quote=c;continue;}
    if(c==='{')depth++;
    if(c==='}'){
      depth--;
      if(depth===0)return source.slice(match.index,i+1);
      if(depth<0)return null;
    }
  }
  return null;
}
function s6QaForbiddenWrites_(text){
  return /\bgoogle\s*\.\s*script\s*\.\s*run\b|\b(?:saveProgress|saveAttempt|saveQuestionProgress|saveSpeakingPart4Mastery|saveSpeakingPart4DevAttempt)\s*\(/.test(text||'');
}
/** Zero writes. Compares staging file boundaries, not production data. */
function diagnoseSpeakingSharedTimerS6ReadOnly(){
  const c=HtmlService.createHtmlOutputFromFile('JS_Speaking').getContent();
  const p=HtmlService.createHtmlOutputFromFile('JS_SpeakingPart4').getContent();
  const names=['p4Timer_','stopClock','clock','startSpeaking','endSpeaking'];
  const found=Object.fromEntries(names.map(n=>[n,Boolean(s6QaFunction_(p,n))]));
  const commonFn=s6QaFunction_(c,'createSpeakingPracticeTimer_');
  const p4Fns=names.map(n=>s6QaFunction_(p,n)).filter(Boolean).join('\n');
  const result={
    readOnly:true,
    sourceLengths:{JS_Speaking:c.length,JS_SpeakingPart4:p.length},
    formerCommentAnchors:{
      commonEndIndex:c.indexOf('/* Shared confirmation UI,'),
      part4EndIndex:p.indexOf('/** Highlight only approved')
    },
    functionExtraction:{commonFactory:Boolean(commonFn),part4:found},
    forbiddenWriteTokensInTimerFunctions:{
      common:commonFn?s6QaForbiddenWrites_(commonFn):null,
      part4:names.every(n=>found[n])?s6QaForbiddenWrites_(p4Fns):null
    },
    note:'A -1 formerCommentAnchors value indicates the old comment-boundary QA could falsely include unrelated save handlers.'
  };
  console.log('SPEAKING_S6_SOURCE_DIAGNOSTIC '+JSON.stringify(result,null,2));
  return result;
}

function testSpeakingSharedTimerS6ReadOnly(){
  const src=function(n){return HtmlService.createHtmlOutputFromFile(n).getContent();};
  const common=src('JS_Speaking'),p4=src('JS_SpeakingPart4');
  const view=src('ViewSpeaking'),v4=src('ViewSpeakingPart4');
  const styles=src('Styles_Speaking'),p4Styles=src('Styles_SpeakingPart4');
  const has=function(s,t){return s.indexOf(t)!==-1;};
  const count=function(s,re){return (s.match(re)||[]).length;};
  const commonTimer=s6QaFunction_(common,'createSpeakingPracticeTimer_')||'';
  const p4TimerNames=['p4Timer_','stopClock','clock','startSpeaking','endSpeaking'];
  const p4TimerPieces=p4TimerNames.map(n=>s6QaFunction_(p4,n));
  const p4Timer=p4TimerPieces.filter(Boolean).join('\n');
  const timerFunctionsFound=Boolean(commonTimer)&&p4TimerPieces.every(Boolean);
  const p4Save=p4.slice(p4.indexOf("byId('p4SaveMastery').addEventListener"),p4.indexOf("document.querySelectorAll('[data-p4-step]')",p4.indexOf("byId('p4SaveMastery').addEventListener")));
  const checks={
    sharedTimerExportedOnce:count(common,/window\.AptisSpeakingTimer=Object\.freeze\(/g)===1,
    timerFactorySingleSource:has(commonTimer,'function createSpeakingPracticeTimer_('),
    timerFactoryDoesNotWrite:Boolean(commonTimer)&&!s6QaForbiddenWrites_(commonTimer),
    timerUsesDeadlineDifference:has(commonTimer,'Date.now()-startedAt'),
    timerPausePreservesRemaining:has(commonTimer,'remainingMs=currentRemaining_()'),
    timerResumeUsesRemaining:has(commonTimer,"phase='running';notify()"),
    timerCompletesOnce:has(commonTimer,"if(phase!=='running')return;"),
    timersCancelPrevious:has(commonTimer,"speakingActiveTimer_!==api)speakingActiveTimer_.stop(true)"),
    sharedClockOffersStopActive:has(common,'stopActive:function(){if(speakingActiveTimer_)speakingActiveTimer_.stop(true);}'),
    part4EntryStopsOldClock:has(p4,'window.AptisSpeakingTimer?.stopActive?.();'),
    sharedPartDurations:has(common,'part1:30,part2:45,part3:45,part4Preparation:60,part4Speaking:120'),
    part123UsesSharedTimer:has(common,"window.AptisSpeakingTimer.create(function(snap)"),
    part123PauseAndResume:has(common,'function pauseTimer(){p123Timer_().pause();}')&&has(common,"timer.snapshot().status==='paused')timer.resume()"),
    part123NoOldInterval:!has(common,'state.timerId = setInterval'),
    part123TimerNotOnlyInsideTest:view.indexOf('id="timer"')>view.indexOf('id="testMode"')&&view.indexOf('id="timer"')<view.indexOf('<footer class="study-footer'),
    part123ThreeButtons:has(view,'id="startTimerBtn"')&&has(view,'id="pauseTimerBtn"')&&has(view,'id="stopTimerBtn"'),
    part123TimelineDisplayed:has(view,'id="timerBar"')&&has(view,'id="speakingTimerStage"'),
    part123StopNeverAutoSaves:!has(common.slice(common.indexOf('function startTimer()'),common.indexOf('function formatTime(seconds)')),'saveQuestionProgress'),
    part123CompletionOnlyShowsReview:has(common,"$('selfCheck').classList.remove('hidden')"),
    part123ProgressSaveKept:has(common,'.saveQuestionProgress({')&&has(common,"saveProgress(5,'learned')"),
    part4UsesSameTimerFactory:has(p4Timer,'window.AptisSpeakingTimer.create(function(snap)'),
    part4Preparation60:has(p4,"clock('prep',60)"),
    part4Speaking120:has(p4,"clock('speak',120)"),
    part4TwoPhaseFlow:has(p4Timer,"if(S.phase==='prep')startSpeaking();")&&has(p4Timer,"else if(S.phase==='speak')endSpeaking();"),
    part4PauseResume:has(p4,"byId('p4Pause').addEventListener")&&has(p4,"timer.resume()"),
    part4NoOwnInterval:!has(p4,'S.timer=setInterval')&&!has(p4,'S.deadline'),
    part4PrepStopNotDone:has(p4Timer,"status('Preparation cancelled. No attempt or Mastery was saved.')"),
    part4StopDoesNotSave:timerFunctionsFound&&!s6QaForbiddenWrites_(p4Timer),
    part4TimerHasThreeControlsPlusNext:has(v4,'id="p4Begin"')&&has(v4,'id="p4Next"')&&has(v4,'id="p4Pause"')&&has(v4,'id="p4Stop"'),
    part4TimerHasSameBar:has(v4,'id="p4TimerBar" class="timer-bar-fill"')&&has(v4,'class="p4dev-time speaking-practice-timer"'),
    sharedTimerCSS:has(styles,'.speaking-practice-timer{')&&has(styles,'.speaking-timer-actions{'),
    noP4StickyTimerCSS:!has(p4Styles,'.p4dev .p4dev-time{position:sticky'),
    timerMobileCSS:has(styles,'.speaking-timer-actions button{flex:1 1 120px'),
    confirmationModalOneInstance:count(view,/id="speakingCompletionDialog"/g)===1,
    confirmationSourceOwner:has(common,'window.AptisSpeakingCompletion=Object.freeze('),
    confirmationRequiresExplicitCallback:has(common,"if(typeof accept==='function')accept()"),
    part123MarksOnlyAfterConfirmation:has(common,"confirmLabel:'✓ Mark learned'")&&has(common,"onConfirm:()=>saveProgress(5,'learned')"),
    part4MasteryRequiresConfirmation:has(p4Save,"confirmLabel:'Save mastery'")&&has(p4Save,'onConfirm:()=>{'),
    part4MasterySaveBackendUnchanged:has(p4Save,".saveSpeakingPart4Mastery({questionId:id,level"),
    part4AvoidsStaleTopicSave:has(p4Save,"if(S.current?.id!==id||S.mode!=='learn')return;"),
    part4AttemptSaveStillExplicit:has(p4,"byId('p4Save').addEventListener('click'")&&has(p4,'.saveSpeakingPart4DevAttempt({'),
    part4MasteryDropdownStillAvailable:has(v4,'id="p4MasteryLevel"')&&has(v4,'id="p4SaveMastery"'),
    part4MemoryAndTeacherUnchanged:has(p4,'function p4RenderMemorize_()')&&has(p4,'function p4AnswerHtml(answer)'),
    sharedAudioStillAvailable:has(common,'window.AptisSpeakingAudio = Object.freeze('),
    sourceTestNoBackendCalls:true
  };
  const failed=Object.keys(checks).filter(function(k){return !checks[k];});
  const result={ok:failed.length===0,totalChecks:Object.keys(checks).length,
    passed:Object.keys(checks).length-failed.length,failed:failed,
    sourceBoundaryDiagnostics:{
      commonFactoryExtracted:Boolean(commonTimer),
      part4FunctionsExtracted:p4TimerNames.filter((_,i)=>Boolean(p4TimerPieces[i])),
      formerCommentAnchors:{common:common.indexOf('/* Shared confirmation UI,'),part4:p4.indexOf('/** Highlight only approved')}
    },
    note:'Read-only code-scoped QA independent of comment anchors. Browser QA still required.'};
  console.log('SPEAKING_S6_SHARED_TIMER_QA_RESULT '+JSON.stringify(result,null,2));
  if(!result.ok)throw new Error('S6_TIMER_SOURCE_QA_FAILED: '+failed.join(', '));
  return result;
}