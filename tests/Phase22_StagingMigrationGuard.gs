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
function phase22CaptureIdentity_() {
  const ss = phase22AssertStaging_();
  const rowsFor = function(name) {
    const sheet = ss.getSheetByName(name);
    const values = sheet.getDataRange().getDisplayValues().slice(1);
    return values.filter(function(row) {
      return row.some(function(value) { return String(value).trim() !== ''; });
    });
  };
  const idsFor = function(name) {
    return rowsFor(name).map(function(row) { return String(row[0]).trim(); });
  };
  const mediaRows = rowsFor(SHEET_NAMES.MEDIA);
  return {
    p1Ids:idsFor(SHEET_NAMES.SPEAKING_P1),
    p2Ids:idsFor(SHEET_NAMES.SPEAKING_P2),
    p3Ids:idsFor(SHEET_NAMES.SPEAKING_P3),
    mediaMap:mediaRows.reduce(function(map,row) {
      const assetKey=String(row[0]).trim();
      if (assetKey) map[assetKey]=String(row[3]).trim();
      return map;
    },{})
  };
}

function phase22CompareMigrationQA_(before,after,identitiesBefore,identitiesAfter,migration) {
  const protectedNames=['SPEAKING_P3','PROGRESS','ATTEMPTS'];
  const changedProtected=protectedNames.filter(function(name) {
    return before.sheets[name].hash !== after.sheets[name].hash;
  });
  const issues=[];
  if (migration.spreadsheetId !== QA_PHASE22_WORKBOOK_ID) {
    issues.push('Migration returned unexpected spreadsheetId.');
  }
  if (changedProtected.length) issues.push('Protected checksum changed: '+changedProtected.join(', '));
  ['p1Ids','p2Ids','p3Ids'].forEach(function(key) {
    const a=identitiesBefore[key],b=identitiesAfter[key];
    if (JSON.stringify(a)!==JSON.stringify(b)) issues.push('Bank IDs/order changed: '+key);
  });
  const beforeMedia=identitiesBefore.mediaMap,afterMedia=identitiesAfter.mediaMap;
  Object.keys(beforeMedia).forEach(function(key) {
    if (afterMedia[key]!==beforeMedia[key]) issues.push('Existing media mapping changed: '+key);
  });
  const oldCount=Object.keys(beforeMedia).length,newCount=Object.keys(afterMedia).length;
  if (newCount<oldCount) issues.push('MEDIA asset keys decreased.');
  if (after.sheets.MEDIA.duplicates) issues.push('MEDIA has duplicate asset keys.');
  const folderId=String(getSetting_(phase22AssertStaging_().getSheetByName(SHEET_NAMES.SETTINGS),'media_folder_id')||'').trim();
  if (folderId!=='1gMnGKRexXcSi_C_tKBHWVsOOAC_vULus') issues.push('SETTINGS.media_folder_id is not QA folder.');
  return {
    ok:issues.length===0,
    issues:issues,
    protectedChecksumsChanged:changedProtected,
    bankIdsAndOrderPreserved:!issues.some(function(x){return x.indexOf('Bank IDs/order changed')===0;}),
    oldMediaAssetCount:oldCount,
    newMediaAssetCount:newCount,
    settingsMediaFolderId:folderId
  };
}

/**
 * Controlled QA migration. Use only the wrapper below; NEVER call runMigrations()
 * directly from the Apps Script function selector.
 */
function phase22RunMigrationOnQACopy(acknowledge) {
  if (acknowledge !== 'I_CONFIRM_DISPOSABLE_QA_ONLY') {
    throw new Error('BLOCKED: explicit opt-in required.');
  }
  const audit=phase22FinalReadOnlyAudit();
  if (!audit.ok) throw new Error('BLOCKED: final audit failed.');
  const before=phase22PreflightReadOnly();
  const identitiesBefore=phase22CaptureIdentity_();
  console.log('PHASE22_BEFORE '+JSON.stringify(before));
  let migration;
  try {
    migration=runMigrations();
  } catch(err) {
    console.error('PHASE22_MIGRATION_ERROR '+String(err && err.stack || err));
    console.log('PHASE22_AFTER_ERROR '+JSON.stringify(phase22Snapshot_()));
    throw err;
  }
  const after=phase22Snapshot_();
  const identitiesAfter=phase22CaptureIdentity_();
  const validation=phase22CompareMigrationQA_(before,after,identitiesBefore,identitiesAfter,migration);
  const result={
    ok:validation.ok,
    before:before,
    after:after,
    validation:validation,
    migration:migration
  };
  console.log('PHASE22_CONTROLLED_MIGRATION_RESULT '+JSON.stringify(result,null,2));
  if (!validation.ok) throw new Error('PHASE22_DATA_INTEGRITY_FAIL: '+validation.issues.join(' | '));
  return result;
}

