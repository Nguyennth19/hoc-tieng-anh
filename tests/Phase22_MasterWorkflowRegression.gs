/**
 * Phase 2.2 Master workflow regression — READ ONLY.
 * Run only from APTIS_B2_PHASE22_STAGING_ONLY.
 */
function phase22TestMasterWorkflowReadOnly() {
  if (typeof phase22AssertStaging_ !== 'function') throw new Error('STAGING ONLY.');
  phase22AssertStaging_();
  const tests=[];
  const check=function(name,actual,expected){ tests.push({name:name,pass:actual===expected}); };
  check('new to learned is first save',isRepeatedMasterConfirmation_(['SP2-EX-001-1','new'], 'learned'),false);
  check('learning to learned is first save',isRepeatedMasterConfirmation_(['SP2-EX-001-1','learning'], 'learned'),false);
  check('learned to learned is duplicate',isRepeatedMasterConfirmation_(['SP2-EX-001-1','learned'], 'learned'),true);
  check('learned to learning is not duplicate-master',isRepeatedMasterConfirmation_(['SP2-EX-001-1','learned'], 'learning'),false);
  const mk=function(n){return [0,1,2].map(function(i){return {status:i<n?'learned':'new'};});};
  for(var n=0;n<=3;n++){
    const progress=mk(n);
    const mastered=progress.filter(function(p){return p.status==='learned';}).length;
    check('Q1 Q2 Q3 aggregate '+n,mastered,n);
    check('topic mastered only at 3/'+n,mastered===progress.length,n===3);
  }
  const failed=tests.filter(function(t){return !t.pass;});
  const result={ok:failed.length===0,totalChecks:tests.length,failed:failed};
  console.log('PHASE22_MASTER_WORKFLOW_REGRESSION '+JSON.stringify(result,null,2));
  if (!result.ok) throw new Error('PHASE22 master workflow regression failed.');
  return result;
}
