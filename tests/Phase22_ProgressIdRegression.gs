/**
 * Speaking Progress ID read-only regression, Phase 2.2.
 * Run ONLY on separate staging Apps Script.
 * No Sheet writes. Excludes inactive and incomplete prompts.
 */
function phase22TestProgressIdsReadOnly() {
  if (typeof phase22AssertStaging_ !== 'function') throw new Error('STAGING ONLY: guard missing.');
  phase22AssertStaging_();
  const checks=[];
  const add=function(label,actual,expected) {
    checks.push({label:label,pass:actual===expected,actual:actual,expected:expected});
  };
  const parts=[
    {part:2,items:getSpeakingPart2_()},
    {part:3,items:getSpeakingPart3Full_()}
  ];
  parts.forEach(function(group){
    group.items.forEach(function(item){
      for(var p=1;p<=3;p++){
        const complete=!!(item.questions&&item.models&&String(item.questions[p-1]||'').trim()&&String(item.models[p-1]||'').trim());
        add('P'+group.part+' '+item.id+'-'+p,isValidQuestionId_(item.id+'-'+p,false),complete);
      }
      add('Reject bare '+item.id,isValidQuestionId_(item.id,false),false);
      add('Allow favorite '+item.id,isValidQuestionId_(item.id,true),true);
    });
  });
  ['SP2-EX-999-1','SP3-EX-999-3','SP2-001-4','SP3-001-0','SP1-999','SP2-EX-001-9','arbitrary'].forEach(function(id){
    add('Reject invalid '+id,isValidQuestionId_(id,false),false);
  });
  const failed=checks.filter(function(c){return !c.pass;});
  const result={ok:failed.length===0,totalChecks:checks.length,failed:failed.slice(0,25),counts:parts.map(function(p){return {part:p.part,topics:p.items.length};})};
  console.log('PHASE22_PROGRESS_ID_REGRESSION '+JSON.stringify(result,null,2));
  if(!result.ok) throw new Error('Progress ID regression failed: '+failed.length+' checks');
  return result;
}
