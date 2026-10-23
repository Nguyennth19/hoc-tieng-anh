'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const entries=[
 ['S7.1', 'SpeakingS71DeepRegression_ReadOnly.gs','testSpeakingS71DeepRegressionReadOnly'],
 ['S6.4', 'SpeakingStartup_S64_ReadOnly.gs','testSpeakingStartupS64ReadOnly'],
 ['S6.3', 'SpeakingCompactTimer_S63_ReadOnly.gs','testSpeakingCompactTimerS63ReadOnly']
];
const out=[];
for(const [tag,filename,fun] of entries){
  const cx=vm.createContext({console:{log(){},error(){}},
    HtmlService:{createHtmlOutputFromFile:(f)=>({getContent:()=>fs.readFileSync(path.join(root,f+'.html'),'utf8')})}});
  try{
    new vm.Script(fs.readFileSync(path.join(root,'tests',filename),'utf8'),{filename}).runInContext(cx);
    const r=vm.runInContext(fun+'()',cx);
    out.push({suite:tag,ok:r.ok,passed:r.passed,total:r.total||r.totalChecks,issues:r.failed});
  }catch(e){out.push({suite:tag,ok:false,error:String(e)});}
}
console.log(JSON.stringify({ok:out.every(x=>x.ok), suites:out},null,2));
if(out.some(x=>!x.ok)) process.exitCode=1;
