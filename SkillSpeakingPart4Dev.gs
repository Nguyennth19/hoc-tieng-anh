/** APTIS B2 Coach — Part 4 DEV-only adapter.
 * Reads P4_IMPORT_STAGING and writes only P4_PROGRESS / P4_ATTEMPTS.
 * Uses the existing database resolution in Database.gs.
 * Unapproved exam sets remain hidden in Exam mode.
 */
function getPart4DevDatabase_() {
  // This file is deployed with the original Apps Script project.
  // Its configured APTIS_DATABASE_ID is the single source of truth.
  const db = getDatabase_();
  if (!db.getSheetByName('P4_IMPORT_STAGING')) {
    throw new Error('Part 4 staging table is missing from the configured database.');
  }
  return db;
}
function readPart4DevTable_(name) {
  const sh = getPart4DevDatabase_().getSheetByName(name);
  if (!sh) throw new Error('DEV table missing: ' + name);
  const values = sh.getDataRange().getDisplayValues();
  if (!values.length) return [];
  const keys = values.shift().map(v => String(v || '').trim());
  return values.filter(row => row[0]).map(row => {
    const out = {};
    keys.forEach((key, i) => { if (key) out[key] = row[i] || ''; });
    return out;
  });
}
/** Exam eligibility requires BOTH explicit content QA and release approval. */
function isSpeakingPart4ExamEligible_(row) {
 return row && row.qa_status === 'APPROVED' && row.release_approved === 'YES';
}
/** Safe, read-only release-gate self-test; run in Apps Script editor. */
function testSpeakingPart4ExamGate() {
 const all=readPart4DevTable_('P4_IMPORT_STAGING');
 const learn=getSpeakingPart4Dev('learn');
 const exam=getSpeakingPart4Dev('exam');
 const expected=all.filter(isSpeakingPart4ExamEligible_);
 const cases={
   completeBank:all.length===51 && learn.sets.length===all.length,
   uniqueIds:new Set(all.map(x=>x.exam_set_id)).size===all.length,
   questionsPresent:all.every(x=>x.q1_original&&x.q2_original&&x.q3_original),
   approvedOnly:exam.sets.length===expected.length &&
     exam.sets.every(x=>isSpeakingPart4ExamEligible_(all.find(r=>r.exam_set_id===x.id))),
   examNoAnswers:exam.sets.every(x=>x.models===null),
   learnAnswers:learn.sets.every(x=>Array.isArray(x.models)&&x.models.length===3),
   timing:exam.preparationSeconds===60&&exam.speakingSeconds===120,
   holdExcluded:exam.sets.every(x=>x.qaStatus!=='QA_HOLD'),
   failClosed:!isSpeakingPart4ExamEligible_({qa_status:'QA_HOLD',release_approved:'YES'}) &&
     !isSpeakingPart4ExamEligible_({qa_status:'APPROVED',release_approved:'NO'}),
   approvedFixture:isSpeakingPart4ExamEligible_({qa_status:'APPROVED',release_approved:'YES'})
 };
 const result={ok:Object.values(cases).every(Boolean),cases,learnCount:learn.sets.length,examCount:exam.sets.length};
 Logger.log(JSON.stringify(result));
 return result;
}
/** Read-only DEV payload. QA_HOLD records are visible in learning mode only. */
function getSpeakingPart4Dev(mode) {
  const choice = mode === 'exam' ? 'exam' : 'learn';
  const all = readPart4DevTable_('P4_IMPORT_STAGING');
  const eligible = choice === 'exam'
    ? all.filter(isSpeakingPart4ExamEligible_)
    : all;
  return {
    mode: choice,
    preparationSeconds: 60,
    speakingSeconds: 120,
    sets: eligible.map(x => ({
      id: x.exam_set_id, topic: x.topic_title || x.q1_original, storyId: x.story_id,
      questions: [x.q1_original, x.q2_original, x.q3_original],
      models: choice === 'learn' ? [x.model_q1, x.model_q2, x.model_q3] : null,
      qaStatus: x.qa_status, releaseApproved: x.release_approved === 'YES'
    })),
    isDev: true,
    unapprovedCount: all.filter(x => x.release_approved !== 'YES').length
  };
}
/** DEV-only integrity check; writes nothing. */
function inspectSpeakingPart4Dev() {
  const sets = readPart4DevTable_('P4_IMPORT_STAGING');
  const templates = []; // Optional editorial working bank is not imported into PROD.
  const stories = []; // Optional editorial working bank is not imported into PROD.
  const ids = sets.map(x => x.exam_set_id);
  return {
    ok: sets.length === 51 && new Set(ids).size === sets.length,
    sets: sets.length, uniqueIds: new Set(ids).size,
    templates: templates.length, stories: stories.length,
    missingQuestions: sets.filter(x => !x.q1_original || !x.q2_original || !x.q3_original).length,
    missingModels: sets.filter(x => !x.model_q1 || !x.model_q2 || !x.model_q3).length,
    approvedSets: sets.filter(x => x.release_approved === 'YES').length
  };
}

