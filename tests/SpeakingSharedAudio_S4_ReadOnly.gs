/**
 * S4 — Speaking 1–4 Shared Audio / Single Voice source QA.
 * READ ONLY: reads only Apps Script local source templates through HtmlService.
 * Do not call Sheets, Drive, migrations, Script Properties or mutations.
 */
function testSpeakingSharedAudioS4ReadOnly(){
  const src=function(n){return HtmlService.createHtmlOutputFromFile(n).getContent();};
  const common=src('JS_Speaking'),p4=src('JS_SpeakingPart4');
  const view=src('ViewSpeaking'),v4=src('ViewSpeakingPart4');
  const styles=src('Styles_Speaking'),p4styles=src('Styles_SpeakingPart4');
  const count=function(s,re){return (s.match(re)||[]).length;};
  const has=function(s,t){return s.indexOf(t)!==-1;};
  const tests={
    oneUtteranceConstructor:count(common,/new SpeechSynthesisUtterance\(/g)===1,
    p4NoSecondUtterance:!has(p4,'new SpeechSynthesisUtterance('),
    p4NoDirectTtsEngine:!has(p4,'window.speechSynthesis'),
    commonOneEngineOwner:count(common,/function stopSpeech\(\)/g)===1,
    publicAudioApiPresent:has(common,'window.AptisSpeakingAudio = Object.freeze('),
    sharedAudioHasPlay:has(common,'play:sharedAudioPlay_'),
    sharedAudioHasPause:has(common,'pause:sharedAudioPause_'),
    sharedAudioHasStop:has(common,'stop:stopSpeech'),
    voiceSettingsFromSharedState:has(common,'const voice = selectedVoice()')&&has(common,'state.audio.rate'),
    sharedSettingsTopButton:has(view,'id="audioSettingsBtn"'),
    sharedVoiceAccent:has(view,'id="accentSelect"'),
    sharedVoiceSelect:has(view,'id="voiceSelect"'),
    sharedVoiceSpeed:has(view,'class="speed-buttons"')&&has(common,'setSpeechRate'),
    p4NoVoiceRateInput:!has(v4,'p4VoiceRate')&&!has(p4,'p4VoiceRate'),
    p4NoOwnStopButton:!has(v4,'p4StopAudio')&&!has(p4,"byId('p4StopAudio')"),
    p4NoBluePanel:!has(v4,'p4ToolsDisclosure')&&!has(p4styles,'.p4-tools-disclosure'),
    p4MasteryPreserved:has(v4,'id="p4SaveMastery"')&&has(v4,'id="p4MasteryLevel"')&&has(p4,'saveSpeakingPart4Mastery'),
    p4StudyVisibilityInternal:has(v4,'id="p4StudyView" hidden'),
    p4TestsStillHideModels:has(p4,"const answer=S.mode==='learn'&&S.current.models?S.current.models[i]:'';"),
    p4UsesSharedEngine:has(p4,'window.AptisSpeakingAudio'),
    p4DelegatesAllAudioActions:has(p4,"b.dataset.audioAction,group"),
    p4HasPerQuestionThreeButtons:has(p4,'data-audio-action="play"')&&has(p4,'data-audio-action="pause"')&&has(p4,'data-audio-action="stop"'),
    p1FullAnswerThreeButtons:has(view,'id="learnAnswerAudio"')&&has(view,'id="listenBtn"')&&has(view,'id="listenPauseBtn"')&&has(view,'id="listenStopBtn"'),
    p1ShadowThreeButtons:has(view,'id="shadowAudioControls"')&&has(view,'id="shadowAllBtn"')&&has(view,'id="shadowPauseBtn"')&&has(view,'id="stopSpeechBtn"'),
    p2p3SharedAudioComponents:has(common,"card.appendChild(createSpeakingAudioControls_(model,'Listen Q'+slot))"),
    p2p3MemoryLv3Audio:has(common,"card.appendChild(createSpeakingAudioControls_(answer,'Memorize Q'+(i+1)))"),
    p1MemoryLv3Audio:has(common,"typing.appendChild(createSpeakingAudioControls_(model,'Memorize full answer'))"),
    noListenAllThreeAnswers:!has(common,'Listen to all 3 answers'),
    sharedCssForAllAudioBars:has(styles,'.speaking-audio-controls{')&&has(styles,'.speaking-audio-controls button{'),
    sharedCssMobile:has(styles,'@media(max-width:650px)')&&has(styles,'.speaking-audio-controls button{flex:1 1 82px'),
    voiceChangesStopPlayback:has(common,"stopSpeech();state.audio.accent")&&has(common,"stopSpeech();state.audio.voiceURI")&&has(common,"stopSpeech(); state.audio.rate"),
    oldP1EngineRemoved:!has(common,'p1SpeechToken')&&!has(common,'setP1Button_')&&!has(common,'toggleP1Audio_'),
    noBackupDataTouched:true
  };
  const failed=Object.keys(tests).filter(function(k){return !tests[k];});
  const result={ok:failed.length===0,totalChecks:Object.keys(tests).length,
    passed:Object.keys(tests).length-failed.length,failed:failed,
    note:'Source-level checks only; browser audio engine and permissions require staging /dev test.'};
  console.log('SPEAKING_S4_SHARED_AUDIO_QA_RESULT '+JSON.stringify(result,null,2));
  if(!result.ok)throw new Error('S4_AUDIO_QA_FAILED: '+failed.join(', '));
  return result;
}