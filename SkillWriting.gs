/** Writing V1: reads WRITING bank without touching Speaking tables. */
function getWritingBootstrap_(){
  const sheet=getDatabase_().getSheetByName('WRITING');
  if(!sheet || sheet.getLastRow()<2) return {skill:'writing',available:false,modules:[],items:[]};
  const values=sheet.getDataRange().getDisplayValues(),headers=values.shift();
  const items=values.filter(r=>r[0] && String(r[8]).toLowerCase()!=='false').map(r=>{
    const q={};headers.forEach((key,i)=>{if(key)q[key]=r[i]||'';});
    q.part=Number(q.part)||1;
    return q;
  });
  const examSheet=getDatabase_().getSheetByName('WRITING_EXAM_SOURCES');
  let exams=[];
  if(examSheet&&examSheet.getLastRow()>1){
    const data=examSheet.getDataRange().getDisplayValues(),names=data.shift();
    exams=data.filter(row=>row[0]).map(row=>{const o={};names.forEach((name,i)=>{if(name)o[name]=row[i]||'';});return o;});
  }
  const answerSheet=getDatabase_().getSheetByName('WRITING_EXAM_ANSWERS');
  if(answerSheet&&answerSheet.getLastRow()>1){
    const values=answerSheet.getDataRange().getDisplayValues(),answerHeaders=values.shift();
    const answerMap={};
    values.filter(row=>row[0]).forEach(row=>{
      const record={};answerHeaders.forEach((h,i)=>{if(h)record[h]=row[i]||'';});
      answerMap[record.examId]=record;
    });
    exams.forEach(exam=>{
      const rec=answerMap[exam.examId];if(!rec)return;
      exam.part2_model=rec.part2_model||'';
      ['part1_questions_json','part1_models_json','part3_models_json'].forEach(key=>{
        try{exam[key.replace('_json','')]=JSON.parse(rec[key]||'[]');}
        catch(e){exam[key.replace('_json','')]=[];}
      });
    });
  }
  return {skill:'writing',available:true,items,exams,modules:[1,2,3,4].map(part=>({part,count:items.filter(q=>q.part===part).length}))};
}
function getWritingBootstrap(){return getWritingBootstrap_();}
