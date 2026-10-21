/**
 * PHASE 2.2 STAGING ONLY. Do not include in production Apps Script.
 * Install in an isolated, copied Apps Script project; NEVER original.
 * Before running, in staging Script Properties set APTIS_DATABASE_ID
 * to QA_WORKBOOK_ID below, and verify the distinct staging script URL.
 * Does not run without the exact QA ID and a manual explicit flag.
 */
const QA_PHASE22_WORKBOOK_ID = '1yCG2GmoQ0ki9IpmoZeD_kKHN-RJHgUeX0d89UE19GxI';
function phase22AssertStaging_() {
  const props = PropertiesService.getScriptProperties();
  const actual = String(props.getProperty('APTIS_DATABASE_ID') || '').trim();
  if (actual !== QA_PHASE22_WORKBOOK_ID) throw new Error('BLOCKED: Script Properties APTIS_DATABASE_ID does not equal QA workbook.');
  const ss = getDatabase_();
  if (ss.getId() !== QA_PHASE22_WORKBOOK_ID) throw new Error('BLOCKED: getDatabase_ is not QA.');
  if (QA_PHASE22_WORKBOOK_ID === DATABASE_SPREADSHEET_ID) throw new Error('BLOCKED: QA and embedded database ID must differ.');
  return ss;
}
function phase22Snapshot_() {
  const ss = phase22AssertStaging_();
  const names = ['SPEAKING','SPEAKING_P2','SPEAKING_P3','PROGRESS','ATTEMPTS','SETTINGS','MEDIA'];
  const result = {};
  names.forEach(function(name) {
    const sh = ss.getSheetByName(name);
    if (!sh) throw new Error('Missing QA tab: ' + name);
    const values = sh.getDataRange().getValues().map(function(row) {
      return row.map(function(v) { return v instanceof Date ? v.toISOString() : v; });
    });
    const formulas = sh.getDataRange().getFormulas();
    const payload = JSON.stringify({values:values,formulas:formulas});
    const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,payload,Utilities.Charset.UTF_8)
      .map(function(b){return ('0'+(b & 255).toString(16)).slice(-2);}).join('');
    const header = values[0] || [];
    const populated = values.slice(1).filter(function(row){return row.some(function(v){return String(v == null ? '' : v).trim();});});
    const ids = populated.map(function(row){
      // PROGRESS key is questionId in column A. ATTEMPTS are events, not unique question IDs.
      if (name === 'ATTEMPTS') return JSON.stringify([row[0], row[1], row[6], row[7]]);
      return String(row[0] == null ? '' : row[0]);
    });
    result[name] = {rows:ids.length,duplicates:ids.length-new Set(ids).size,hash:digest};
  });
  return {workbookId:ss.getId(),checkedAt:new Date().toISOString(),sheets:result};
}
/**
 * Read-only preflight. Run this first and save returned JSON externally.
 */
function phase22PreflightReadOnly() {
  const snapshot = phase22Snapshot_();
  const p3 = phase22AssertStaging_().getSheetByName('SPEAKING_P3');
  if (p3.getLastRow()<2) throw new Error('QA P3 empty. Migration run forbidden.');
  return snapshot;
}
/**
 * Explicit opt-in for disposable staging only.
 * First run phase22PreflightReadOnly() and retain result.
 * Execution can change QA copy and create Drive media via migration.
 * Never run in the original Apps Script project.
 */
function phase22RunMigrationOnQACopy(acknowledge) {
  if (acknowledge !== 'I_CONFIRM_DISPOSABLE_QA_ONLY') {
    throw new Error('BLOCKED: explicit opt-in required.');
  }
  const before = phase22PreflightReadOnly();
  const report = runMigrations();
  const after = phase22Snapshot_();
  const protectedNames = ['SPEAKING_P3','PROGRESS','ATTEMPTS'];
  const changedProtected = protectedNames.filter(function(n){return before.sheets[n].hash!==after.sheets[n].hash;});
  return {ok:changedProtected.length===0,changedProtected:changedProtected,before:before,after:after,migration:report};
}

/**
 * Read-only media isolation check for Phase 2.2.
 * Run in the separate staging script after setting APTIS_MEDIA_FOLDER_ID.
 * This validates the exact QA folder independently of the copied workbook.
 */
function phase22VerifyMediaIsolationReadOnly() {
  phase22AssertStaging_();
  const expectedId = '1gMnGKRexXcSi_C_tKBHWVsOOAC_vULus';
  const expectedName = 'APTIS_B2_PHASE22_MEDIA_QA_ONLY';
  const props = PropertiesService.getScriptProperties();
  const actualId = String(props.getProperty('APTIS_MEDIA_FOLDER_ID') || '').trim();
  if (actualId !== expectedId) throw new Error('BLOCKED: APTIS_MEDIA_FOLDER_ID is not the approved QA folder.');
  const folder = DriveApp.getFolderById(actualId);
  if (folder.getId() !== expectedId || folder.getName() !== expectedName) {
    throw new Error('BLOCKED: Drive folder identity/name mismatch.');
  }
  const result = {ok:true,stagingWorkbookId:QA_PHASE22_WORKBOOK_ID,qaMediaFolderId:folder.getId(),qaMediaFolderName:folder.getName()};
  console.log(JSON.stringify(result,null,2));
  return result;
}
