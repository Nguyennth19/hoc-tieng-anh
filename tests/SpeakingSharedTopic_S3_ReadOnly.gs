/**
 * S3 Shared Speaking Topic Detail — READ ONLY QA (staging only).
 * Inspects source from HtmlService without calling Sheets, Properties, migration,
 * media or any save endpoint. Runtime browser acceptance is separate.
 */
function testSpeakingSharedTopicS3ReadOnly() {
  const src = function(name){return HtmlService.createHtmlOutputFromFile(name).getContent();};
  const view=src('ViewSpeaking'), p4=src('ViewSpeakingPart4');
  const shared=src('Styles_Speaking'), p4Css=src('Styles_SpeakingPart4');
  const sharedJs=src('JS_Speaking'), p4Js=src('JS_SpeakingPart4');
  const count=function(s,re){return (s.match(re)||[]).length;};
  const has=function(s,t){return s.indexOf(t)!==-1;};
  const ids=Array.from(new Set(Array.from(p4Js.matchAll(/\bbyId\(['"]([^'"]+)['"]\)/g),function(m){return m[1];})));
  const checks={
    p123StillUsesSharedStudyCard:has(view,'<article class="study-card">'),
    p123SharedHeaderAndNav:has(view,'class="study-topline"')&&has(view,'class="study-top-actions"'),
    p123SharedModeTabs:has(view,'id="speakingModeTabs"')&&has(view,'class="mode-tabs p1-three-steps"'),
    p4OnlyOneTopicDetail:count(p4,/id="p4TopicDetail"/g)===1,
    p4NavReusesSharedHeader:has(p4,'<div class="study-topline">')&&has(p4,'class="study-top-actions"'),
    p4NavUsesSharedButtons:has(p4,'class="secondary-btn study-nav-btn"')&&count(p4,/class="secondary-btn study-nav-btn"/g)===2,
    p4BackToLibraryPreserved:!has(p4,'id="p4BackLibrary"')&&has(p4Js,"if(b.dataset.nav==='part4'){open();}")&&has(p4Js,"p4ShowLibrary_();load();"),
    p4NoDuplicatePageHeader:!has(p4,'class="skill-page-head"')&&!has(p4,'class="part-switch'),
    p4ReusesStudyCard:has(p4,'class="study-card p4-topic-study-card"'),
    p4ReusesBadges:has(p4,'id="p4TopicBadge" class="badge badge-soft"')&&has(p4,'id="p4TopicPosition" class="badge"'),
    p4UsesSharedTopicTitle:has(p4,'id="p4TopicTitle" class="question-title"'),
    p4ReusesThreeModeTabStrip:has(p4,'class="mode-tabs p1-three-steps"')&&count(p4,/data-p4-step="/g)===3,
    p4ModeButtonsUseSharedStyle:count(p4,/class="mode-tab(?: active)?"/g)===3,
    p4OwnModeHandlersRemain:has(p4Js,"document.querySelectorAll('[data-p4-step]')"),
    p4QCardsUseSharedP2P3Rule:has(shared,'.p2-topic-card,.speaking-question-card{'),
    p4QCardsUseSharedHeadingRule:has(shared,'.p2-topic-card h3,.speaking-question-card h3{'),
    p4QCardsRenderedFromSource:has(p4Js,'class="speaking-question-card"')&&has(p4Js,'escapeHtml(q)'),
    sharedTeacherTextClass:has(p4Js,'class="model-text"')&&has(shared,'.model-text{'),
    teacherAnswerFormatterRetained:has(p4Js,'p4AnswerHtml(answer)'),
    p4AudioButtonsUseSharedClass:has(p4Js,'class="speaking-audio-controls"')&&has(p4Js,'data-audio-action="play"')&&has(p4Js,'data-answer='),
    testModeDoesNotRenderModels:has(p4Js,"const answer=S.mode==='learn'&&S.current.models?S.current.models[i]:'';"),
    controlsBelowQuestionCards: p4.indexOf('id="p4LearningTools"')>p4.indexOf('id="p4Content"'),
    masteryButtonsStillPresent:has(p4,'id="p4SaveMastery"')&&has(p4,'id="p4MasteryLevel"'),
    timerControlsPreserved:has(p4,'id="p4Begin"')&&has(p4,'id="p4Next"')&&has(p4,'id="p4Stop"'),
    p4UniqueOnlyCSS:!has(p4Css,'.p4dev .p4-step-btn')&&!has(p4Css,'.p4dev .p4dev-question{')&&!has(p4Css,'.p4dev .p4-topic-heading'),
    p4ModalStylesRetained:has(shared,'.speaking-practice-timer{')&&has(shared,'.speaking-mastery-controls')&&!has(p4Css,'.p4dev .p4dev-time{position:sticky'),
    commonModeEventsAreScoped:count(sharedJs,/\$\$\('#speakingModeTabs \.mode-tab'\)/g)===3&&count(sharedJs,/\$\$\('\.mode-tab'\)/g)===0,
    commonFocusEventsAreScoped:count(sharedJs,/\$\$\('#homeView \.focus-card'\)/g)===1&&count(sharedJs,/\$\$\('\.focus-card'\)/g)===0,
    p4SpecificEventsStillBound:has(p4Js,"document.querySelectorAll('[data-p4-filter]')"),
    p4IdsAreUnique:ids.every(function(id){return count(view+'\n'+p4,new RegExp('id="'+id+'"','g'))===1;})
  };
  const failed=Object.keys(checks).filter(function(k){return !checks[k];});
  const result={ok:failed.length===0,totalChecks:Object.keys(checks).length,
    passed:Object.keys(checks).length-failed.length,failed:failed,part4ClientIds:ids.length,
    note:'Source-level and event scope QA only; actual staging /dev browser QA still required.'};
  console.log('SPEAKING_S3_SHARED_TOPIC_QA_RESULT '+JSON.stringify(result,null,2));
  if(!result.ok)throw new Error('S3_TOPIC_QA_FAILED: '+failed.join(', '));
  return result;
}