import { chromium } from 'playwright-core';
import fs from 'node:fs';
for (const variant of [{name:'winsize',args:['--use-angle=metal','--window-size=1080,1920'],mobile:true},{name:'nomobile',args:['--use-angle=metal','--window-size=1080,1920'],mobile:false}]) {
  const b=await chromium.launch({channel:'chrome',args:variant.args});
  const ctx=await b.newContext({viewport:{width:432,height:768},deviceScaleFactor:2.5,isMobile:variant.mobile,hasTouch:variant.mobile});
  const p=await ctx.newPage(); const cdp=await ctx.newCDPSession(p);
  let got=null; cdp.on('Page.screencastFrame',({data,metadata,sessionId})=>{ if(!got){ got=Buffer.from(data,'base64'); fs.writeFileSync(`/Users/booga/Growth/zuzone/reel/ref/probe_${variant.name}.jpg`,got);} cdp.send('Page.screencastFrameAck',{sessionId}).catch(()=>{}); });
  await p.goto('https://zuzone.boogaav.workers.dev/why-zuzone',{waitUntil:'networkidle',timeout:60000});
  await cdp.send('Page.startScreencast',{format:'jpeg',quality:92,maxWidth:1080,maxHeight:1920,everyNthFrame:1});
  await p.evaluate(()=>window.scrollTo(0,50)); await p.waitForTimeout(1500); await cdp.send('Page.stopScreencast'); await b.close();
  console.log(variant.name, got? 'frame bytes '+got.length : 'no frame');
}
