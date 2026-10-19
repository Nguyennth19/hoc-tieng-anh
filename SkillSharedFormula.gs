/** Shared B1/B1+ formula dictionary, source: APTIS_SHARED_FORMULAS.
 * Read-only for any skill: Speaking, Writing, Reading, or later modules.
 * This module does not modify progress or existing exercises.
 */
function getAptisSharedFormulas() {
  const sh=getDatabase_().getSheetByName('APTIS_SHARED_FORMULAS');
  if(!sh)return [];
  const a=sh.getDataRange().getDisplayValues();
  return a.slice(1).filter(r=>r[0]&&r[1]).map(r=>({
    id:r[0],phrase:r[1],skillCoverage:r[2]||''
  }));
}
function testAptisSharedFormulas() {
  const a=getAptisSharedFormulas();
  const ok=a.length>=18&&new Set(a.map(x=>x.id)).size===a.length;
  const result={ok,count:a.length};Logger.log(JSON.stringify(result));return result;
}
