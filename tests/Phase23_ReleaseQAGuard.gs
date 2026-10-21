/**
 * PHASE 2.3 QA ONLY. Never copy this file into production Apps Script.
 * Use with a NEW isolated staging Apps Script project, bound to the disposable
 * Phase 2.3 QA workbook. Not the Phase 2.2 project and not production.
 */
const PHASE23_QA_WORKBOOK = '1M4I1ZmwscCVsihxTuAVSEPHdRdYjIEV0DEGQyYDFpeI';
const PHASE23_QA_MEDIA = '10XYy1NgFzpKO51ZjleFIsmae3BN7Lcts';

function phase23AssertQA_() {
  const p=PropertiesService.getScriptProperties();
  if (String(p.getProperty('APTIS_DATABASE_ID')||'').trim()!==PHASE23_QA_WORKBOOK)
    throw new Error('BLOCKED: Phase 2.3 APTIS_DATABASE_ID mismatch.');
  if (String(p.getProperty('APTIS_MEDIA_FOLDER_ID')||'').trim()!==PHASE23_QA_MEDIA)
    throw new Error('BLOCKED: Phase 2.3 APTIS_MEDIA_FOLDER_ID mismatch.');
  if (String(DATABASE_SPREADSHEET_ID||'').trim()===PHASE23_QA_WORKBOOK)
    throw new Error('BLOCKED: QA workbook ID must not be embedded in Config.gs.');
  const ss=getDatabase_();
  if (ss.getId()!==PHASE23_QA_WORKBOOK) throw new Error('BLOCKED: wrong database.');
  const folder=DriveApp.getFolderById(PHASE23_QA_MEDIA);
  if (folder.getName()!=='APTIS_B2_PHASE23_RELEASE_QA_MEDIA_ONLY')
    throw new Error('BLOCKED: wrong QA media folder.');
  return ss;
}

function phase23QASnapshot_() {
  const ss=phase23AssertQA_();
  const names=['SPEAKING','SPEAKING_P2','SPEAKING_P3','PROGRESS','ATTEMPTS','SETTINGS','MEDIA'];
  const sheets={};
  names.forEach(function(n){
    const sh=ss.getSheetByName(n);
    if (!sh) throw new Error('BLOCKED: missing tab '+n);
    const range=sh.getDataRange();
    const values=range.getValues().map(function(row){
      return row.map(function(v){return v instanceof Date?v.toISOString():v;});
    });
    const formulas=range.getFormulas();
    const hash=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,
      JSON.stringify({values:values,formulas:formulas}),Utilities.Charset.UTF_8)
      .map(function(b){return ('0'+(b&255).toString(16)).slice(-2);}).join('');
    sheets[n]={dataRows:Math.max(0,values.length-1),hash:hash};
  });
  return {workbookId:ss.getId(),sheets:sheets};
}

function phase23ReleaseQAPreflight() {
  const ss=phase23AssertQA_();
  assertSpeakingMigrationBanksReady_(ss);
  const before=phase23QASnapshot_();
  console.log('PHASE23_RELEASE_QA_PREFLIGHT '+JSON.stringify(before,null,2));
  return before;
}

/**
 * Controlled migration, opt-in once using Script Property:
 * APTIS_PHASE23_QA_RUN_ONCE = I_CONFIRM_PHASE23_DISPOSABLE_ONLY
 *
 * Never run runMigrations() directly.
 */
