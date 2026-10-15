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
  return {skill:'writing',available:true,items,exams,modules:[1,2,3,4].map(part=>({part,count:items.filter(q=>q.part===part).length}))};
}
function getWritingBootstrap(){return getWritingBootstrap_();}
