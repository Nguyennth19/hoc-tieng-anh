'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'), path=require('node:path'), vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=n=>fs.readFileSync(path.join(root,n),'utf8');
const store=new Map(), writes=[];
let seq=0, db={getId:()=> 'R1_QA'};
const cache={
  get:k=>store.get(k)||null,
  getAll:ks=>Object.fromEntries(ks.filter(k=>store.has(k)).map(k=>[k,store.get(k)])),
  put(k,v,seconds){assert(Buffer.byteLength(v,'utf8')<=102400);assert(k.length<=250);assert(seconds>=1&&seconds<=21600);store.set(k,v);writes.push(k);},
  putAll(o,seconds){Object.keys(o).forEach(k=>this.put(k,o[k],seconds));},
  remove:k=>store.delete(k)
};
const cx=vm.createContext({Date,CacheService:{getScriptCache:()=>cache},Utilities:{
  getUuid:()=> '00000000-0000-4000-8000-'+String(++seq).padStart(12,'0'),
  formatDate:(d,tz,pattern)=>{assert.equal(tz,'Asia/Ho_Chi_Minh');assert.equal(pattern,'d.M.yyyy');return [d.getUTCDate(),d.getUTCMonth()+1,d.getUTCFullYear()].join('.');}
}});
for(const name of ['Config.gs','Database.gs','Migration.gs','SkillSpeaking.gs','SkillSpeakingPart3.gs'])new vm.Script(read(name),{filename:name}).runInContext(cx);
for(const name of ['SkillSpeakingPart1.gs','SkillSpeakingPart2.gs']){
  const constName=name.includes('Part1')?'PART1_CONTENT_VERSION':'PART2_DESCRIPTION_VERSION';
  const match=read(name).match(new RegExp('const '+constName+' = [^;]+;'));
  assert(match);new vm.Script(match[0]).runInContext(cx);
}
const run=code=>vm.runInContext(code,cx), clear=()=>{store.clear();writes.length=0;};
cx.getDatabase_=()=>db;
cx.headerIndexMap_=()=>({id:0,active:1});
const bank=rows=>({getLastRow:()=>rows.length,getDataRange:()=>({getValues:()=>rows})});
const setBank=sheet=>db={getId:()=> 'R1_QA',getSheetByName:()=>sheet};
const tests=[];
function check(label,fn){try{fn();tests.push({name:label,pass:true});}catch(e){tests.push({name:label,pass:false,error:String(e)});}}
check('P3 retired migration blocks',()=>assert.throws(()=>run('upgradeSpeakingPart3Description_({}, {}, [])'),/R1_MIGRATION_BLOCKED/));
check('P3 retired migration contains no writers',()=>assert(!read('SkillSpeakingPart3.gs').split('function upgradeSpeakingPart3Description_(')[1].split('function getSpeakingPart3_()')[0].includes('setValue(')));
check('P3 startup contains no seed calls',()=>assert(!read('SkillSpeaking.gs').split('function ensurePart3ExamBankReady_()')[1].split('function getSpeakingCacheManifest()')[0].includes('upgradeSpeakingPart3Description_(')));
check('P3 missing fails closed',()=>{setBank(null);assert.throws(()=>run('ensurePart3ExamBankReady_()'),/R1_P3_BANK_NOT_READY/);});
check('P3 empty fails closed',()=>{setBank(bank([['id','active']]));assert.throws(()=>run('ensurePart3ExamBankReady_()'),/R1_P3_BANK_NOT_READY/);});
check('P3 inactive fails closed',()=>{setBank(bank([['id','active'],['SP3-EX-001',false]]));assert.throws(()=>run('ensurePart3ExamBankReady_()'),/R1_P3_NO_ACTIVE_EXAM/);});
check('P3 active passes',()=>{setBank(bank([['id','active'],['SP3-EX-001',true]]));assert.equal(run('ensurePart3ExamBankReady_()'),undefined);});
check('Version canonical match',()=>assert.equal(run("speakingStoredVersionMatches_('3.2.0','3.2.0')"),true));
check('Version legacy match',()=>assert.equal(run("speakingStoredVersionMatches_('3.2.2000','3.2.0')"),true));
check('Version wrong year rejected',()=>assert.equal(run("speakingStoredVersionMatches_('3.2.2026','3.2.0')"),false));
check('Version wrong target patch rejected',()=>assert.equal(run("speakingStoredVersionMatches_('3.2.2000','3.2.10')"),false));
let settingWrites=0;
const settingSheet={getLastRow:()=>2,getLastColumn:()=>2,getParent:()=>({getSpreadsheetTimeZone:()=> 'Asia/Ho_Chi_Minh'}),getRange:()=>({getDisplayValues:()=>[['schema_version','3.2.2000']],getValue:()=>new Date('2000-02-03T00:00:00Z'),setValue:()=>settingWrites++,setNumberFormat:()=>settingWrites++})};
cx.settingSheet=settingSheet;
check('SETTINGS Date read normalized',()=>assert.equal(run("getSetting_(settingSheet,'schema_version')"),'3.2.0'));
check('SETTINGS Date read no write',()=>assert.equal(settingWrites,0));
check('Schema bootstrap never auto-migrates',()=>assert(!read('Migration.gs').split('function ensureSchema_() {')[1].includes('runMigrations();')));
const good={schema_version:'3.2.0',p1_content_version:'2026.10.19.49',p2_description_version:'2.1.0',p3_description_version:'2.1.0'};
function setVersions(v){db={getId:()=> 'R1_VERSIONS',getSheetByName:()=>({values:v})};cx.getSetting_=(s,k)=>s.values[k]||'';}
check('Schema approved versions pass read-only',()=>{clear();setVersions(good);run('ensureSchema_()');assert.equal(writes.length,1);});
check('Schema new R1 cache namespace',()=>assert([...store.keys()].some(k=>k.startsWith('schema:r1:'))));
check('Schema positive cache hit skips reads',()=>{let reads=0;cx.getSetting_=()=>{reads++;throw Error('unexpected read');};run('ensureSchema_()');assert.equal(reads,0);});
check('Schema mismatches fail closed',()=>{clear();setVersions({...good,p3_description_version:'bad'});assert.throws(()=>run('ensureSchema_()'),/R1_SCHEMA_VERSION_MISMATCH/);assert.equal(writes.length,0);});
check('Schema legacy Date displays accepted logically',()=>{clear();setVersions({...good,schema_version:'3.2.2000',p2_description_version:'2.1.2000',p3_description_version:'2.1.2000'});run('ensureSchema_()');assert.equal(writes.length,1);});
db={getId:()=> 'R1_CACHE'};
check('Small cache roundtrip',()=>{clear();let n=0;cx.loader=()=>{n++;return [{answer:'hello'}];};run("getCachedSpeakingContent_('p1',false,loader)");run("getCachedSpeakingContent_('p1',false,loader)");assert.equal(n,1);});
check('Large Unicode cache chunk roundtrip',()=>{clear();let n=0;cx.loader=()=>{n++;return [{answer:'Việt Nam 🇻🇳 🎓'.repeat(6000)}];};run("getCachedSpeakingContent_('p3',false,loader)");run("getCachedSpeakingContent_('p3',false,loader)");assert.equal(n,1);assert(writes.length>2);});
check('Each cache chunk fits Apps Script limits',()=>assert([...store.values()].every(v=>Buffer.byteLength(v,'utf8')<=102400)));
check('Missing chunk safely reloads',()=>{const k=[...store.keys()].find(k=>k.includes(':r1:'));assert(k);store.delete(k);let n=0;cx.loader=()=>{n++;return [{answer:'fresh'}];};run("getCachedSpeakingContent_('p3',false,loader)");assert.equal(n,1);});
check('Force refresh bypasses cache',()=>{clear();cx.loader=()=>[{answer:'old'}];run("getCachedSpeakingContent_('p2',false,loader)");cx.loader=()=>[{answer:'new'}];assert.equal(run("getCachedSpeakingContent_('p2',true,loader)")[0].answer,'new');});
check('Progress cache reads safe chunks',()=>{clear();let n=0;cx.getProgressMap_=()=>{n++;return {q:'progress'.repeat(6000)};};run('getCachedProgressMap_(false)');run('getCachedProgressMap_(false)');assert.equal(n,1);});
const failed=tests.filter(x=>!x.pass);
console.log(JSON.stringify({suite:'R1 backend safety',passed:tests.length-failed.length,total:tests.length,failed},null,2));
if(failed.length)process.exitCode=1;
