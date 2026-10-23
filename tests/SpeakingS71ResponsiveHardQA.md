# S7.1 — Responsive Hard QA browser probe (read-only)

Paste this code into **Google Apps Script /dev → Chrome DevTools Console → `userHtmlFrame`**. Do not create an Apps Script `.gs` file.

After opening a topic in each of the four Speaking Parts and changing between Learn, Memorize LV1/LV2 and Test, run `S71ResponsiveAudit.run()`. Also visit Home, Overview, Listening, Reading, Writing, Grammar and run it on each visible page. Retest at viewport widths 315/320/334/360/375/390/414/430/650/768/1024/1280; avoid assuming Device Toolbar width equals document `clientWidth`.

Once done run `S71ResponsiveAudit.report()`. This collects only this browser session's observations and makes no data writes. A successful probe **does not** prove audible TTS, real Safari/Android tap behavior, cache reload or persistence; check those separately.

```javascript
/**
 * S7.1 Responsive Hard QA: read-only DOM geometry and mobile controls.
 * Run ONLY in Google Apps Script /dev DevTools "userHtmlFrame" context.
 * No clicks, no calls to Apps Script, no storage and no network.
 */
(function(){
 'use strict';
 var samples=[];
 var q=function(s,r){return(r||document).querySelector(s)};
 var all=function(s,r){return Array.from((r||document).querySelectorAll(s))};
 var visible=function(el){
   if(!el||!el.isConnected)return false;
   while(el&&el.nodeType===1){
     var st=getComputedStyle(el);
     if(el.hidden||el.classList.contains('hidden')||st.display==='none'||st.visibility==='hidden')return false;
     el=el.parentElement;
   }
   return true;
 };
 var rect=function(el){var x=el.getBoundingClientRect();return{x:x.x,y:x.y,width:x.width,height:x.height,right:x.right}};
 function run(){
   if(!q('#globalApp')){
     var e={ok:false,error:'WRONG_FRAME',help:'Select userHtmlFrame in Chrome DevTools Console'};
     console.warn('S71_RESPONSIVE_AUDIT '+JSON.stringify(e));return e;
   }
   var active=q('.app-page.active');
   var page=active?active.id.replace('page-',''):'unknown';
   var mobile=innerWidth<=650,issues=[],checks=[];
   var check=function(name,ok,detail){
     var item={name:name,ok:Boolean(ok),detail:detail||''};
     checks.push(item);if(!item.ok)issues.push(item);
   };
   var c=document.documentElement.clientWidth;
   check('documentNoHorizontalOverflow',document.documentElement.scrollWidth-c<=2,
     'scrollWidth='+document.documentElement.scrollWidth+', clientWidth='+c);
   var groups=page==='speaking'?all('.speaking-audio-controls,.speaking-timer-actions',active).filter(visible):[];
   groups.forEach(function(g,index){
     var buttons=all('button',g).filter(visible);
     if(!buttons.length)return;
     var b=buttons.map(rect),bounds=rect(g),label=g.classList.contains('speaking-audio-controls')?'Audio':'Timer';
     check(label+index+'HasThreeOrFourControls',buttons.length>=3&&buttons.length<=4,
       'buttons='+buttons.length);
     if(mobile){
       check(label+index+'SingleRow',b.every(function(x){return Math.abs(x.y-b[0].y)<=2}),
         JSON.stringify(b.map(function(x){return x.y})));
       check(label+index+'TouchTargets',b.every(function(x){return x.width>=44&&x.height>=44}),
         JSON.stringify(b.map(function(x){return [Math.round(x.width),Math.round(x.height)]})));
       check(label+index+'InsideContainer',b.every(function(x){return x.right<=bounds.right+2}));
       var icon=getComputedStyle(buttons[0],'::before');
       check(label+index+'IconSize',parseFloat(icon.fontSize)<=20&&icon.content!=='none',
         'glyph='+icon.content+', font='+icon.fontSize);
     }
     if(label==='Audio'){
       check(label+index+'AccessibleNames',buttons.every(function(btn){
         return Boolean(btn.getAttribute('aria-label')||btn.textContent.trim()||btn.getAttribute('title'));
       }));
     }
   });
   if(page==='writing'){
     all('.writing-coach textarea,.writing-coach select',active).filter(visible).forEach(function(el,i){
       check('writingControl'+i+'NoIOSZoom',parseFloat(getComputedStyle(el).fontSize)>=16);
       check('writingControl'+i+'InPage',rect(el).right<=c+2);
     });
   }
   var footer=q('.speaking-shell .bottom-nav');
   if(page==='speaking'&&visible(footer)){
     check('bottomNavWithinViewport',rect(footer).right<=c+2);
   }
   var result={ok:issues.length===0,page:page,viewport:innerWidth,clientWidth:c,
     scrollWidth:document.documentElement.scrollWidth,checks:checks.length,
     passed:checks.length-issues.length,issues:issues,
     observedGroups:groups.length,readOnly:true,
     note:'DOM/geometry check only. Audible TTS, progress writes and Safari/Android real touch still require device QA.'};
   samples.push(result);
   console.log('S71_RESPONSIVE_AUDIT '+JSON.stringify(result,null,2));
   return result;
 }
 function report(){
   var sizes=[315,320,334,360,375,390,414,430,650,768,1024,1280];
   var pages=['home','overview','speaking','listening','reading','writing','grammar'];
   var result={captures:samples.length,passing:samples.filter(function(s){return s.ok}).length,
     failing:samples.filter(function(s){return !s.ok}).length,
     pageCoverage:pages.filter(function(p){return samples.some(function(s){return s.ok&&s.page===p})}),
     missingPages:pages.filter(function(p){return !samples.some(function(s){return s.ok&&s.page===p})}),
     viewportCoverage:sizes.filter(function(w){return samples.some(function(s){return s.ok&&Math.abs(s.viewport-w)<=2})}),
     failedSamples:samples.filter(function(s){return !s.ok}).map(function(s){return {page:s.page,viewport:s.viewport,issues:s.issues}})};
   console.log('S71_RESPONSIVE_REPORT '+JSON.stringify(result,null,2));return result;
 }
 window.S71ResponsiveAudit=Object.freeze({run:run,report:report,samples:samples,version:'s71-responsive-20261023'});
 console.log('S71ResponsiveAudit installed; run S71ResponsiveAudit.run() after manual page/mode change.');
 return run();
})();
```
