/**
 * S7.2 version integrity — read-only inspection of the real configured sheet.
 * Never calls bootstrap, ensureSchema_, runMigrations() or setters.
 * Safe to run even if SETTINGS still contains historical Date cells.
 */
function testSpeakingVersionIntegrityReadOnly() {
  const props=PropertiesService.getScriptProperties();
  const id=String(props.getProperty('APTIS_DATABASE_ID')||'');
  if(!id)throw new Error('NO_CONFIGURED_DATABASE: read only; no fallback or creation');
  const sheet=SpreadsheetApp.openById(id).getSheetByName('SETTINGS');
  if(!sheet)throw new Error('SETTINGS_MISSING: read only');
  const values=sheet.getDataRange().getDisplayValues();
  const versions=[
    ['schema_version',APP_CONFIG.SCHEMA_VERSION],
    ['p1_content_version',PART1_CONTENT_VERSION],
    ['p2_description_version',PART2_DESCRIPTION_VERSION],
    ['p3_description_version',PART3_DESCRIPTION_VERSION]
  ];
  const report={readOnly:true,version:'S7.2-FULL-VERSION-GUARD-20261023',
    checks:[],canonicalReady:true,safeFromKnownDateMigration:true,
    productionReady:false,needsApprovedTextRepair:[]};
  versions.forEach(function(item){
    const key=item[0],expected=String(item[1]);
    let row=0,actual='';
    for(let i=1;i<values.length;i++)if(String(values[i][0])===key){
      row=i+1;actual=String(values[i][1]||'');break;
    }
    if(!row){
      report.checks.push({key,found:false,correct:false,legacyCompatible:false});
      report.safeFromKnownDateMigration=false;report.canonicalReady=false;
      return;
    }
    const cell=sheet.getRange(row,2),raw=cell.getValue();
    const isDate=Object.prototype.toString.call(raw)==='[object Date]';
    const correct=actual===expected;
    const compatible=key==='p1_content_version'?correct:
      speakingStoredVersionMatches_(actual,expected);
    const itemResult={key,sheetRow:row,display:actual,expected,
      actualType:isDate?'Date':typeof raw,
      cellFormat:String(cell.getNumberFormat()),
      canonical:correct&&!isDate,legacyCompatible:compatible&&!correct,
      safeFromKnownMigration:compatible};
    report.checks.push(itemResult);
    if(!itemResult.canonical){report.canonicalReady=false;report.needsApprovedTextRepair.push(key);}
    if(!compatible)report.safeFromKnownDateMigration=false;
  });
  report.ok=report.safeFromKnownDateMigration;
  report.passed=report.checks.filter(function(c){return c.safeFromKnownMigration}).length;
  report.total=versions.length;
  report.status=report.canonicalReady?'CANONICAL_OK':
    report.safeFromKnownDateMigration?'LEGACY_COMPATIBLE_BUT_TEXT_REPAIR_REQUIRED':'BLOCKED_VERSION_MISMATCH';
  Logger.log('SPEAKING_S72_VERSION_INTEGRITY '+JSON.stringify(report,null,2));
  return report;
}