function phase23RunReleaseQAOnce() {
  const p=PropertiesService.getScriptProperties();
  const key='APTIS_PHASE23_QA_RUN_ONCE';
  if (p.getProperty(key)!=='I_CONFIRM_PHASE23_DISPOSABLE_ONLY')
    throw new Error('BLOCKED: Phase 2.3 disposable QA opt-in missing.');
  p.deleteProperty(key);
  const before=phase23ReleaseQAPreflight();
  console.log('PHASE23_RELEASE_QA_BEFORE '+JSON.stringify(before));
  let migration;
  try { migration=runMigrations(); }
  catch(e) {
    console.error('PHASE23_RELEASE_QA_MIGRATION_ERROR '+String(e&&e.stack||e));
    throw e;
  }
  const after=phase23QASnapshot_();
  const critical=['SPEAKING','SPEAKING_P2','SPEAKING_P3','PROGRESS','ATTEMPTS'];
  const changed=critical.filter(function(n){return before.sheets[n].hash!==after.sheets[n].hash;});
  const mediaRowsStable=before.sheets.MEDIA.hash===after.sheets.MEDIA.hash;
  const folderId=String(getSetting_(phase23AssertQA_().getSheetByName('SETTINGS'),'media_folder_id')||'');
  const issues=[];
  if(changed.length)issues.push('Protected content or progress changed: '+changed.join(','));
  if(!mediaRowsStable) issues.push('MEDIA changed; review keys/files before acceptance.');
  if(folderId!==PHASE23_QA_MEDIA)issues.push('SETTINGS media folder mismatch.');
  if(!migration || migration.ok!==true || migration.spreadsheetId!==PHASE23_QA_WORKBOOK)
    issues.push('Migration returned unexpected result.');
  const result={ok:issues.length===0,issues:issues,before:before,after:after,migration:migration};
  console.log('PHASE23_RELEASE_QA_RESULT '+JSON.stringify(result,null,2));
  if(issues.length) throw new Error('PHASE23_QA_FAIL: '+issues.join(' | '));
  return result;
}

/**
 * Phase 2.3 startup regression, QA ONLY.
 * Tests both cache path and refreshed bootstrap; snapshots all seven tabs
 * before and after each read. Never manually call runMigrations() here.
 */
function phase23TestAutomaticStartupReadOnly() {
  phase23AssertQA_();
  const before=phase23QASnapshot_();
  const first=getBootstrapData(false);
  const afterFirst=phase23QASnapshot_();
  const second=getBootstrapData(false);
  const afterSecond=phase23QASnapshot_();
  const counts=function(result) {
    if (!result || !Array.isArray(result.part1) ||
        !Array.isArray(result.part2) || !Array.isArray(result.part3)) {
      throw new Error('BLOCKED: invalid bootstrap structure.');
    }
    return {part1:result.part1.length,part2:result.part2.length,part3:result.part3.length};
  };
  const actualFirst=counts(first),actualSecond=counts(second);
  const expected={part1:49,part2:51,part3:52};
  const issues=[];
  [actualFirst,actualSecond].forEach(function(item,i) {
    Object.keys(expected).forEach(function(key) {
      if(item[key]!==expected[key]) issues.push('Bootstrap '+(i+1)+' '+key+' expected '+expected[key]+' got '+item[key]);
    });
  });
  ['SPEAKING','SPEAKING_P2','SPEAKING_P3','PROGRESS','ATTEMPTS','SETTINGS','MEDIA'].forEach(function(name) {
    if (before.sheets[name].hash!==afterFirst.sheets[name].hash)
      issues.push(name+' changed during first bootstrap');
    if (afterFirst.sheets[name].hash!==afterSecond.sheets[name].hash)
      issues.push(name+' changed during second bootstrap');
  });
  const result={
    ok:issues.length===0,
    issues:issues,
    qaWorkbookId:before.workbookId,
    expected:expected,
    first:actualFirst,
    second:actualSecond,
    checksumsUnchanged:issues.filter(function(x){return x.indexOf('changed during')>=0;}).length===0,
    before:before,
    after:afterSecond
  };
  console.log('PHASE23_AUTOMATIC_STARTUP_QA_RESULT '+JSON.stringify(result,null,2));
  if(!result.ok) throw new Error('PHASE23_STARTUP_QA_FAIL: '+issues.join(' | '));
  return result;
}
