/**
 * S7.2 FINAL RELEASE GATE — READ ONLY, staging editor only.
 *
 * Reads current Apps Script HTML source + selected configured Sheet tabs.
 * No bootstrap, schema checks, migrations, cache mutation, lock or Save APIs.
 * No writes to Sheets or Script Properties. No user content is logged.
 *
 * IMPORTANT: This is a release gate SNAPSHOT, not a production deployment.
 * Run testSpeakingS72FinalReadOnly() twice (before and after manual browser QA)
 * and compare dataFingerprints. Do not run destructive historical setup tests.
 */
function testSpeakingS72FinalReadOnly() {
  var errors = [], warnings = [], checks = {}, details = {};
  function check(name, passed, message) {
    checks[name] = Boolean(passed);
    if (!passed) errors.push(name + (message ? ': ' + message : ''));
  }
  function warn(msg) { warnings.push(String(msg)); }
  function txt(x) { return String(x === null || x === undefined ? '' : x).trim(); }
  function hash(value) {
    var bytes = Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256, JSON.stringify(value), Utilities.Charset.UTF_8);
    return bytes.map(function(x) {
      var b = x < 0 ? x + 256 : x;
      return ('0' + b.toString(16)).slice(-2);
    }).join('');
  }
  function idsUnique(rows, index) {
    var ids = rows.map(function(r) {return txt(r[index]);});
    var filtered = ids.filter(function(id){return !!id;});
    return ids.length === filtered.length && new Set(filtered).size === filtered.length;
  }
  function requireColumns(keys, cols, sheetName) {
    var absent=cols.filter(function(col){return keys.indexOf(col)<0;});
    check(sheetName+'RequiredColumns',absent.length===0,
      absent.length ? 'Missing: '+absent.join(', ') : '');
    return absent.length===0;
  }
  function readTab(db, name, required, allowMissing) {
    var sheet = db.getSheetByName(name);
    if (!sheet) {
      if (!allowMissing) check(name+'Exists',false,'Missing sheet');
      else warn('Optional '+name+' does not exist');
      return null;
    }
    var values = sheet.getDataRange().getDisplayValues();
    var keys = (values[0] || []).map(txt);
    var rows = values.slice(1).filter(function(row) {
      return row.some(function(cell){return txt(cell)!=='';});
    });
    var hasRequired = requireColumns(keys,required||[],name);
    var result={keys:keys,rows:rows,validColumns:hasRequired};
    details[name]={rows:rows.length,columns:keys.length,sha256:hash(values)};
    check(name+'Exists',true);
    return result;
  }

  // HTML source inspection through Apps Script's read-only HtmlService API.
  try {
    var speaking=speakingCombinedJSReadOnly_();
    var part4=HtmlService.createHtmlOutputFromFile('JS_SpeakingPart4').getContent();
    var index=HtmlService.createHtmlOutputFromFile('Index').getContent();
    var stylesheet=speakingCombinedStylesReadOnly_();
    var qa=HtmlService.createHtmlOutputFromFile('QA_ResponsiveStaging').getContent();
    details.sourceFingerprints={
      JS_Speaking:hash(speaking),
      JS_SpeakingPart4:hash(part4),
      Index:hash(index),
      Styles_Speaking:hash(stylesheet),
      QA_ResponsiveStaging:hash(qa)
    };
    check('SpeakingSharedMemorize',speaking.indexOf('window.AptisSpeakingMemorize=Object.freeze')>=0);
    check('SpeakingSharedAudio',speaking.indexOf('window.AptisSpeakingAudio = Object.freeze')>=0);
    check('SpeakingSharedTimer',speaking.indexOf('window.AptisSpeakingTimer=Object.freeze')>=0);
    check('SpeakingSharedCache',speaking.indexOf('window.AptisSpeakingCache=')>=0);
    check('SpeakingStartupFailSafe',speaking.indexOf('SPEAKING_BOOTSTRAP_INIT_FAILED')>=0 &&
      speaking.indexOf('LOADER_HARD_TIMEOUT_MS')>=0);
    check('Part4ApprovalFailClosed',part4.indexOf("x.qaStatus!=='APPROVED'")>=0 &&
      part4.indexOf('!Boolean(x.releaseApproved)')>=0);
    check('Part4TimerNoAutoSave',part4.indexOf('function p4Timer_(){')>=0 &&
      part4.slice(part4.indexOf('function p4Timer_(){'),part4.indexOf('function p4FormulaHtml('))
        .indexOf('google.script.run')<0);
    check('StagingQADefaultOff',index.indexOf(
      "getProperty('S71_RESPONSIVE_QA_STAGING') === 'enabled-staging-only'")>=0 &&
      index.indexOf("include('QA_ResponsiveStaging')")>=0);
    check('StagingQANoServerWrites',qa.indexOf('google.script.run')<0 &&
      qa.indexOf('localStorage.setItem')<0);
    // Inspect real mobile CSS selectors, never depend on a comment marker.
    var audioSelector='.speaking-shell .speaking-audio-controls{';
    var mediaStart=stylesheet.lastIndexOf('@media(max-width:650px)');
    var mediaEnd=mediaStart>=0?stylesheet.indexOf('@media(max-width:380px)',mediaStart):-1;
    var mobileCss=mediaStart>=0?stylesheet.slice(mediaStart,mediaEnd<0?undefined:mediaEnd):'';
    var audioStart=mobileCss.indexOf(audioSelector);
    var audioBody=audioStart>=0?mobileCss.slice(audioStart+audioSelector.length,
      mobileCss.indexOf('}',audioStart+audioSelector.length)):'';
    var audioStyleChecks={
      scopedAudioRule:audioStart>=0,
      insideMobileMedia:mediaStart>=0&&audioStart>=0,
      threeColumnAudioGrid:/display\s*:\s*grid\s*;/.test(audioBody)&&
        /grid-template-columns\s*:\s*repeat\s*\(\s*3\s*,\s*minmax\s*\(\s*0\s*,\s*1fr\s*\)\s*\)/.test(audioBody),
      playIcon:stylesheet.indexOf('[data-audio-action="play"]::before')>=0,
      pauseIcon:stylesheet.indexOf('[data-audio-action="pause"]::before')>=0,
      stopIcon:stylesheet.indexOf('[data-audio-action="stop"]::before')>=0
    };
    details.mobileAudioStyleChecks=audioStyleChecks;
    check('ResponsiveMobileAudio',Object.keys(audioStyleChecks).every(function(k){
      return audioStyleChecks[k];
    }),JSON.stringify(audioStyleChecks));
    details.sourceVersion='S7.1 QA-gated responsive baseline';
  } catch (sourceError) {
    check('SourceInspectionSucceeded',false,txt(sourceError.message||sourceError));
  }

  // Backend function-availability checks only. Never invoke these loaders:
  // loading bootstrap can call ensureSchema_() and migrate the workbook.
  check('P3ServerLoaderAvailable',typeof getSpeakingPart3_==='function',
    'Missing getSpeakingPart3_(): repository SkillSpeakingPart3.gs may be incomplete.');
  check('P4ServerLoaderAvailable',typeof getSpeakingPart4Dev==='function',
    'Missing Part 4 DEV content loader.');
  details.stagingQaSwitch=txt(PropertiesService.getScriptProperties()
    .getProperty('S71_RESPONSIVE_QA_STAGING'))==='enabled-staging-only'?'enabled':'disabled';
  // Do not call getDatabase_(): it may write a bridging Script Property.
  // This code reads the already-configured ID and NEVER sets it.
  var dbId=txt(PropertiesService.getScriptProperties().getProperty('APTIS_DATABASE_ID'));
  if (!dbId && typeof DATABASE_SPREADSHEET_ID!=='undefined' &&
      txt(DATABASE_SPREADSHEET_ID).indexOf('PASTE_')!==0) {
    dbId=txt(DATABASE_SPREADSHEET_ID);
    warn('Database ID comes from legacy Config constant, without property migration.');
  }
  if (!dbId) {
    check('DatabaseConfigured',false,'APTIS_DATABASE_ID missing; no changes attempted');
  } else {
    check('DatabaseConfigured',true);
    try {
      var db=SpreadsheetApp.openById(dbId); // read only
      var settings=readTab(db,'SETTINGS',['key','value']);
      if(settings&&settings.validColumns){
        var settingMap={};
        settings.rows.forEach(function(row){settingMap[txt(row[0])]=txt(row[1]);});
        var expectedSettingVersions={
          schema_version:typeof APP_CONFIG!=='undefined'?txt(APP_CONFIG.SCHEMA_VERSION):'',
          p1_content_version:typeof PART1_CONTENT_VERSION!=='undefined'?txt(PART1_CONTENT_VERSION):'',
          p2_description_version:typeof PART2_DESCRIPTION_VERSION!=='undefined'?txt(PART2_DESCRIPTION_VERSION):'',
          p3_description_version:typeof PART3_DESCRIPTION_VERSION!=='undefined'?txt(PART3_DESCRIPTION_VERSION):''
        };
        details.schemaVersions={};
        // Read exact SETTINGS cells to distinguish version text from Date
        // conversions. The gate must still FAIL a mismatching display string.
        var settingsSheet=db.getSheetByName('SETTINGS');
        var positions={};
        settings.rows.forEach(function(row,i){positions[txt(row[0])]=i+2;});
        details.schemaCellDiagnostics={};
        Object.keys(expectedSettingVersions).forEach(function(key){
          var row=positions[key];
          if(!row)return;
          var cell=settingsSheet.getRange(row,2);
          var raw=cell.getValue();
          var isDate=Object.prototype.toString.call(raw)==='[object Date]';
          details.schemaCellDiagnostics[key]={
            sheetRow:row,rawType:isDate?'Date':typeof raw,
            rawISO:isDate&&!isNaN(raw.getTime())?raw.toISOString():null,
            display:txt(cell.getDisplayValue()),
            numberFormat:txt(cell.getNumberFormat()),
            probablyAutoConvertedDate:isDate
          };
        });
        Object.keys(expectedSettingVersions).forEach(function(key){
          var expected=expectedSettingVersions[key],actual=txt(settingMap[key]);
          var canonical=!!expected&&actual===expected;
          var legacyCompatible=key!=='p1_content_version' &&
            typeof speakingStoredVersionMatches_==='function' &&
            speakingStoredVersionMatches_(actual,expected)&&!canonical;
          details.schemaVersions[key]={
            matches:canonical,legacyCompatible:legacyCompatible,
            bootstrapProtected:canonical||legacyCompatible,
            configured:Boolean(actual),expected:expected,actual:actual
          };
          if(legacyCompatible)warn(key+' contains a legacy Date-like version. '+ 
            'Backend now tolerates it, but a controlled TEXT repair is required before release.');
          check('SchemaVersion_'+key,canonical,
            legacyCompatible?('Legacy '+actual+' is safe for startup but not canonical TEXT; '+ 
              'approved SETTINGS repair required.') :
              ('Expected '+expected+', found '+actual+'. Bootstrap may trigger migrations!'));
        });
      }
      var p1=readTab(db,'SPEAKING',['id','question','model','active','sourceLabel']);
      var p2=readTab(db,'SPEAKING_P2',['id','question1','question2','question3','model1','model2','model3','active']);
      var p3=readTab(db,'SPEAKING_P3',['id','question1','question2','question3','model1','model2','model3','active']);
      var p4=readTab(db,'P4_IMPORT_STAGING',['exam_set_id','q1_original','q2_original','q3_original',
          'model_q1','model_q2','model_q3','qa_status','release_approved']);
      var p4m=readTab(db,'P4_MASTERY',[]);
      var progress=readTab(db,'PROGRESS',['questionId','status']);
      var attempts=readTab(db,'ATTEMPTS',['questionId']);
      var p4p=readTab(db,'P4_PROGRESS',[]);
      var p4a=readTab(db,'P4_ATTEMPTS',[]);

      if(p1&&p1.validColumns) {
        var a=p1.keys.indexOf('id'),b=p1.keys.indexOf('question'),
          c=p1.keys.indexOf('model'),d=p1.keys.indexOf('active'),origin=p1.keys.indexOf('sourceLabel');
        check('P1Exactly49',p1.rows.length===49,'Found '+p1.rows.length);
        check('P1UniqueIDs',idsUnique(p1.rows,a));
        check('P1TeacherAnswersComplete',p1.rows.every(function(r){return !!txt(r[b])&&!!txt(r[c]);}));
        check('P1AllActive',p1.rows.every(function(r){return txt(r[d]).toUpperCase()==='TRUE';}));
        check('P1TeacherReleaseLabels',p1.rows.every(function(r){
          return txt(r[origin]).indexOf('P1_V2_49_RELEASE_')===0;
        }));
      }
      function checkTopics(tab,part,excluded){
        if(!tab||!tab.validColumns)return;
        var ix={};tab.keys.forEach(function(k,i){ix[k]=i;});
        check(part+'UniqueIDs',idsUnique(tab.rows,ix.id));
        var active=tab.rows.filter(function(r){return txt(r[ix.active]).toUpperCase()!=='FALSE';});
        var complete=active.filter(function(r){return [1,2,3].every(function(n){
          return !!txt(r[ix['question'+n]])&&!!txt(r[ix['model'+n]]);
        });});
        var practice=complete.filter(function(r){return excluded.indexOf(txt(r[ix.id]))<0;});
        details[part+'Release']={totalRows:tab.rows.length,activeRows:active.length,
          completeActive:complete.length,eligiblePracticeTopics:practice.length,
          incompleteActive:active.length-complete.length,excludedIds:excluded.slice()};
        check(part+'HasEligiblePracticeTopics',practice.length>0);
        if(active.length!==complete.length)warn(part+' has '+(active.length-complete.length)+
          ' active incomplete topic(s), excluded by the three-question bootstrap filter.');
      }
      checkTopics(p2,'P2',['SP2-EX-012']);
      checkTopics(p3,'P3',['SP3-EX-012','SP3-EX-017']);

      if(p4&&p4.validColumns){
        var k={};p4.keys.forEach(function(s,i){k[s]=i;});
        check('P4Exactly51',p4.rows.length===51,'Found '+p4.rows.length);
        check('P4UniqueSetIDs',idsUnique(p4.rows,k.exam_set_id));
        check('P4CompleteQuestionsAndModels',p4.rows.every(function(r){
          return [1,2,3].every(function(i){
            return !!txt(r[k['q'+i+'_original']])&&!!txt(r[k['model_q'+i]]);
          });
        }));
        var approved=p4.rows.filter(function(r){return txt(r[k.qa_status])==='APPROVED'&&
          txt(r[k.release_approved])==='YES';});
        details.part4ApprovedSets=approved.length;
        check('P4OnlyApprovedEligible',approved.every(function(r){
          return txt(r[k.qa_status])==='APPROVED'&&txt(r[k.release_approved])==='YES';
        }));
        if(p4m){
          var mIds=p4m.rows.map(function(r){return txt(r[0]);});
          var setIds=p4.rows.map(function(r){return txt(r[k.exam_set_id]);});
          check('P4Mastery51Unique',mIds.length===51&&new Set(mIds).size===51);
          check('P4MasteryMatchesContent',setIds.every(function(id){return mIds.indexOf(id)>=0;}));
        }
      }
      // Progress data is observed only by its row count + SHA256. Do not alter.
      details.dataFingerprints={};
      Object.keys(details).forEach(function(key){
        if(details[key]&&details[key].sha256)
          details.dataFingerprints[key]=details[key].sha256;
      });
    }catch(sheetError){
      check('WorkbookReadSucceeded',false,txt(sheetError.message||sheetError));
    }
  }
  // No live transport/bootstrap/migration calls were made; source/runtime QA
  // and user-browser acceptance are separate prerequisites for release.
  var passed=Object.keys(checks).filter(function(k){return checks[k];}).length;
  var result={ok:errors.length===0,passed:passed,total:Object.keys(checks).length,
    issues:errors,warnings:warnings,readOnly:true,
    stage:'S7.2 PRE-RELEASE — NEVER AUTO DEPLOY',
    productionReady:false,details:details,
    limitations:[
      'This audit reads source + configured Sheets only; it does not invoke bootstrap/migration.',
      'Compare dataFingerprints from two separate runs to establish no data changed.',
      'Production enablement requires a separate signed-off deployment checklist.'
    ]};
  Logger.log('SPEAKING_S72_FINAL_READ_ONLY_RESULT '+JSON.stringify(result,null,2));
  return result;
}
