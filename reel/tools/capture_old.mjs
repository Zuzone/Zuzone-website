import { chromium } from 'playwright-core';
import fs from 'node:fs';
import { execSync } from 'node:child_process';
const ROOT='/Users/booga/Growth/zuzone/reel'; const OUT=`${ROOT}/out/old`; fs.mkdirSync(OUT,{recursive:true});
const URL='https://www.zuzone.org/';
const b=await chromium.launch({channel:'chrome'});
let ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:4}); let p=await ctx.newPage();
await p.goto(URL,{waitUntil:'networkidle',timeout:60000}); await p.waitForTimeout(1500);
const logo=p.locator('header a[href="/"]').first();
if(await logo.count()) { await logo.screenshot({path:`${ROOT}/ref/old_logo.png`}); console.log('logo via locator'); }
else { await p.screenshot({path:`${ROOT}/ref/old_logo.png`,clip:{x:196,y:8,width:136,height:48}}); console.log('logo via clip'); }
await ctx.close();
ctx=await b.newContext({viewport:{width:810,height:1440},deviceScaleFactor:4/3}); p=await ctx.newPage();
await p.goto(URL,{waitUntil:'networkidle',timeout:60000}); await p.waitForTimeout(1500);
await p.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';});
const H=await p.evaluate(()=>document.documentElement.scrollHeight); console.log('page height',H);
const dir=`${OUT}/scroll`; fs.rmSync(dir,{recursive:true,force:true}); fs.mkdirSync(dir,{recursive:true});
const N=120, maxY=Math.min(1700,H-1440);
for(let i=0;i<N;i++){ const k=i/(N-1); const e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2; await p.evaluate(y=>window.scrollTo(0,y),Math.round(maxY*e)); await p.screenshot({path:`${dir}/${String(i).padStart(4,'0')}.jpg`,type:'jpeg',quality:95}); }
execSync(`ffmpeg -y -loglevel error -framerate 30 -i ${dir}/%04d.jpg -vf "scale=1080:1920:flags=lanczos" -c:v libx264 -crf 17 -preset medium -pix_fmt yuv420p -r 30 ${OUT}/old_scroll.mp4`);
await p.evaluate(()=>window.scrollTo(0,0)); await p.screenshot({path:`${OUT}/old_top.png`});
await p.goto(URL+'crossword',{waitUntil:'networkidle',timeout:60000}); await p.waitForTimeout(1500); await p.evaluate(()=>window.scrollTo(0,0));
await p.screenshot({path:`${OUT}/old_crossword.png`});
console.log('old done'); await b.close();
