# S7.1 — Browser Probe (read-only)

Open Chrome DevTools on Apps Script staging `/dev`. Copy the entire JavaScript code block below into the Console. It does not write data or automatically click buttons.

```javascript
/**
 * Speaking S7.1 — read-only browser probe.
 * In Apps Script STAGING /dev, open one Speaking topic, then paste this
 * whole script into DevTools Console. Repeat after switching Part/mode/level.
 * No click/typing, no google.script.run, no localStorage or Sheet writes.
 * Designed for UI geometry, DOM visibility and integration diagnostics.
 */
(() => {
  'use strict';
  const q=(selector,root=document)=>root.querySelector(selector);
  const all=(selector,root=document)=>Array.from(root.querySelectorAll(selector));
  const visible=el=>{
    if(!el||el.hidden)return false;
    let x=el;
    while(x&&x.nodeType===1){
      const cs=getComputedStyle(x);
      if(x.hidden||x.classList.contains('hidden')||cs.display==='none'||cs.visibility==='hidden')return false;
      x=x.parentElement;
    }
    return true;
  };
  const rect=el=>el.getBoundingClientRect();
  const overlaps=(a,b)=>{
    const x=rect(a),y=rect(b);
    return Math.min(x.right,y.right)-Math.max(x.left,y.left)>2 &&
           Math.min(x.bottom,y.bottom)-Math.max(x.top,y.top)>2;
  };
  const collisions=selector=>{
    const issues=[];
    all(selector).filter(visible).forEach(group=>{
      const children=Array.from(group.children).filter(visible);
      for(let i=0;i<children.length;i++)for(let j=i+1;j<children.length;j++){
        if(overlaps(children[i],children[j]))issues.push({
          parent:group.className||group.id,first:children[i].textContent.trim().slice(0,32),
          second:children[j].textContent.trim().slice(0,32)
        });
      }
    });
    return issues;
  };
  const rows=[],check=(name,ok,detail='')=>rows.push({name,pass:Boolean(ok),detail});
  const p4=visible(q('#speakingPart4Future'));
  const detail=p4?visible(q('#p4TopicDetail')):visible(q('#studyView'));
  const part=p4?4:Number(q('.shared-part-switch [data-part].active')?.dataset.part ||
     q('#homeView .part-tab.active')?.dataset.part||
     q('.bottom-nav .nav-btn.active')?.dataset.nav?.replace('part','')||1);
  const active=p4?q('#p4TopicDetail [data-p4-step].active'):
    q('#speakingModeTabs .mode-tab.active');
  const mode=p4?(active?.dataset.p4Step||'library'):(active?.dataset.mode==='shadow'?'learn':active?.dataset.mode||'library');
  const levels=p4?q('#p4MemorizeLevels'):q('#speakingMemorizeLevels');
  const levelBtn=q('.level-btn.active',levels);
  const level=mode==='memorize'?Number(levelBtn?.dataset.p4Level||levelBtn?.dataset.level||0):0;
  const container=p4?q('#p4Content'):(part===1?q('#p1TypingArea'):q('#p2UnifiedCards'));
  const panels=container?all('.speaking-memorize-panel',container).filter(visible):[];
  const timer=p4?q('#p4PracticeTimer'):q('#speakingPracticeTimer');
  const completion=p4?q('#p4LearningTools'):q('#markLearnedBtn')?.closest('.speaking-completion-actions');
  const buttonSets=panels.map(p=>all('.speaking-memorize-actions button',p).map(b=>b.textContent.trim()));
  const audioPanels=panels.map(p=>all('.speaking-audio-controls',p).filter(visible).length);
  const inputs=panels.map(p=>all('input.p1-cloze-input',p).filter(visible).length);
  const textareas=panels.map(p=>all('textarea.speaking-memorize-dictation',p).filter(visible).length);
  const revealed=panels.flatMap(p=>all('.speaking-memorize-revealed',p)).filter(visible);
  const fontSizes=revealed.map(box=>parseFloat(getComputedStyle(q('.model-text',box)).fontSize)||0);
  const viewport={width:innerWidth,height:innerHeight,
    documentWidth:document.documentElement.scrollWidth,
    overflowX:Math.max(0,document.documentElement.scrollWidth-document.documentElement.clientWidth)};
  const btnCollisions=collisions('.speaking-memorize-actions');
  const levelCollisions=collisions('.speaking-shared-memorize-levels,.p4-memorize-levels');
  check('Speaking page active',Boolean(q('#page-speaking.active')));
  check('No stuck loading panel',!visible(q('#loadingView')));
  check('Shared Memorize API ready',typeof window.AptisSpeakingMemorize?.render==='function');
  check('Shared Audio API ready',typeof window.AptisSpeakingAudio?.play==='function');
  check('Shared Timer API ready',typeof window.AptisSpeakingTimer?.create==='function');
  check('Shared Cache API ready',typeof window.AptisSpeakingCache?.request==='function');
  check('No horizontal page overflow',viewport.overflowX<=2,'Overflow px: '+viewport.overflowX);
  if(detail){
    check('Topic detail visible',true);
    if(mode==='memorize'){
      const expected=part===1?1:3;
      check('Two levels available',levels&&all('.level-btn',levels).length===2);
      check('Exactly one selected level',level===1||level===2,'Level: '+level);
      check('All question panels render',panels.length===expected,
        'Actual '+panels.length+', expected '+expected);
      check('Check / Try again / Show answer each panel',
        buttonSets.every(x=>x.join('|')==='Check|Try again|Show answer'));
      check('LV1 contains missing-word inputs',level!==1||inputs.every(n=>n>0));
      check('LV2 contains dictation area and audio',level!==2||
        (textareas.every(n=>n===1)&&audioPanels.every(n=>n===1)));
      check('Timer hidden in Memorize',!visible(timer));
      check('Completion/Mastery editor hidden in Memorize',!visible(completion));
      check('No overlapping Memorize buttons',btnCollisions.length===0,
        JSON.stringify(btnCollisions));
      check('No overlapping level buttons',levelCollisions.length===0,
        JSON.stringify(levelCollisions));
      check('Expanded model text at least 18px',fontSizes.every(n=>n>=18),
        'Expanded font sizes: '+JSON.stringify(fontSizes));
    }else if(mode==='test'){
      check('Timer visible in Test',visible(timer));
      check('Memorize levels hidden',!visible(levels));
      if(p4)check('P4 test hides Mastery editor',!visible(completion));
    }else if(mode==='learn'){
      check('Memorize levels hidden in Learn',!visible(levels));
      check('Learn or Shadow model visible',p4?
        all('.speaking-answer-panel',q('#p4Content')).length>=3:
        (visible(q('#shadowSentences'))||visible(q('#p2Unified'))));
    }
  }else{
    check('Topic library visible',p4?visible(q('#p4TopicLibrary')):
       (visible(q('#skillHomeView'))||visible(q('#homeView'))));
  }
  const failed=rows.filter(x=>!x.pass);
  const result={
    ok:failed.length===0,part,mode,level,viewport,
    checks:rows.length,passed:rows.length-failed.length,failed,
    panelCounts:{memorizePanels:panels.length,inputs,textareas,audioPanels,expandedModels:revealed.length},
    note:'Browser DOM/geometry only. No audio sound, server save or reload test performed.'
  };
  console.log('SPEAKING_S71_BROWSER_RESULT '+JSON.stringify(result,null,2));
  if(failed.length)console.warn('S7.1 browser probe found UI issues:',failed);
  return result;
})();

```
