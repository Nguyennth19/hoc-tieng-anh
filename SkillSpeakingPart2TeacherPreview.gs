/**
 * Part 02 teacher-first preview bank (SAFE/READ ONLY).
 * New module; not wired into PROD until editorial QA passes.
 * Reads exactly 53 source sets x three prompt positions from staging.
 *
 * Authoritative instructor scaffold: "02. Speaking_Part 2.pdf".
 * Important: instructor TEMPLATE is verified, individual 53-set ANSWERS are not.
 */
const PART2_TEACHER_BANK_VERSION = '3.0.0-preview';
const PART2_TEACHER_STAGING_TAB = 'P2_53_SETS_TEACHER_FIRST_STAGING';
const PART2_TEACHER_COVERAGE_EXPECTED = 53;
const PART2_TEACHER_ANSWERS_TAB = 'P2_TEACHER_VERBATIM_ANSWERS';
const PART2_PROMPT_SECONDS = 45;

function getPart2TeacherFirstPreview_() {
  const ss = getDatabase_();
  const sheet = ss.getSheetByName(PART2_TEACHER_STAGING_TAB);
  if (!sheet) throw new Error('Missing QA staging tab: '+PART2_TEACHER_STAGING_TAB);
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) throw new Error('Empty Part 02 source bank');
  const col = {};
  values[0].forEach(function(h,i){ col[String(h).trim()] = i; });
  const required = ['source_set_id','question_id','question_slot','source_question_exact','easy_memory_pattern','teacher_model_status','release_gate','image_QA'];
  required.forEach(function(h){if(col[h] === undefined)throw new Error('Missing required column '+h);});
  const answerSheet = ss.getSheetByName(PART2_TEACHER_ANSWERS_TAB);
  const answerRows = answerSheet ? answerSheet.getDataRange().getValues() : [];
  const answers = {};
  if (answerRows.length > 1) {
    const ah = {}; answerRows[0].forEach(function(h,i){ ah[String(h).trim()] = i; });
    ['question_id','teacher_answer_exact','verification'].forEach(function(k){if(ah[k]===undefined)throw new Error('Missing answer field '+k);});
    answerRows.slice(1).forEach(function(row){
      const id=String(row[ah.question_id]||'').trim();
      if(!id) return;
      if(answers[id]) throw new Error('Duplicate answer ID: '+id);
      answers[id] = {text:String(row[ah.teacher_answer_exact]||''),status:String(row[ah.verification]||'')};
    });
  }
  const groups={}, order=[];
  values.slice(1).forEach(function(row){
    const setId=String(row[col.source_set_id] || '').trim();
    if(!setId)return;
    if(!groups[setId]){groups[setId]={id:setId,part:2,topic:String(row[col.topic_context] || ''),series:String(row[col.series] || ''),prompts:[],active:false,releaseState:'HOLD',teacherVerified:false};order.push(setId);}
    const slot=String(row[col.question_slot]||'').trim();
    const q=String(row[col.source_question_exact]||'').trim();
    const gate=String(row[col.release_gate]||'').trim();
    const teacher=String(row[col.teacher_model_status]||'');
    const media=String(row[col.image_QA]||'');
    // Every display eligibility check is on the exact question, not its topic.
    const answer=answers[String(row[col.question_id]||'')] || {text:'',status:'NOT_FOUND'};
    // NO substring matching: pending editorial answers are not approved.
    const approved = Boolean(q) && Boolean(answer.text) && gate === 'APPROVED_FOR_RELEASE' &&
      answer.status === 'TEACHER_ANSWER_EDITORIALLY_APPROVED' &&
      teacher === 'INDIVIDUAL_ANSWER_VERIFIED' &&
      media === 'VISUAL_QA_PASS';
    groups[setId].prompts.push({
      id:String(row[col.question_id]||''),slot:slot,question:q,
      memoryPattern:String(row[col.easy_memory_pattern]||''),
      teacherStatus:teacher,imageQA:media,releaseGate:gate,
      model: answer.text, answerSourceStatus:answer.status, seconds:PART2_PROMPT_SECONDS,
      approved:approved
    });
  });
  if(order.length!==PART2_TEACHER_COVERAGE_EXPECTED)throw new Error('Unexpected source-set count: '+order.length);
  const result=order.map(function(id){
    const group=groups[id];
    group.prompts.sort(function(a,b){return Number(a.slot.slice(1))-Number(b.slot.slice(1));});
    if(group.prompts.length!==3 || group.prompts.map(function(p){return p.slot;}).join(',')!=='Q1,Q2,Q3') {
      throw new Error('Invalid Q1/Q2/Q3 positions in '+id);
    }
    group.teacherVerified=group.prompts.every(function(p){return p.approved;});
    group.active=group.teacherVerified;
    group.releaseState=group.active?'APPROVED':'HOLD';
    return group;
  });
  return {version:PART2_TEACHER_BANK_VERSION,mode:'EDITORIAL_PREVIEW_ONLY',
    sets:result,approved:result.filter(function(x){return x.active;}).length,
    held:result.filter(function(x){return !x.active;}).length};
}

/**
 * No current-facing write path. This is a QA inventory; never merge into
 * getSpeakingPart2_() without verified individual answers and image checks.
 */
function qaPart2TeacherFirstInventory_() {
  const b=getPart2TeacherFirstPreview_();
  const questions=b.sets.reduce(function(n,s){return n+s.prompts.length;},0);
  const blank=b.sets.reduce(function(n,s){return n+s.prompts.filter(function(p){return !p.question;}).length;},0);
  return {version:b.version,sourceSets:b.sets.length,questionPositions:questions,
    blankQuestionPositions:blank,approvedSets:b.approved,heldSets:b.held};
}

/**
 * New read-only app adapter. Keeps source-set and question IDs separate from
 * the existing SP2-EX-xxx IDs, so progress keys are never reused.
 * Called only after a set passes all QA gates; default live Part 02 is unchanged.
 */
function getApprovedPart2TeacherFirstSets_() {
  const bank = getPart2TeacherFirstPreview_();
  return bank.sets.filter(function(s){return s.active;}).map(function(s){
    return {
      id:s.id, part:2, topic:s.topic, isTeacherFirst:true,
      questions:s.prompts.map(function(p){return p.question;}),
      models:s.prompts.map(function(p){return p.model;}),
      structures:s.prompts.map(function(p){return p.memoryPattern;}),
      promptIds:s.prompts.map(function(p){return p.id;}),
      promptSeconds:[45,45,45], progressScope:'source-prompt'
    };
  });
}
