/**
 * S6.2 — Unified Speaking width and Topic Detail header.
 * READ-ONLY source + viewport box-model smoke QA; NO Sheets/Drive/network/writes.
 * Staging: run testSpeakingSharedLayoutS62ReadOnly().
 */
function testSpeakingSharedLayoutS62ReadOnly(){
  const src=name=>HtmlService.createHtmlOutputFromFile(name).getContent();
  const shared=src('Styles_Speaking');
  const p4Css=src('Styles_SpeakingPart4');
  const global=src('Styles');
  const view=src('ViewSpeaking');
  const v4=src('ViewSpeakingPart4');
  const js=src('JS_SpeakingPart4');
  const app=src('Index');
  const count=(s,re)=>(s.match(re)||[]).length;
  const has=(s,t)=>s.includes(t);
  const widths=[320,390,768,1024,1440,1680].map(viewport=>{
    const stage=Math.min(viewport,1440);
    const pad=viewport<=600?10:viewport<=900?14:24;
    const available=stage-2*pad;
    const frame=Math.min(available,1392);
    return {viewport,stage,pad,frame,overflow:frame>available||frame>1392};
  });
  const checks={
    globalStageUnchanged:has(global,'.global-stage{width:100%;max-width:1440px;margin:0 auto;padding:28px 24px 90px}'),
    globalFrameUnchanged:has(global,':root{--skill-content-max:1120px}')&&count(global,/\.skill-content-frame\s*\{/g)===1,
    speakingWideFrameOwnsOverride:has(shared,'.speaking-shell{\n  --skill-content-max:1392px;'),
    speakingDoesNotModifyOtherSkills:!has(global,'--skill-content-max:1392px;'),
    speakingFrameNoPadding:has(shared,'.speaking-shell .skill-content-frame{')&&has(shared,'width:min(100%,var(--skill-content-max))'),
    speakingFrameSharesGlobalGutters:has(shared,'max-width:var(--skill-content-max);')&&has(shared,'margin-inline:auto;'),
    noP4SpecificWidthOverride:!has(p4Css,'max-width:1020px')&&!has(p4Css,'max-width:1120px')&&!has(p4Css,'calc(100% - 32px)'),
    p4LibraryAndDetailUseSharedFrame:has(v4,'id="speakingPart4Future" class="p4dev hidden skill-content-frame"')&&has(p4Css,'.p4dev .p4-topic-library,.p4dev .p4-topic-detail{min-width:0;box-sizing:border-box}'),
    p123MainUsesSharedFrame:has(view,'class="speaking-main skill-content-frame"'),
    speakingHeaderUsesSharedFrame:has(view,'class="skill-page-head skill-content-frame"'),
    fourTabsUseSharedFrame:has(view,'class="part-switch shared-part-switch skill-content-frame"'),
    noDuplicateP4PageHeading:!has(v4,'class="skill-page-head"')&&!has(v4,'class="part-switch'),
    onlyOneSharedFourPartSelector:count(view,/class="part-tab(?: active)?"/g)===4&&count(v4,/class="part-tab(?: active)?"/g)===0,
    partSelectorHiddenInP123Detail:has(shared,'.speaking-shell:not(.p4-mode):has(#homeView:not(.hidden)) .shared-part-switch,'),
    partSelectorVisibleOnlyP4Library:has(shared,'.speaking-shell.p4-mode:not(.p4-detail-mode) .shared-part-switch{display:grid}'),
    p4DetailSetsOwnerClass:has(js,"qs('.speaking-shell')?.classList.add('p4-detail-mode');"),
    p4LibraryClearsOwnerClass:has(js,"qs('.speaking-shell')?.classList.remove('p4-detail-mode');"),
    p4CloseClearsBothClasses:has(js,"shell.classList.remove('p4-mode','p4-detail-mode')"),
    p4ModeNoGenericElementHide:has(shared,'.speaking-shell.p4-mode > .speaking-main{display:none!important}')&&!has(p4Css,'.p4-mode > :not('),
    p4DetailOnlySharedPrevNext:has(v4,'class="study-topline"')&&count(v4,/class="secondary-btn study-nav-btn"/g)===2,
    p4NoRedundantBackLink:!has(v4,'id="p4BackLibrary"')&&!has(js,"byId('p4BackLibrary')"),
    p4BackViaSharedPart4Nav:has(js,"if(b.dataset.nav==='part4'){open();}")&&has(js,'window.scrollTo(0,0);p4ShowLibrary_();load();'),
    p4PrevNextEventsRetained:has(js,"byId('p4PrevTopic').addEventListener('click',()=>p4MoveTopic_(-1))")&&has(js,"byId('p4NextTopic').addEventListener('click',()=>p4MoveTopic_(1))"),
    p4PrevNextEdgeDisabled:has(js,"byId('p4PrevTopic').disabled=i===0;")&&has(js,"byId('p4NextTopic').disabled=i===total-1;"),
    sharedDetailHeaderSpacing:has(shared,'.speaking-shell .study-topline{')&&has(shared,'margin:0 0 10px;'),
    sharedPrevNextButtonGeometry:has(shared,'.speaking-shell .study-top-actions .study-nav-btn{')&&has(shared,'min-height:44px;'),
    p4RemovedLegacyBackOverrides:!has(p4Css,'.p4dev .study-topline #p4BackLibrary'),
    p4RemovedMobileNavOverride:!has(p4Css,'.p4dev .study-top-actions{')&&!has(p4Css,'.p4dev .study-topline{flex-wrap:wrap}'),
    p4RemovedLegacyTimerOverride:!has(p4Css,'.p4dev .p4dev-time{position:relative'),
    p4KeepsOnlyUniqueTopicCardCSS:has(p4Css,'.p4dev .p4-topic-card{')&&has(p4Css,'.p4dev .p4-topic-grid{'),
    sharedFourPartMobileSelector:has(shared,'@media(max-width:650px)')&&has(shared,'.speaking-shell .shared-part-switch .part-tab small{font-size:10px}'),
    sharedDetailMobileNav:has(shared,'.speaking-shell .study-top-actions .study-nav-btn{min-width:0;max-width:9rem}'),
    noNestedMain:count(app,/<main\b/g)===1&&count(view,/<main\b/g)===0,
    p4NoNewDataOrMasteryCalls:has(js,'.getSpeakingPart4Dev(mode)')&&has(js,'.getSpeakingPart4Mastery()')&&has(js,'.saveSpeakingPart4Mastery({'),
    viewportWidthsExpected:widths.map(x=>x.frame).join(',')==='300,370,740,976,1392,1392',
    viewportNoOverflow:widths.every(x=>!x.overflow),
    p4QuestionBankUntouched:has(v4,'id="p4Content"')&&has(v4,'id="p4TopicCards"'),
    sharedBottomNavigationFive:count(view,/class="nav-btn"/g)===5
  };
  const failed=Object.keys(checks).filter(k=>!checks[k]);
  const result={
    ok:failed.length===0,
    totalChecks:Object.keys(checks).length,
    passed:Object.keys(checks).length-failed.length,
    failed,
    viewportBoxModel:widths,
    note:'Static source/geometry QA. Real browser screenshots and tap/scroll acceptance on QA /dev still required.'
  };
  console.log('SPEAKING_S62_SHARED_LAYOUT_QA_RESULT '+JSON.stringify(result,null,2));
  if(failed.length)throw new Error('S62_LAYOUT_QA_FAILED: '+failed.join(', '));
  return result;
}