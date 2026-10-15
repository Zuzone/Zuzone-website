import { chromium } from 'playwright-core';
import fs from 'node:fs';
// 1) headless: clip with scale 2.5
{ const b=await chromium.launch({channel:'chrome',args:['--use-angle=metal']});
  const ctx=await b.newContext({viewport:{width:432,height:768},deviceScaleFactor:2.5,isMobile:true,hasTouch:true});
  const p=await ctx.newPage(); const cdp=await ctx.newCDPSession(p);
  await p.goto('https://zuzone.boogaav.workers.dev/',{waitUntil:'networkidle',timeout:60000}); await p.waitForTimeout(4000);
  let t=Date.now(); let r; for(let i=0;i<4;i++){ r=await cdp.send('Page.captureScreenshot',{format:'jpeg',quality:90,captureBeyondViewport:true,clip:{x:0,y:0,width:432,height:768,scale:2.5}}); } console.log('headless clip2.5 avg ms',(Date.now()-t)/4); fs.writeFileSync('/Users/booga/Growth/zuzone/reel/ref/probe_clip25.jpg',Buffer.from(r.data,'base64'));
  await b.close(); }
// 2) headful: screencast frame size at retina
{ const b=await chromium.launch({channel:'chrome',headless:false,args:['--window-size=600,1100','--window-position=40,40']});
  const ctx=await b.newContext({viewport:{width:540,height:960},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  const p=await ctx.newPage(); const cdp=await ctx.newCDPSession(p);
  let got=null,count=0,t0=0; cdp.on('Page.screencastFrame',({data,sessionId})=>{ if(!got){got=Buffer.from(data,'base64'); fs.writeFileSync('/Users/booga/Growth/zuzone/reel/ref/probe_headful.jpg',got); t0=Date.now();} count++; cdp.send('Page.screencastFrameAck',{sessionId}).catch(()=>{}); });
  await p.goto('https://zuzone.boogaav.workers.dev/',{waitUntil:'networkidle',timeout:60000}); await p.waitForTimeout(4000);
  await cdp.send('Page.startScreencast',{format:'jpeg',quality:92,maxWidth:1100,maxHeight:2000,everyNthFrame:1});
  await p.mouse.move(100,500); await p.mouse.down(); for(let i=1;i<=30;i++){ await p.mouse.move(100+i*10,500); await p.waitForTimeout(50);} await p.mouse.up(); await p.waitForTimeout(500);
  await cdp.send('Page.stopScreencast'); console.log('headful frames',count,'in',Date.now()-t0,'ms', 'menu?', await p.evaluate(()=>!!document.querySelector('button[aria-label="Menu"]')));
  await b.close(); }
