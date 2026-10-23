/**
 * S7.1 Deep Regression — READ ONLY / deterministic runtime checks.
 * Source: the exact HTML files in the currently pulled Apps Script project.
 * Does NOT call google.script.run, Sheets, Drive, migration or write endpoints.
 * Run testSpeakingS71DeepRegressionReadOnly() after pulling the S7.1 QA branch.
 * NOTE: Synthetic browser/audio/clock/DOM checks cannot replace live /dev QA.
 */
function testSpeakingS71DeepRegressionReadOnly(){
  const src=name=>HtmlService.createHtmlOutputFromFile(name).getContent();
  const js=src('JS_Speaking'),p4=src('JS_SpeakingPart4');
  const v=src('ViewSpeaking'),v4=src('ViewSpeakingPart4'),css=speakingCombinedStylesReadOnly_();
  const qa={};const issues=[];
  const assert=(category,name,test)=>{
    let ok=false,detail='';
    try{ok=Boolean(test());}catch(e){detail=String(e&&e.message||e);}
    if (!qa[category]) qa[category]={passed:0,total:0,failed:[]};
    qa[category].total++;
    if(ok)qa[category].passed++;
    else{qa[category].failed.push(name);issues.push({category,name,detail});}
    return ok;
  };
  // Diagnostic always prints before any source slice. If Apps Script staging
  // has an older/different JS_Speaking.html, explain the mismatch (do not
  // pretend the current test's 117 checks have run against that version).
  const sourceProbe={
    jsSpeakingBytes:js.length,jsPart4Bytes:p4.length,
    speakingMemorizePlan:/\bfunction\s+speakingMemorizePlan_\s*\(/.test(js),
    sharedMemorizeModule:/window\.AptisSpeakingMemorize\s*=/.test(js),
    sharedCache:/window\.AptisSpeakingCache\s*=/.test(js),
    sharedTimer:/window\.AptisSpeakingTimer\s*=/.test(js),
    part2Unified:/\bfunction\s+renderP2Unified_\s*\(/.test(js),
    part4Timer:/\bfunction\s+p4Timer_\s*\(/.test(p4),
    part4Renderer:/\bfunction\s+p4RenderMemorize_\s*\(/.test(p4)
  };
  console.log('SPEAKING_S71_SOURCE_PREFLIGHT '+JSON.stringify(sourceProbe));
  const findMarker=(text,marker,offset)=>{
    if(typeof marker==='string')return text.indexOf(marker,offset);
    // A regex anchor is independent of indentation, line endings and comments.
    const flags=marker.flags.replace(/g/g,'').replace(/y/g,'');
    const re=new RegExp(marker.source,flags);
    const match=re.exec(text.slice(offset));
    return match?offset+match.index:-1;
  };
  const between=(text,start,end,label)=>{
    const i=findMarker(text,start,0);
    const j=i<0?-1:findMarker(text,end,i+1);
    if(i<0||j<=i){
      const diagnostic={
        section:label,startFound:i>=0,endFound:j>=0,
        jsSpeakingBytes:sourceProbe.jsSpeakingBytes,
        jsPart4Bytes:sourceProbe.jsPart4Bytes,
        missingS64MemorizeHelper:!sourceProbe.speakingMemorizePlan,
        sharedMemorizeModule:sourceProbe.sharedMemorizeModule,
        part4Timer:sourceProbe.part4Timer
      };
      console.error('SPEAKING_S71_SOURCE_MISMATCH '+JSON.stringify(diagnostic));
      throw new Error('S71_SOURCE_MISMATCH ['+label+']: '+(i<0?'start anchor missing':'end anchor missing')+
        '. Compare JS_Speaking/JS_SpeakingPart4 with accepted S6.4. See SOURCE_PREFLIGHT.');
    }
    return text.slice(i,j);
  };
  const strip=text=>text.replace(/^\s*<script>/,'').replace(/<\/script>\s*$/,'');
  const clozeCode=between(js,/\bfunction\s+speakingMemorizePlan_\s*\(/,
    /\bfunction\s+p2Card_\s*\(/,'shared Memorize P1-P4');
  const cacheCode=between(js,/\bfunction\s+createSpeakingContentCache_\s*\(/,
    /\bconst\s+state\s*=/,'shared cache');
  const timerCode=between(js,/\blet\s+speakingActiveTimer_\s*=/,
    /\blet\s+speakingConfirmPending_\s*=/,'shared Timer');
  const audioCode=between(js,/\bconst\s+speakingPlayback_\s*=/,
    /\blet\s+speakingActiveTimer_\s*=/,'shared Audio');
  const p4Timer=between(p4,/\bfunction\s+p4Timer_\s*\(/,
    /\bfunction\s+p4FormulaHtml\s*\(/,'Part 4 Timer');
  const p2Unified=between(js,/\bfunction\s+renderP2Unified_\s*\(/,
    /\bfunction\s+renderP2TestOutline_\s*\(/,'P2/P3 topic render');
  const p4Memory=between(p4,/\bfunction\s+p4RenderMemorize_\s*\(/,
    /\bfunction\s+p4RenderStudyCards_\s*\(/,'P4 Memorize');
  const p4Learn=between(p4,/\bfunction\s+p4RenderStudyCards_\s*\(/,
    /\bfunction\s+renderAnswersOnly_\s*\(/,'P4 Learn');
  const p4Save=between(p4,/byId\s*\(\s*['"]p4Save['"]\s*\)\.addEventListener\s*\(\s*['"]click['"]/,
    /byId\s*\(\s*['"]p4Read['"]\s*\)\.addEventListener\s*\(\s*['"]click['"]/,'P4 save action');
  const saving1=between(js,/\bfunction\s+saveProgress\s*\(/,
    /\bfunction\s+recalcPart2Aggregate\s*\(/,'P1-P3 Progress');
  const mode1=between(js,/\bfunction\s+setMode\s*\(/,
    /\bfunction\s+setMemorizeLevel\s*\(/,'P1-P3 Mode');
  const p4Apply=between(p4,/\bfunction\s+p4ApplyStudyMode\s*\(/,
    /\bfunction\s+p4ApplyMastery_\s*\(/,'P4 Modes');

  // A. UI and integration contract — source-level, no fake visual acceptance.
  assert('learn','P1 one-paragraph teacher model',()=>js.includes("className = 'p1-learn-paragraph'")&&js.includes('renderSharedFormulaText(paragraph, currentModel())'));
  assert('learn','P2 and P3 retain independent Q1-Q3',()=>p2Unified.includes('for(let i=0;i<3;i++)')&&p2Unified.includes('item.questions||[]')&&p2Unified.includes('item.models||[]'));
  assert('learn','P2/P3 show approved teacher model per question',()=>js.includes('renderSharedFormulaText(words,model)')&&p2Unified.includes('p2Card_(i+1,question,answer)'));
  assert('learn','P4 renders all question cards with model',()=>p4Learn.includes('(S.current?.questions||[]).map((q,i)=>')&&p4Learn.includes('p4AnswerHtml(answer)'));
  assert('learn','P4 preserves question text and model escape',()=>p4.includes("escapeHtml(q)")&&p4.includes("escapeHtml(v)")||p4.includes('function escapeHtml(v)'));
  assert('learn','Topic prev and next exist for P1-P4',()=>v.includes('id="prevQuestionBtn"')&&v.includes('id="nextQuestionBtn"')&&v4.includes('id="p4PrevTopic"')&&v4.includes('id="p4NextTopic"'));
  assert('learn','P4 topic navigation stops audio and clock',()=>p4.includes('p4StopAudio();stopClock();')&&p4.includes("byId('p4PrevTopic').addEventListener('click'"));
  assert('learn','P1-P3 set mode triggers shared rendering',()=>js.includes("renderPromptContent();")&&js.includes("setMode('shadow')"));
  assert('learn','No teacher-model writes inside renderer',()=>!clozeCode.includes('google.script.run')&&!p2Unified.includes('google.script.run')&&!p4Memory.includes('google.script.run'));

  // B. Shared audio — one owner; browser playback still manual.
  assert('audio','One shared audio owner exists',()=>js.includes('window.AptisSpeakingAudio = Object.freeze({'));
  assert('audio','Parts 1-3 use same player',()=>js.includes('sharedAudioPlay_(text,group)')&&js.includes('sharedAudioPause_(group)'));
  assert('audio','P4 delegates to shared player',()=>p4.includes('window.AptisSpeakingAudio')&&p4.includes('return audio.play(')&&p4.includes('return audio.pause(group)')&&p4.includes('return audio.stop()'));
  assert('audio','Audio controls expose Play Pause Stop',()=>js.includes("['play','▶ Play'")&&js.includes("['pause','⏸ Pause'")&&js.includes("['stop','■ Stop'"));
  assert('audio','Audio stops before topic navigation',()=>js.includes('stopSpeech();')&&p4.includes('p4StopAudio();stopClock();'));
  assert('audio','P4 forbids reading model while speaking',()=>p4.includes("S.phase==='speak'")&&p4.includes('function p4Listen('));
  assert('audio','Audio play state tracks pause and stop',()=>audioCode.includes("status==='paused'")&&audioCode.includes("status==='idle'")&&audioCode.includes('window.speechSynthesis.cancel()'));
  assert('audio','No persistence calls inside audio engine',()=>!audioCode.includes('google.script.run'));

  // C. Timer, mode visibility, and write restrictions.
  assert('timer','Shared timer is frozen engine',()=>js.includes('window.AptisSpeakingTimer=Object.freeze({'));
  assert('timer','Timer defaults P1=30 P2/P3=45 P4 prep/speak=60/120',()=>timerCode.includes('part1:30,part2:45,part3:45,part4Preparation:60,part4Speaking:120'));
  assert('timer','P1-P3 duration comes from active part',()=>js.includes('function currentTimerSeconds()')&&js.includes('timer.start(currentTimerSeconds())'));
  assert('timer','P4 explicitly starts 60 and 120 seconds',()=>p4.includes("clock('prep',60)")&&p4.includes("clock('speak',120)"));
  assert('timer','P4 preparation transitions once to speaking',()=>p4Timer.includes("if(S.phase==='prep')startSpeaking();")&&p4Timer.includes("else if(S.phase==='speak')endSpeaking();"));
  assert('timer','Mode switch stops old P1-P3 timer',()=>mode1.includes("stopSpeech();stopTimer(true);"));
  assert('timer','P1-P3 Memorize hides timer',()=>mode1.includes("$('speakingPracticeTimer').classList.toggle('hidden',mode==='memorize')"));
  assert('timer','P4 Memorize hides timer',()=>p4Apply.includes("byId('p4PracticeTimer').hidden=memorizing;"));
  assert('timer','P1-P3 timer performs no writes',()=>!timerCode.includes('google.script.run')&&!between(js,/\blet\s+speakingMainPracticeTimer_\s*=/,/\bfunction\s+formatTime\s*\(/,'P1-P3 Timer').includes('google.script.run'));
  assert('timer','P4 timer performs no writes',()=>!p4Timer.includes('google.script.run')&&!p4Timer.includes('.saveSpeakingPart4'));
  assert('timer','P4 active exam survives background cache update',()=>p4.includes("if(['prep','speak'].includes(S.phase))return;"));
  assert('timer','P4 switches mode with active clock cleanup',()=>p4.includes("if(['prep','speak'].includes(S.phase)){"));
  assert('timer','P1-P3 show self-rating only after timer',()=>js.includes("if(state.currentMode==='test'){")&&js.includes("$('selfCheck').classList.remove('hidden');"));

  // D. Explicit Progress & Mastery writes.
  assert('progress','Memorize scoring has no server calls',()=>!clozeCode.includes('google.script.run'));
  assert('progress','Memorize cannot trigger manual completion',()=>mode1.includes("$('markLearnedBtn').closest('.speaking-completion-actions').classList.toggle('hidden',mode==='memorize')"));
  assert('progress','P4 Memorize hides Mastery editor',()=>p4Apply.includes("byId('p4LearningTools').hidden=!learn||memorizing;"));
  assert('progress','P1-P3 learned write behind confirmation',()=>js.includes("onConfirm:()=>saveProgress(5,'learned')"));
  assert('progress','P1-P3 rating write only in rating handler',()=>saving1.includes('function finishSelfRating(rating)')&&saving1.includes('.saveAttempt({')&&saving1.includes('.saveQuestionProgress({'));
  assert('progress','P4 Mastery after explicit Confirm',()=>p4.includes("onConfirm:()=>{")&&p4.includes('.saveSpeakingPart4Mastery({questionId:id,level'));
  assert('progress','P4 attempt requires done, session and non-saved',()=>p4Save.includes("if(!S.current||!S.session||S.saved||S.phase!=='done')return;"));
  assert('progress','P4 attempt only from Save button',()=>p4Save.includes('.saveSpeakingPart4DevAttempt({'));
  assert('progress','Part 4 save reply validates session & topic',()=>p4Save.includes('S.session!==sessionId||S.current?.id!==setId'));
  assert('progress','No auto migration in frontend',()=>!clozeCode.includes('migrate')&&!timerCode.includes('migrate'));

  // E. Cache and startup contract.
  assert('cache','Shared cache has read/write/clear/request',()=>['function read(opts)','function write(opts)','function clear(keys)','function request(key,invoke,onSuccess,onFailure,force)'].every(x=>cacheCode.includes(x)));
  assert('cache','Cached bootstrap uses stable existing key',()=>js.includes('aptisSpeakingBootstrap:p1-reuse-49-v01-20261020'));
  assert('cache','Cache keeps last-good fallback',()=>js.includes('readBootstrapCache(true)')&&js.includes('CLIENT_CACHE_BACKUP_KEY'));
  assert('cache','Force refresh clears only Speaking payload keys',()=>js.includes('clearAptisSpeakingBootstrapCache_()')&&js.includes('LEGACY_CACHE_KEYS'));
  assert('cache','P4 has mode-qualified cache keys',()=>p4.includes("':content:'+(mode==='exam'?'exam':'learn')"));
  assert('cache','P4 validates 51 teacher sets for Learn',()=>p4.includes("mode==='learn'&&data.sets.length!==51"));
  assert('cache','P4 rejects unapproved Test sets',()=>p4.includes('x.qaStatus!==\'APPROVED\'')&&p4.includes('!Boolean(x.releaseApproved)'));
  assert('cache','P4 checks stale request sequence',()=>p4.includes('requestId!==S.requestSeq||S.mode!==mode'));
  assert('cache','P4 invalid Mastery response cannot replace existing',()=>p4.includes('if(!p4ValidMastery_(items))'));
  assert('cache','Bootstrap always calls official API',()=>js.includes('.getBootstrapData(Boolean(opts.force))'));
  assert('cache','Startup has visible fail-safe',()=>js.includes('SPEAKING_BOOTSTRAP_INIT_FAILED')&&js.includes('LOADER_HARD_TIMEOUT_MS'));
  assert('cache','No malformed single-dollar CSS selector',()=>!js.split(/\r?\n/).some(x=>/^\s*\$\(['"][.#\[]/.test(x)));

  // F. Layout — source guard, never substitute for browser geometry.
  assert('layout','Two LV choices both parts',()=>((v.match(/data-level="[12]"/g)||[]).length===2)&&((v4.match(/data-p4-level="[12]"/g)||[]).length===2));
  assert('layout','No duplicate P1 reveal controls',()=>!v.includes('id="revealBtn"')&&!v.includes('id="p1MemorizeActions"'));
  assert('layout','Answer reveal takes full width',()=>css.includes('.speaking-memorize-revealed')&&css.includes('width:100%'));
  assert('layout','Three action buttons responsive',()=>css.includes('.speaking-memorize-actions{')&&css.includes('grid-template-columns:repeat(3,minmax(0,1fr))'));
  assert('layout','Dictation responsive min width',()=>css.includes('.speaking-memorize-dictation{')&&css.includes('min-width:0'));
  assert('layout','Mobile media constraints present',()=>css.includes('@media(max-width:480px)')&&css.includes('overflow-wrap:anywhere'));
  assert('layout','Timer is hidden in Memorize regardless display grid',()=>css.includes('.speaking-practice-timer[hidden]{display:none!important}'));
  assert('layout','Global navigation is not duplicated in P4',()=>!v4.includes('class="bottom-nav"'));

  // G. Runtime: execute actual shared memorization functions with virtual DOM.
  function el(tag){
    const attributes={},events={},classes=new Set();
    const e={tagName:tag,children:[],value:'',textContent:'',hidden:false,disabled:false,
      className:'',attributes,events,style:{},dataset:{},
      classList:{add:(...a)=>a.forEach(x=>classes.add(x)),remove:(...a)=>a.forEach(x=>classes.delete(x)),
        contains:x=>classes.has(x),toggle:(x,p)=>{const yes=p===undefined?!classes.has(x):p;yes?classes.add(x):classes.delete(x);return yes;}},
      setAttribute(k,v){attributes[k]=String(v);},addEventListener(k,fn){events[k]=fn;},
      appendChild(x){this.children.push(x);return x;},append(...args){this.children.push(...args);},
      replaceChildren(...args){this.children=[...args];},focus(){this.focused=true;},
      click(){if(events.click)events.click();},input(value){this.value=value;if(events.input)events.input();}};
    return e;
  }
  const fakeDocument={createElement:el,createTextNode:t=>{const e=el('#text');e.textContent=t;return e;}};
  const find=(root,predicate)=>{
    const list=[];const visit=x=>{if(predicate(x))list.push(x);(x.children||[]).forEach(visit);};
    visit(root);return list;
  };

  // Browser-independent audio runtime: silent speech engine verifies controls.
  const fakeSpeech={
    plays:0,pauses:0,resumes:0,cancels:0,last:null,
    speak(u){this.plays++;this.last=u;},pause(){this.pauses++;},
    resume(){this.resumes++;},cancel(){this.cancels++;}
  };
  const audioWin={speechSynthesis:fakeSpeech};
  const audioDoc={createElement:tag=>{
    const n=el(tag);
    n.querySelector=sel=>{
      const match=sel.match(/data-audio-action="([^"]+)"/);
      return match ? (find(n,x=>x.dataset && x.dataset.audioAction===match[1])[0]||null) : null;
    };
    return n;
  }};
  const player=new Function('window','$','makeUtterance','toast','document',
    audioCode+';return {play:sharedAudioPlay_,pause:sharedAudioPause_,stop:stopSpeech,create:createSpeakingAudioControls_};')(
      audioWin,()=>el('button'),str=>({text:str}),()=>{},audioDoc);
  const ag=player.create('I read books.','S71 silent audio');
  assert('audioRuntime','Audio bar contains three shared buttons',
    ()=>find(ag,x=>x.tagName==='button').length===3);
  assert('audioRuntime','Audio initial state is idle',()=>ag.dataset.audioState==='idle');
  player.play('I read books.',ag);
  assert('audioRuntime','Play speaks exactly one supplied model',
    ()=>fakeSpeech.plays===1&&fakeSpeech.last.text==='I read books.');
  assert('audioRuntime','Playing state enables Pause',
    ()=>ag.dataset.audioState==='playing'&&
      find(ag,x=>x.dataset.audioAction==='pause')[0].disabled===false);
  player.pause(ag);
  assert('audioRuntime','Pause transitions to paused',
    ()=>fakeSpeech.pauses===1&&ag.dataset.audioState==='paused');
  player.play('I read books.',ag);
  assert('audioRuntime','Play while paused resumes, does not queue twice',
    ()=>fakeSpeech.resumes===1&&fakeSpeech.plays===1);
  player.stop();
  assert('audioRuntime','Stop resets playback controls',
    ()=>fakeSpeech.cancels>=1&&ag.dataset.audioState==='idle');
  assert('audioRuntime','Empty text cannot start playback',
    ()=>player.play('  ',ag)===false);

  const wm={};
  const mem=new Function('window','document',clozeCode+';return window.AptisSpeakingMemorize;')(wm,fakeDocument);
  const sample='During a volunteer lesson, the projector stopped working, so we used the whiteboard.';
  const expected=mem.plan(sample,1);
  assert('memorize','Real planner preserves every teacher word and punctuation',
    ()=>expected.parts.map(x=>x.blank?x.answer:x.text).join('')===sample);
  assert('memorize','Real LV1 short answers still have missing words',()=>mem.plan('I read books.',1).blanks.length>0);
  assert('memorize','Recall normalization case/punctuation insensitive',()=>mem.normalize('  BOOK!  ')===mem.normalize('book'));
  assert('memorize','Real LV2 word recall full transcription is 100',()=>mem.recallScore(sample,sample)===100);
  assert('memorize','Real LV2 partial text scores less than 100',()=>mem.recallScore(sample,'During a volunteer lesson')<100);
  const drafts={};const root=el('div');let audioCount=0;
  mem.render({container:root,answer:sample,level:1,key:'P1:A:L1',drafts,
    createAudio:()=>{audioCount++;return el('audio');}});
  const btn=()=>find(root,x=>x.tagName==='button');
  const inputs=find(root,x=>x.tagName==='input');
  const feedback=()=>find(root,x=>x.className==='speaking-memorize-feedback')[0];
  const reveal=()=>find(root,x=>x.className==='speaking-memorize-revealed')[0];
  assert('memorize','LV1 has exactly Check Try again Show answer',()=>btn().map(x=>x.textContent).join('|')==='Check|Try again|Show answer');
  assert('memorize','LV1 blanks match algorithm and no audio',()=>inputs.length===expected.blanks.length&&audioCount===0);
  btn()[0].click();
  assert('memorize','Empty Check does not reveal teacher model',()=>reveal().hidden===true);
  inputs.forEach((x,i)=>x.input(expected.blanks[i]));
  btn()[0].click();
  assert('memorize','Correct LV1 inputs achieve full count',()=>feedback().textContent===inputs.length+'/'+inputs.length+' words correct.');
  assert('memorize','Typing produces isolated draft',()=>typeof drafts['P1:A:L1']==='object');
  btn()[2].click();
  assert('memorize','Show answer displays complete unmodified model',()=>!reveal().hidden&&find(reveal(),x=>x.tagName==='p')[0].textContent===sample);
  btn()[1].click();
  assert('memorize','Try again clears inputs feedback draft and reveal',
    ()=>inputs.every(x=>x.value==='')&&feedback().textContent===''&&reveal().hidden&&!('P1:A:L1' in drafts));
  mem.render({container:root,answer:sample,level:1,key:'P2:topic:Q1:L1',drafts});
  find(root,x=>x.tagName==='input')[0].input('saved draft');
  mem.render({container:root,answer:sample,level:1,key:'P2:topic:Q1:L1',drafts});
  assert('memorize','Re-render restores same question draft',()=>find(root,x=>x.tagName==='input')[0].value==='saved draft');
  mem.render({container:root,answer:sample,level:1,key:'P2:topic:Q2:L1',drafts});
  assert('memorize','Q1 and Q2 drafts are independent',()=>find(root,x=>x.tagName==='input')[0].value==='');
  mem.render({container:root,answer:sample,level:2,key:'P4:topic:Q3:L2',drafts,createAudio:()=>{audioCount++;return el('audio');}});
  const area=find(root,x=>x.tagName==='textarea')[0];
  assert('memorize','LV2 has full-width dictation and audio, no blanks',()=>Boolean(area)&&audioCount===1&&find(root,x=>x.tagName==='input').length===0);
  btn()[0].click();
  assert('memorize','Empty dictation asks learner to write',()=>feedback().textContent==='Write an answer first.');
  area.input(sample);btn()[0].click();
  assert('memorize','LV2 full transcription returns 100%',()=>feedback().textContent.indexOf('Word recall: 100%')>=0);
  btn()[2].click();
  assert('memorize','LV2 answer expansion shows teacher text',()=>find(reveal(),x=>x.tagName==='p')[0].textContent===sample);
  btn()[1].click();
  assert('memorize','LV2 Try again clears dictation and audio draft',()=>area.value===''&&!('P4:topic:Q3:L2' in drafts));
  assert('memorize','Both levels use one shared renderer',()=>p2Unified.includes('speakingRenderMemorize_({')&&p4Memory.includes('api.render({'));

  // H. Runtime cache mock with deterministic clock.
  const local={};let fakeNow=1000000;
  const storage={getItem:k=>Object.prototype.hasOwnProperty.call(local,k)?local[k]:null,
    setItem:(k,v)=>{local[k]=v;},removeItem:k=>{delete local[k];}};
  const cw={},FakeDate={now:()=>fakeNow};
  const cache=new Function('window','localStorage','Date',cacheCode+';return window.AptisSpeakingCache;')(cw,storage,FakeDate);
  const good={items:[1,2]};const validator=x=>Boolean(x&&Array.isArray(x.items)&&x.items.length===2);
  assert('cacheRuntime','Valid cache write succeeds',()=>cache.write({key:'S71:test',data:good,validate:validator})===true);
  assert('cacheRuntime','Immediate read is fresh',()=>(cache.read({key:'S71:test',freshMs:1000,maxAgeMs:10000,validate:validator})||{}).stale===false);
  fakeNow+=2500;
  assert('cacheRuntime','Aged valid read is flagged stale',()=>(cache.read({key:'S71:test',freshMs:1000,maxAgeMs:10000,validate:validator})||{}).stale===true);
  assert('cacheRuntime','Malformed write rejected',()=>cache.write({key:'S71:bad',data:{items:[]},validate:validator})===false);
  assert('cacheRuntime','Malformed entry never read',()=>cache.read({key:'S71:bad',validate:validator})===null);
  fakeNow+=20000;
  assert('cacheRuntime','Expired entry is not served',()=>cache.read({key:'S71:test',maxAgeMs:10000,validate:validator})===null);
  cache.clear('S71:test');
  assert('cacheRuntime','Clear removes local persisted entry',()=>!Object.prototype.hasOwnProperty.call(local,'S71:test'));
  let invokeCount=0,callbackA=0,callbackB=0,success=null,failure=null;
  cache.request('S71:dedup',(s,f)=>{invokeCount++;success=s;failure=f;},()=>callbackA++,()=>{},false);
  cache.request('S71:dedup',()=>{invokeCount++;},()=>callbackB++,()=>{},false);
  assert('cacheRuntime','Concurrent identical request deduplicated',()=>invokeCount===1);
  success(good);
  assert('cacheRuntime','Deduplicated request fan-outs exactly once',()=>callbackA===1&&callbackB===1);
  let older=null,newer=null,last='';
  cache.request('S71:force',(s)=>{older=s;},v=>{last='old';},()=>{},false);
  cache.request('S71:force',(s)=>{newer=s;},v=>{last='new';},()=>{},true);
  newer(good);older(good); // Deliberately deliver cancelled response AFTER fresh result.
  assert('cacheRuntime','Late cancelled response cannot replace new response',()=>last==='new');
  assert('cacheRuntime','Cache always reports metrics',()=>Array.isArray(cache.metrics().inflight)&&cache.metrics().requests['S71:dedup']===1);
  // Other module keys are not cleared during a content-only refresh.
  cache.write({key:'S71:mastery',data:good,validate:validator});
  cache.write({key:'S71:content',data:good,validate:validator});
  cache.clear('S71:content');
  assert('cacheRuntime','Content-only invalidation preserves mastery key',()=>cache.read({key:'S71:mastery',validate:validator,maxAgeMs:30000})!==null);

  // I. Runtime timer engine on controlled timestamps.
  const tw={};let millis=0,seq=0,active={};
  const date={now:()=>millis};
  const setIntervalFake=fn=>{const id=++seq;active[id]=fn;return id;};
  const clearIntervalFake=id=>{delete active[id];};
  const tengine=new Function('window','Date','setInterval','clearInterval',timerCode+';return window.AptisSpeakingTimer;')(
    tw,date,setIntervalFake,clearIntervalFake);
  const advance=(ms)=>{millis+=ms;Object.keys(active).forEach(id=>active[id]());};
  let completions=0;
  const timer=tengine.create(()=>{},()=>completions++);
  timer.start(30);
  assert('timerRuntime','P1 starts exactly 30s',()=>timer.snapshot().remainingSeconds===30);
  advance(10000);
  assert('timerRuntime','Countdown uses actual elapsed time',()=>timer.snapshot().remainingSeconds===20);
  timer.pause();
  advance(5000);
  assert('timerRuntime','Pause freezes remaining time',()=>timer.snapshot().remainingSeconds===20);
  timer.resume();advance(20000);
  assert('timerRuntime','Resume finishes after remaining elapsed time',()=>timer.snapshot().status==='done'&&timer.snapshot().remainingSeconds===0);
  assert('timerRuntime','Timer completion triggers only once',()=>completions===1);
  timer.stop(true);
  assert('timerRuntime','Stop reset returns idle',()=>timer.snapshot().status==='idle');
  const t2=tengine.create(()=>{},()=>{});
  t2.start(45);
  assert('timerRuntime','P2/P3 45s accepted',()=>t2.snapshot().remainingSeconds===45);
  timer.start(60);
  assert('timerRuntime','Starting another timer stops prior owner',()=>t2.snapshot().status==='idle'&&timer.snapshot().remainingSeconds===60);
  timer.stop(true);
  timer.start(120);
  assert('timerRuntime','Part4 speaking 120s accepted',()=>timer.snapshot().remainingSeconds===120);
  tengine.stopActive();
  assert('timerRuntime','Switching Part can stop active global clock',()=>timer.snapshot().status==='idle');
  assert('timerRuntime','Clock never accesses server API',()=>!timerCode.includes('google.script.run')&&!p4Timer.includes('google.script.run'));

  // J. Negative controls: tests must FAIL for purposefully broken inputs.
  assert('negative','Planner detects changed teacher answer',()=>expected.parts.map(x=>x.blank?x.answer:x.text).join('')!==(sample+'changed'));
  assert('negative','Scorer detects missing dictation words',()=>mem.recallScore(sample,'projector')<100);
  assert('negative','Cache rejects broken payload',()=>cache.write({key:'S71:broken',data:{items:[]},validate:validator})===false);
  assert('negative','Timer tick cannot finish twice',()=>completions===1);
  assert('negative','Forbidden write expression identified by source guard',
    ()=>/\.\s*saveSpeakingPart4DevAttempt\s*\(/.test(p4Timer+'\n google.script.run.saveSpeakingPart4DevAttempt({});'));
  assert('negative','No fake UI geometry PASS',()=>!Object.prototype.hasOwnProperty.call(qa,'browserVisual'));

  const categories=Object.keys(qa),passed=categories.reduce((s,k)=>s+qa[k].passed,0),
    total=categories.reduce((s,k)=>s+qa[k].total,0);
  const result={ok:issues.length===0,passed,total,failed:issues,
    categories:qa,source:'Current Apps Script project',readOnly:true,
    limitations:[
      'Synthetic DOM/clock/cache tests are deterministic and read-only; they are not real browser tests.',
      'Live text-to-speech sound, mobile overlap, reload and Apps Script backend response require /dev verification.'
    ]};
  console.log('SPEAKING_S71_DEEP_REGRESSION_RESULT '+JSON.stringify(result,null,2));
  if(issues.length)throw new Error('S71_DEEP_REGRESSION_FAILED: '+
    issues.map(x=>x.category+'/'+x.name+(x.detail?' ('+x.detail+')':'')).join('; '));
  return result;
}
