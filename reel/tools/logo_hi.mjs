import { chromium } from 'playwright-core';
const b=await chromium.launch({channel:'chrome'});
const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:8}); const p=await ctx.newPage();
await p.goto('https://www.zuzone.org/',{waitUntil:'networkidle',timeout:60000}); await p.waitForTimeout(1200);
await p.screenshot({path:'/Users/booga/Growth/zuzone/reel/ref/old_logo_hi.png',clip:{x:196,y:8,width:136,height:48}});
await b.close(); console.log('logo ok');