/** DEV-only attempt storage; never writes to legacy tables. */
function saveSpeakingPart4DevAttempt(p) {
 if(!p) throw Error('Missing attempt.');
 const id=String(p.questionId||''),session=String(p.clientSessionId||'');
 if(!/^(SPK-P04-T\d{3}-V\d{2}|A\d{2}|S\d{2})$/.test(id)||!/^[A-Za-z0-9_-]{8,90}$/.test(session)) throw Error('Invalid ID.');
 const elapsed=Number(p.elapsedSeconds),rating=Number(p.selfRating);
 if(!Number.isFinite(elapsed)||elapsed<0||elapsed>120||!Number.isInteger(rating)||rating<0||rating>5) throw Error('Invalid attempt.');
 const mode=p.mode==='exam'?'exam':'learn';
 const q=readPart4DevTable_('P4_IMPORT_STAGING').find(x=>x.exam_set_id===id);
 if(!q) throw Error('Unknown set.');
 if(mode==='exam'&&(q.qa_status!=='APPROVED'||q.release_approved!=='YES'))throw Error('Unapproved exam set.');
 const db=getPart4DevDatabase_(),lock=LockService.getScriptLock();lock.waitLock(10000);
 try{
  const a=db.getSheetByName('P4_ATTEMPTS'),pr=db.getSheetByName('P4_PROGRESS');
  if(!a||!pr)throw Error('DEV progress schema absent.');
  const prior=a.getDataRange().getValues();
  for(let i=1;i<prior.length;i++)if(String(prior[i][9])===session)return {ok:true,duplicate:true,attemptId:String(prior[i][0])};
  const time=new Date(),uuid=Utilities.getUuid(),note=String(p.note||'').slice(0,300).replace(/[\u0000-\u001f]/g,' ');
  a.appendRow([uuid,time,id,elapsed,elapsed>=115,rating,note,mode,q.story_id,session,q.source_version]);
  const rows=pr.getDataRange().getValues(),idx=rows.findIndex((x,i)=>i>0&&String(x[0])===id),old=idx>=0?rows[idx]:null,count=Number(old?old[3]:0)+1;
  const days=rating<=1?0:rating===2?1:rating===3?Math.min(3+count,7):rating===4?Math.min(7+count*2,21):Math.min(14+count*3,45);
  const due=new Date(time);if(days===0)due.setHours(due.getHours()+6);else{due.setDate(due.getDate()+days);due.setHours(7,0,0,0);}
  const status=rating>=4?'learned':'learning',row=[id,status,rating,count,time,due,note,old?old[7]===true:false,uuid,q.source_version];
  if(idx>=0)pr.getRange(idx+1,1,1,row.length).setValues([row]);else pr.appendRow(row);
  return {ok:true,attemptId:uuid,progress:{questionId:id,status,rating,reviewCount:count,nextReview:due.toISOString()}};
 }finally{lock.releaseLock();}
}
function getSpeakingPart4DevProgress(){
 const sh=getPart4DevDatabase_().getSheetByName('P4_PROGRESS');
 if(!sh)throw Error('Missing DEV progress sheet.');
 return sh.getDataRange().getDisplayValues().slice(1).filter(x=>x[0]).map(x=>({questionId:x[0],status:x[1],rating:Number(x[2])||0,reviewCount:Number(x[3])||0,lastReviewed:x[4],nextReview:x[5]}));
}

/** Independent Part4 memorization records. Never changes legacy progress. */
function getSpeakingPart4Mastery() {
 const sh=getPart4DevDatabase_().getSheetByName('P4_MASTERY');
 if(!sh)throw Error('P4_MASTERY missing');
 return sh.getDataRange().getDisplayValues().slice(1).filter(r=>r[0]).map(r=>({
  questionId:r[0],level:Number(r[3])||0,practiceCount:Number(r[6])||0,
  lastPractice:r[4],lastPracticeMode:r[5]
 }));
}
function saveSpeakingPart4Mastery(p){
 const id=String(p&&p.questionId||''),level=Number(p&&p.level),mode=String(p&&p.practiceMode||'learn');
 if(!/^(SPK-P04-T\d{3}-V\d{2}|A\d{2}|S\d{2})$/.test(id)||
   !Number.isInteger(level)||level<0||level>3||!['learn','recall','exam'].includes(mode))throw Error('Invalid mastery update');
 const db=getPart4DevDatabase_(),lock=LockService.getScriptLock();lock.waitLock(10000);
 try{
  const sh=db.getSheetByName('P4_MASTERY');if(!sh)throw Error('P4_MASTERY missing');
  const rows=sh.getDataRange().getValues();const ix=rows.findIndex((r,i)=>i>0&&String(r[0])===id);
  if(ix<1)throw Error('Unknown Part4 set');
  const row=rows[ix],count=(Number(row[6])||0)+1;
  sh.getRange(ix+1,4,1,5).setValues([[level,new Date(),mode,count,String(p.note||'').slice(0,200)]]);
  return {ok:true,questionId:id,level,practiceCount:count};
 }finally{lock.releaseLock();}
}
function testSpeakingPart4LearningTools(){
 const all=readPart4DevTable_('P4_IMPORT_STAGING'),mastery=getSpeakingPart4Mastery();
 const ok=all.length===51&&mastery.length===51&&
 new Set(mastery.map(x=>x.questionId)).size===51&&
 all.every(x=>mastery.some(m=>m.questionId===x.exam_set_id&&m.level>=0&&m.level<=3));
 const result={ok,sets:all.length,masteryRows:mastery.length,approved:all.filter(isSpeakingPart4ExamEligible_).length};
 Logger.log(JSON.stringify(result));return result;
}
