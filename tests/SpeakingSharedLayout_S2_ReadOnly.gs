/**
 * READ ONLY. Inspect source HTML/CSS/JS without accessing Sheets, Drive or migrations.
 * Run on isolated Apps Script staging only.
 */
function testSpeakingSharedLayoutS2ReadOnly() {
  const src = function(name) { return HtmlService.createHtmlOutputFromFile(name).getContent(); };
  const app=src('Index'), view=src('ViewSpeaking'), p4=src('ViewSpeakingPart4');
  const globalCss=src('Styles'), commonCss=src('Styles_Speaking'), p4Css=src('Styles_SpeakingPart4');
  const commonJs=src('JS_Speaking'), p4Js=src('JS_SpeakingPart4');
  const count=function(s,r){return (s.match(r)||[]).length;};
  const has=function(s,k){return s.indexOf(k)>=0;};
  const ids=Array.from(new Set(Array.from(p4Js.matchAll(/\bbyId\(['"]([^'"]+)['"]\)/g),function(x){return x[1];})));
  const checks={
    oneGlobalMain:count(app,/<main\b/g)===1&&has(app,'<main class="global-stage">'),
    noNestedMain:count(view,/<main\b/g)===0&&has(view,'<div class="speaking-main skill-content-frame">'),
    speakingMainClosesBeforeNav:/<\/div>\s*<nav class="bottom-nav">/.test(view),
    oneSharedFrameRule:count(globalCss,/\.skill-content-frame\s*\{/g)===1,
    sharedFrameNoExtraPadding:/\.skill-content-frame\s*\{[^}]*width:min\(100%,var\(--skill-content-max\)\)[^}]*margin-inline:auto/.test(globalCss),
    globalStageOwnsGutters:has(globalCss,'.global-stage{width:100%;max-width:1440px;margin:0 auto;padding:28px 24px 90px}'),
    speakingNoGenericMainRule:!/(?:^|[}\n])\s*main\s*\{/.test(commonCss),
    speakingNoGenericMobileMainRule:!/main\s*\{\s*padding:14px 10px 30px/.test(commonCss),
    sharedHeader:has(view,'class="skill-page-head skill-content-frame"'),
    sharedPartSwitch:has(view,'class="part-switch shared-part-switch skill-content-frame"'),
    sharedPart123:has(view,'class="speaking-main skill-content-frame"'),
    sharedPart4:has(p4,'id="speakingPart4Future" class="p4dev hidden skill-content-frame"'),
    fourSharedTabs:count(view,/class="part-tab(?: active)?"/g)===4&&count(p4,/class="part-tab/g)===0,
    tabsOwnedByCommonCSS:has(commonCss,'.speaking-shell .shared-part-switch{display:none')&&!has(p4Css,'.speaking-shell .shared-part-switch'),
    p4NoWidthOverride:!has(p4Css,'calc(100% - 32px)')&&!has(p4Css,'max-width:1020px'),
    noBlanketHide:!has(p4Css,'.p4-mode > :not(')&&has(commonCss,'.speaking-shell.p4-mode > .speaking-main{display:none!important}'),
    uniquePart4CSSRemains:has(p4Css,'.p4dev .p4-topic-card')&&!has(p4Css,'.p4dev .study-topline #p4BackLibrary')&&!has(p4Css,'.p4dev .study-top-actions{'),
    p4LibraryDetailRemain:has(p4,'id="p4TopicLibrary"')&&has(p4,'id="p4TopicDetail"'),
    part123HandlersSafe:count(commonJs,/\$\$\('\.part-tab\[data-part\]'\)/g)===3&&count(commonJs,/(?<!\$)\$\('\.part-tab\[data-part\]'\)\.forEach/g)===0,
    p4MountInShell:has(p4Js,'function p4MountInsideSpeaking_')&&has(p4Js,'shell.appendChild(el)'),
    oneTopLevelInclude:count(app,/include\('ViewSpeakingPart4'\)/g)===1&&!has(view,"include('ViewSpeakingPart4')"),
    bottomNavFive:count(view,/class="bottom-nav"/g)===1&&count(view,/class="nav-btn"/g)===5&&has(commonCss,'grid-template-columns:repeat(5,minmax(0,1fr))'),
    mobileFourTabs:has(commonCss,'@media(max-width:650px)')&&has(commonCss,'.speaking-shell .shared-part-switch .part-tab small{font-size:10px}'),
    part4IdsAllPresent:ids.every(function(id){return count(view+'\n'+p4,new RegExp('id="'+id+'"','g'))===1;})
  };
  const issues=Object.keys(checks).filter(function(k){return !checks[k];});
  const widths=[1440,1024,768,390,320].map(function(v){
    const padding=v<=600?10:v<=900?14:24;
    return {viewport:v,expectedUnifiedWidth:Math.min(Math.min(v,1440)-2*padding,1392)};
  });
  const result={ok:issues.length===0,totalChecks:Object.keys(checks).length,failed:issues,
    part4ClientIds:ids.length,calculatedWidthReferences:widths,
    note:'Static source checks and expected box model only. Browser/device QA still required.'};
  console.log('SPEAKING_S2_SHARED_LAYOUT_QA_RESULT '+JSON.stringify(result,null,2));
  if(!result.ok)throw new Error('S2_LAYOUT_STATIC_QA_FAILED: '+issues.join(', '));
  return result;
}