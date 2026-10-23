# S7.1-B — Chrome /dev Browser Probe v3 (read-only, includes overflow tracing)

Use **Chrome DevTools → Console → JavaScript context: `userHtmlFrame`** in `APTIS_B2_PART4_UI01_STAGING` `/dev` (not the top-level frame).

1. Open Speaking, enter a topic, paste the JavaScript below **once**.
2. Switch Part and Learn / Memorize LV1 / Memorize LV2 / Test **manually**. After each state change execute `S71QA.run()`.
3. Test desktop and Chrome Device Toolbar widths 360px, 768px, >=1200px.
4. Execute `S71QA.report()` to view state coverage and problems. Expected **16/16 mode-level states**; viewport confirmations are additional.
5. **If horizontal overflow is reported**, run `S71QA.overflow()` in the same `userHtmlFrame` Console context and share `SPEAKING_S71_OVERFLOW_DIAG` to identify the exact out-of-bounds element. This is inspection only—do not hide overflow globally.
6. Manually listen to audio and test Check / Try again / Show answer; inspect Progress/Mastery before/after only on isolated staging data. This probe never triggers server writes or clicks.

A `WRONG_CONTEXT` result means DevTools is evaluating in the wrong Google Apps Script frame. No application source or Google Sheet is modified. The browser probe is **not** an Apps Script `.gs` file.