/**
 * Single-use UI wrapper. Requires a deliberate Script Property opt-in.
 * This property is removed BEFORE any writes, so a second click cannot rerun.
 */
function phase22ExecuteControlledMigrationOnce() {
  const props=PropertiesService.getScriptProperties();
  const key='APTIS_PHASE22_QA_RUN_ONCE';
  const approved=String(props.getProperty(key)||'').trim();
  if (approved!=='I_CONFIRM_DISPOSABLE_QA_ONLY') {
    throw new Error('BLOCKED: set APTIS_PHASE22_QA_RUN_ONCE to I_CONFIRM_DISPOSABLE_QA_ONLY in STAGING Script Properties only.');
  }
  props.deleteProperty(key);
  return phase22RunMigrationOnQACopy(approved);
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

/**
 * Phase 2.2 final read-only audit. Call before approving any migration run.
 * Verifies workbook/folder identity, ordered base headers and copied media setting.
 */
function phase22FinalReadOnlyAudit() {
  const ss = phase22AssertStaging_();
  const folderCheck = phase22VerifyMediaIsolationReadOnly();
  const sheets = [
    {name:SHEET_NAMES.SPEAKING_P1,required:HEADERS.SPEAKING_P1},
    {name:SHEET_NAMES.SPEAKING_P2,required:HEADERS.SPEAKING_P2},
    {name:SHEET_NAMES.SPEAKING_P3,required:HEADERS.SPEAKING_P3},
    {name:SHEET_NAMES.PROGRESS,required:HEADERS.PROGRESS},
    {name:SHEET_NAMES.ATTEMPTS,required:HEADERS.ATTEMPTS},
    {name:SHEET_NAMES.SETTINGS,required:HEADERS.SETTINGS},
    {name:SHEET_NAMES.MEDIA,required:HEADERS.MEDIA}
  ];
  const structural = sheets.map(function(entry) {
    const sheet = ss.getSheetByName(entry.name);
    if (!sheet) throw new Error('BLOCKED: missing QA sheet '+entry.name);
    const actual = sheet.getRange(1,1,1,entry.required.length).getDisplayValues()[0];
    const bad = entry.required.filter(function(header,i) {return actual[i]!==header;});
    if (bad.length) throw new Error('BLOCKED: header mismatch '+entry.name+': '+bad.join(', '));
    if (entry.name === SHEET_NAMES.SPEAKING_P3 && sheet.getLastRow()<2) {
      throw new Error('BLOCKED: P3 bank is empty.');
    }
    return {name:entry.name,baseHeaders:'PASS',dataRows:Math.max(0,sheet.getLastRow()-1)};
  });
  const settings=ss.getSheetByName(SHEET_NAMES.SETTINGS);
  const copiedFolderId=String(getSetting_(settings,'media_folder_id')||'').trim();
  const preflight=phase22PreflightReadOnly();
  const audit={
    ok:true,
    qaWorkbookId:ss.getId(),
    qaMediaFolderId:folderCheck.qaMediaFolderId,
    copiedSettingsMediaFolderId:copiedFolderId,
    settingsFolderWillBeUpdatedByMigration:copiedFolderId!==folderCheck.qaMediaFolderId,
    sheetChecks:structural,
    snapshotHashes:Object.keys(preflight.sheets).reduce(function(acc,name) {
      acc[name]=preflight.sheets[name].hash;
      return acc;
    },{})
  };
  console.log(JSON.stringify(audit,null,2));
  return audit;
}
