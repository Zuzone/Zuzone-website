import { chromium } from 'playwright-core';
import fs from 'node:fs';
import { execSync } from 'node:child_process';
const ROOT='/Users/booga/Growth/zuzone/reel'; const OUT=`${ROOT}/out/old_wide`; fs.mkdirSync(OUT,{recursive:true});
const URL='https://www.zuzone.org/';
const b=await chromium.launch({channel:'chrome'});
// crisp logo for the wide hook
let ctx=await b.newContext({viewport:{width:1440,height:810},deviceScaleFactor:8}); let p=await ctx.newPage();
await p.goto(URL,{waitUntil:'networkidle',timeout:60000}); await p.waitForTimeout(1200);
const logo=p.locator('header a[href="/"]').first();
if(await logo.count()) await logo.screenshot({path:`${ROOT}/ref/old_logo_hi.png`}); else console.log('no logo locator');
await ctx.close();
// desktop frames at 1440x810 @4/3 = 1920x1080
ctx=await b.newContext({viewport:{width:1440,height:810},deviceScaleFactor:4/3}); p=await ctx.newPage();
await p.goto(URL,{waitUntil:'networkidle',timeout:60000}); await p.waitForTimeout(1500);
const H=await p.evaluate(()=>document.documentElement.scrollHeight); console.log('page height',H);
await p.evaluate(()=>window.scrollTo(0,0)); await p.screenshot({path:`${OUT}/old_top.png`});
const dir=`${OUT}/scroll`; fs.rmSync(dir,{recursive:true,force:true}); fs.mkdirSync(dir,{recursive:true});
const N=120, maxY=Math.max(0,Math.min(1100,H-810));
for(let i=0;i<N;i++){ const k=i/(N-1); const e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2; await p.evaluate(y=>window.scrollTo(0,y),Math.round(maxY*e)); await p.screenshot({path:`${dir}/${String(i).padStart(4,'0')}.jpg`,type:'jpeg',quality:95}); }
execSync(`ffmpeg -y -loglevel error -framerate 30 -i ${dir}/%04d.jpg -vf "scale=1920:1080:flags=lanczos" -c:v libx264 -crf 17 -preset medium -pix_fmt yuv420p -r 30 ${OUT}/old_scroll.mp4`);
await p.goto(URL+'crossword',{waitUntil:'networkidle',timeout:60000}); await p.waitForTimeout(1500); await p.evaluate(()=>window.scrollTo(0,0));
await p.screenshot({path:`${OUT}/old_crossword.png`});
console.log('old wide done, maxY',maxY); await b.close();
