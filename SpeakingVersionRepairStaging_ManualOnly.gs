/**
 * S7.2 OPTIONAL one-time SETTINGS recovery — NOT AUTOMATIC.
 * NEVER invoked by startup, QA, bootstrap, migration or a trigger.
 *
 * To run on a verified staging workbook, the operator must first:
 * 1) Create a standalone backup of the workbook and record pre-write SHA256.
 * 2) Verify APTIS_DATABASE_ID points to staging, NOT production.
 * 3) Set Script Properties ONLY on staging:
 *    S72_VERSION_REPAIR_APPROVAL=BACKUP_VERIFIED_AND_STAGING_ONLY
 *    S72_VERSION_REPAIR_DB_ID=<same exact ID as APTIS_DATABASE_ID>
 * User approval is additionally required before running this function.
 * Removes NO sheets/rows; modifies only 3 whitelisted SETTINGS value cells.
 */
function repairSpeakingSettingsVersionsStaging_ONLY_AFTER_APPROVAL() {
  const props=PropertiesService.getScriptProperties();
  const dbId=String(props.getProperty('APTIS_DATABASE_ID')||'');
  const expectedId=String(props.getProperty('S72_VERSION_REPAIR_DB_ID')||'');
  if(!dbId||dbId!==expectedId ||
     props.getProperty('S72_VERSION_REPAIR_APPROVAL')!=='BACKUP_VERIFIED_AND_STAGING_ONLY' ||
     props.getProperty('S71_RESPONSIVE_QA_STAGING')!=='enabled-staging-only') {
    throw new Error('REPAIR_LOCKED: backup + staging flags + exact database ID are mandatory.');
  }
  const db=SpreadsheetApp.openById(dbId);
  const sheet=db.getSheetByName('SETTINGS');
  if(!sheet)throw new Error('REPAIR_ABORT: SETTINGS missing');
  const values=sheet.getDataRange().getDisplayValues();
  const required=[
    ['schema_version',String(APP_CONFIG.SCHEMA_VERSION)],
    ['p2_description_version',String(PART2_DESCRIPTION_VERSION)],
    ['p3_description_version',String(PART3_DESCRIPTION_VERSION)]
  ];
  const targets=[];
  // Preflight ALL targeted rows before the first write.
  for(let i=0;i<required.length;i++){
    const key=required[i][0],expected=required[i][1];
    const matches=[];
    for(let j=1;j<values.length;j++)if(String(values[j][0])===key)matches.push(j+1);
    if(matches.length!==1)throw new Error('REPAIR_ABORT: '+key+' missing or duplicated.');
    const row=matches[0],display=String(values[row-1][1]||'');
    if(!speakingStoredVersionMatches_(display,expected)){
      throw new Error('REPAIR_ABORT: '+key+' unexpected value; migration/repair blocked.');
    }
    targets.push({key:key,expected:expected,row:row,oldDisplay:display});
  }
  // Only specific value cells are updated. Preserve all unrelated settings.
  const changed=[];
  targets.forEach(function(x){
    const cell=sheet.getRange(x.row,2),raw=cell.getValue();
    if(String(raw)===x.expected&&
       Object.prototype.toString.call(raw)!=='[object Date]')return;
    cell.setNumberFormat('@');
    cell.setValue(x.expected);
    changed.push(x.key);
  });
  SpreadsheetApp.flush();
  targets.forEach(function(x){
    const cell=sheet.getRange(x.row,2),raw=cell.getValue();
    if(Object.prototype.toString.call(raw)==='[object Date]' ||
       String(cell.getDisplayValue())!==x.expected)
      throw new Error('REPAIR_VERIFY_FAILED: '+x.key+'. Restore workbook backup.');
  });
  const report={ok:true,scope:'SETTINGS value cells only',changedKeys:changed,
    canonicalValues:targets.map(function(x){return{key:x.key,value:x.expected};}),
    productionUntouched:true,requiresPostRepairReadOnlyAudit:true};
  Logger.log('SPEAKING_S72_APPROVED_STAGING_VERSION_REPAIR '+JSON.stringify(report));
  return report;
}
