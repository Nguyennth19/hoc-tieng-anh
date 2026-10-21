/**
 * Phase 2.2 — Progress ID regression, read-only.
 * Avoid repeated Sheet reads: temporarily replace bank loaders with cached
 * in-memory results, restore them in finally even when an assertion fails.
 */
function phase22TestProgressIdsReadOnly() {
  if (typeof phase22AssertStaging_ !== 'function') throw new Error('STAGING ONLY: guard missing.');
  phase22AssertStaging_();

  const p1=getSpeakingPart1_();
  const p2=getSpeakingPart2_();
  const p3=getSpeakingPart3Full_();

  const savedP1=getSpeakingPart1_;
  const savedP2=getSpeakingPart2_;
  const savedP3=getSpeakingPart3Full_;
  const checks=[];
  const add=function(label,actual,expected) {
    checks.push({label:label,pass:actual===expected,actual:actual,expected:expected});
  };
  try {
    // GAS server functions are global; override only in this synchronous QA call.
    getSpeakingPart1_=function(){return p1;};
    getSpeakingPart2_=function(){return p2;};
    getSpeakingPart3Full_=function(){return p3;};

    [{part:2,items:p2},{part:3,items:p3}].forEach(function(group) {
      group.items.forEach(function(item) {
        for (var prompt=1;prompt<=3;prompt++) {
          const complete=!!(item.questions && item.models &&
            String(item.questions[prompt-1]||'').trim() &&
            String(item.models[prompt-1]||'').trim());
          add('P'+group.part+' '+item.id+'-'+prompt,
            isValidQuestionId_(item.id+'-'+prompt,false),complete);
        }
        add('Reject bare '+item.id,isValidQuestionId_(item.id,false),false);
        add('Allow topic '+item.id,isValidQuestionId_(item.id,true),true);
      });
    });
    ['SP2-EX-999-1','SP3-EX-999-3','SP2-001-4','SP3-001-0','SP1-999','SP2-EX-001-9','arbitrary'].forEach(function(id) {
      add('Reject invalid '+id,isValidQuestionId_(id,false),false);
    });
  } finally {
    getSpeakingPart1_=savedP1;
    getSpeakingPart2_=savedP2;
    getSpeakingPart3Full_=savedP3;
  }

  const failed=checks.filter(function(x){return !x.pass;});
  const result={
    ok:failed.length===0,
    totalChecks:checks.length,
    failed:failed.slice(0,25),
    counts:[{part:1,questions:p1.length},{part:2,topics:p2.length},{part:3,topics:p3.length}]
  };
  console.log('PHASE22_PROGRESS_ID_REGRESSION '+JSON.stringify(result,null,2));
  if (!result.ok) throw new Error('Progress ID regression failed: '+failed.length+' checks');
  return result;
}