```javascript
/**
 * S7.1-B browser QA (read-only). Chrome > DevTools > Console.
 * IMPORTANT: Select the Apps Script userHtmlFrame (not top).
 * Paste once; then run S71QA.run() after each manually selected Part/mode/level.
 * S71QA.report() prints coverage. No clicks, timers, requests or persistence writes.
 */
(function () {
  'use strict';
  var previous=window.S71QA;
  var samples=previous&&Array.isArray(previous.samples)?previous.samples:[];
  var q=function(s,root){return(root||document).querySelector(s);};
  var all=function(s,root){return Array.prototype.slice.call((root||document).querySelectorAll(s));};
  var show=function(el){
    if(!el||!el.isConnected)return false;
    var node=el;
    while(node&&node.nodeType===1){
      var st=window.getComputedStyle(node);
      if(node.hidden||node.classList.contains('hidden')||st.display==='none'||st.visibility==='hidden')return false;
      node=node.parentElement;
    }
    var r=el.getBoundingClientRect();
    return r.width>0&&r.height>0;
  };
  var intersect=function(a,b){
    var x=a.getBoundingClientRect(),y=b.getBoundingClientRect();
    return Math.min(x.right,y.right)-Math.max(x.left,y.left)>2&&
           Math.min(x.bottom,y.bottom)-Math.max(x.top,y.top)>2;
  };
  var collisions=function(selector){
    var bad=[];
    all(selector).filter(show).forEach(function(group){
      var children=Array.prototype.slice.call(group.children).filter(show);
      for(var i=0;i<children.length;i++)for(var j=i+1;j<children.length;j++){
        if(intersect(children[i],children[j])){
          bad.push({group:group.id||group.className,
            a:children[i].textContent.trim().slice(0,40),
            b:children[j].textContent.trim().slice(0,40)});
        }
      }
    });
    return bad;
  };
  function run(){
    var tests=[],p4=show(q('#speakingPart4Future'));
    function test(key,passed,detail){
      tests.push({key:key,pass:Boolean(passed),detail:detail||''});
    }
    if(!q('#page-speaking')){
      var wrong={ok:false,reason:'WRONG_CONTEXT',help:'Select userHtmlFrame in DevTools Console context dropdown, then paste browser probe there.'};
      console.error('SPEAKING_S71_BROWSER_QA '+JSON.stringify(wrong));
      return wrong;
    }
    var page=show(q('#page-speaking'));
    var detail=p4?show(q('#p4TopicDetail')):show(q('#studyView'));
    var selected=all('.shared-part-switch [data-part]').find(function(el){return el.classList.contains('active');});
    var part=p4?4:Number(selected&&selected.dataset.part||0);
    var active=p4?q('#p4TopicDetail [data-p4-step].active'):q('#speakingModeTabs [data-mode].active');
    var step=!detail?'library':p4?(active&&active.dataset.p4Step||'unknown'):
      (active&&active.dataset.mode==='shadow'?'learn':active&&active.dataset.mode||'unknown');
    var levels=p4?q('#p4MemorizeLevels'):q('#speakingMemorizeLevels');
    var lb=q('.level-btn.active',levels);
    var level=step==='memorize'?Number(lb&&(lb.dataset.p4Level||lb.dataset.level)||0):0;
    var container=p4?q('#p4Content'):(part===1?q('#p1TypingArea'):q('#p2UnifiedCards'));
    var panels=container?all('.speaking-memorize-panel',container).filter(show):[];
    var timer=p4?q('#p4PracticeTimer'):q('#speakingPracticeTimer');
    var mastery=p4?q('#p4LearningTools'):q('#markLearnedBtn')&&q('#markLearnedBtn').closest('.speaking-completion-actions');
    var width=document.documentElement.clientWidth;
    var overflow=Math.max(0,document.documentElement.scrollWidth-width);
    var viewport=window.innerWidth;
    var buttons=panels.map(function(x){return all('.speaking-memorize-actions button',x).map(function(b){return b.textContent.trim();});});
    var inputs=panels.map(function(x){return all('input.p1-cloze-input',x).filter(show).length;});
    var dictation=panels.map(function(x){return all('textarea.speaking-memorize-dictation',x).filter(show).length;});
    var audio=panels.map(function(x){return all('.speaking-audio-controls',x).filter(show).length;});
    var reveal=panels.reduce(function(out,x){return out.concat(all('.speaking-memorize-revealed',x).filter(show));},[]);
    var answerSizes=reveal.map(function(el){var m=q('.model-text',el);return m?parseFloat(getComputedStyle(m).fontSize):0;});
    var actionCollisions=collisions('.speaking-memorize-actions');
    var levelCollisions=collisions('.speaking-shared-memorize-levels,.p4-memorize-levels');

    test('speakingPageVisible',page);
    test('noLoadingDeadlock',!show(q('#loadingView')));
    test('sharedMemorizeReady',typeof(window.AptisSpeakingMemorize&&window.AptisSpeakingMemorize.render)==='function');
    test('sharedAudioReady',typeof(window.AptisSpeakingAudio&&window.AptisSpeakingAudio.play)==='function');
    test('sharedTimerReady',typeof(window.AptisSpeakingTimer&&window.AptisSpeakingTimer.create)==='function');
    test('sharedCacheReady',typeof(window.AptisSpeakingCache&&window.AptisSpeakingCache.request)==='function');
    test('validPart',part>=1&&part<=4,String(part));
    test('noHorizontalOverflow',overflow<=2,'px='+overflow);
    if(detail){
      test('validMode',step==='learn'||step==='memorize'||step==='test',step);
      if(step==='memorize'){
        var expected=part===1?1:3;
        test('levelSelectorVisible',show(levels));
        test('exactlyTwoLevels',all('.level-btn',levels).length===2);
        test('selectedLevelIsOneOrTwo',level===1||level===2,'level='+level);
        test('expectedQuestionPanels',panels.length===expected,'actual='+panels.length+', expected='+expected);
        test('threeControlsForEveryPanel',buttons.length===expected&&buttons.every(function(x){
          return x.join('|')==='Check|Try again|Show answer';}));
        if(level===1){
          test('clozeInputsPresent',inputs.length===expected&&inputs.every(function(n){return n>0;}));
          test('noDictationInLevelOne',dictation.every(function(n){return n===0;}));
        }
        if(level===2){
          test('oneDictationPerQuestion',dictation.length===expected&&dictation.every(function(n){return n===1;}));
          test('oneAudioGroupPerQuestion',audio.length===expected&&audio.every(function(n){return n===1;}));
          test('noClozeInLevelTwo',inputs.every(function(n){return n===0;}));
        }
        test('timerHiddenInMemorize',!show(timer));
        test('progressEditorHiddenInMemorize',!show(mastery));
        test('noActionButtonCollisions',actionCollisions.length===0,JSON.stringify(actionCollisions));
        test('noLevelButtonCollisions',levelCollisions.length===0,JSON.stringify(levelCollisions));
        if(reveal.length)test('revealedModelLarge',answerSizes.every(function(n){return n>=18;}),JSON.stringify(answerSizes));
      }else if(step==='test'){
        test('timerVisibleInTest',show(timer));
        test('levelsHiddenInTest',!show(levels));
        if(p4)test('P4MasteryHiddenInTest',!show(mastery));
      }else if(step==='learn'){
        test('levelsHiddenInLearn',!show(levels));
        if(p4){
          test('P4QuestionCardsPresent',all('#p4Content .speaking-question-card').length===3);
          test('P4TeacherModelsPresent',all('#p4Content .p4dev-inline-answer').length===3);
        }else if(part===1){
          test('P1SingleParagraphVisible',show(q('#shadowSentences .p1-learn-paragraph')));
        }else{
          test('P2P3QuestionCardsPresent',all('#p2UnifiedCards .p2-topic-card').length===3);
          test('P2P3TeacherModelsPresent',all('#p2UnifiedCards .p2-topic-answer').length===3);
        }
      }
    }else{
      test('libraryVisible',p4?show(q('#p4TopicLibrary')):show(q('#skillHomeView'))||show(q('#homeView')));
    }
    var failed=tests.filter(function(t){return !t.pass;});
    var result={
      ok:failed.length===0,context:'userHtmlFrame',part:part,mode:step,level:level,
      viewport:viewport,overflowX:overflow,passed:tests.length-failed.length,total:tests.length,
      failed:failed,
      evidence:{questionPanels:panels.length,blanks:inputs,dictations:dictation,audioGroups:audio,
        visibleAnswers:reveal.length,modelFontPx:answerSizes},
      readOnly:true,
      notCovered:'Audible sound, actual button actions, reload/cache persistence, or server writes.'
    };
    samples.push(result);
    console.log('SPEAKING_S71_BROWSER_RESULT '+JSON.stringify(result,null,2));
    if(failed.length)console.warn('S7.1 visual issues:',failed);
    return result;
  }
  function overflow(){
    var html=document.documentElement;
    var width=html.clientWidth;
    var rectData=function(el){
      var r=el.getBoundingClientRect(),s=getComputedStyle(el);
      var name=el.tagName.toLowerCase();
      if(el.id)name+='#'+el.id;
      else if(el.className&&typeof el.className==='string')name+='.'+el.className.trim().replace(/\s+/g,'.').slice(0,84);
      var parent=el.parentElement,ancestry=[];
      for(var i=0;parent&&i<3;i++,parent=parent.parentElement){
        ancestry.push(parent.id?'#'+parent.id:parent.className&&typeof parent.className==='string'?'.'+parent.className.trim().replace(/\s+/g,'.').slice(0,32):parent.tagName);
      }
      return {element:name,parent:ancestry.join(' < '),right:Math.round(r.right*10)/10,
        left:Math.round(r.left*10)/10,width:Math.round(r.width*10)/10,
        overflowRight:Math.round((r.right-width)*10)/10,
        scrollWidth:el.scrollWidth,clientWidth:el.clientWidth,
        minWidth:s.minWidth,display:s.display,flexShrink:s.flexShrink,
        whiteSpace:s.whiteSpace,overflowX:s.overflowX};
    };
    var offenders=all('body *').filter(function(el){
      if(!show(el))return false;
      var r=el.getBoundingClientRect();
      return (r.right>width+2||r.left< -2)&&r.width>0;
    }).map(rectData).sort(function(a,b){return b.overflowRight-a.overflowRight;}).slice(0,25);
    var focus=['.global-topbar','.global-brand','.global-nav',
      '.global-stage','.skill-page-head','.skill-head-actions',
      '.speaking-shell','#speakingPart4Future','#p4TopicDetail',
      '.p4-topic-study-card','.bottom-nav'].map(function(s){
        var e=q(s);return e&&show(e)?rectData(e):null;
      }).filter(Boolean);
    var out={viewport:window.innerWidth,clientWidth:width,scrollWidth:html.scrollWidth,
      overflowX:Math.max(0,html.scrollWidth-width),
      offenders:offenders,layoutFocus:focus,readOnly:true};
    console.log('SPEAKING_S71_OVERFLOW_DIAG '+JSON.stringify(out,null,2));
    return out;
  }

  function report(){
    var required=[],widths=[360,768,1200];
    for(var part=1;part<=4;part++){
      for(var mode of ['learn','memorize','test']){
        var levels=mode==='memorize'?[1,2]:[0];
        levels.forEach(function(level){
          required.push({part:part,mode:mode,level:level,
            observed:samples.some(function(s){return s.part===part&&s.mode===mode&&s.level===level&&s.ok;})});
        });
      }
    }
    var summary={captured:samples.length,passing:samples.filter(function(s){return s.ok;}).length,
      failing:samples.filter(function(s){return !s.ok;}).length,
      stateCoverage:required.filter(function(x){return x.observed;}).length+'/16',
      missingStates:required.filter(function(x){return !x.observed;}),
      widths:{'360':samples.some(function(s){return s.viewport<=390&&s.ok;}),
        '768':samples.some(function(s){return s.viewport>700&&s.viewport<900&&s.ok;}),
        '1200+':samples.some(function(s){return s.viewport>=1200&&s.ok;})},
      note:'State coverage is observational and read-only, not an approval for auditory or persistence safety.'};
    console.log('SPEAKING_S71_BROWSER_REPORT '+JSON.stringify(summary,null,2));
    return summary;
  }
  window.S71QA=Object.freeze({run:run,report:report,overflow:overflow,samples:samples,version:'s7.1-browser-v3-20261023'});
  console.log('S71QA installed. Navigate to a Speaking topic; run S71QA.run(). After collecting states run S71QA.report().');
  return run();
})();
```
