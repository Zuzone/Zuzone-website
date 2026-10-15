import { chromium } from 'playwright-core';
import fs from 'node:fs';
const variants=[
 {name:'scale_bounds', bounds:true, scale:2.5},
 {name:'scale_only', bounds:false, scale:2.5},
 {name:'bounds_only', bounds:true, scale:1},
];
for (const v of variants) {
  const b=await chromium.launch({channel:'chrome',args:['--use-angle=metal']});
  const ctx=await b.newContext({viewport:{width:432,height:768},deviceScaleFactor:2.5,isMobile:true,hasTouch:true});
  const p=await ctx.newPage(); const cdp=await ctx.newCDPSession(p);
  if(v.bounds){ try{ const {windowId}=await cdp.send('Browser.getWindowForTarget'); await cdp.send('Browser.setWindowBounds',{windowId,bounds:{width:1100,height:1950}}); }catch(e){ console.log(v.name,'bounds err',e.message.split('\n')[0]); } }
  if(v.scale!==1){ try{ await cdp.send('Emulation.setDeviceMetricsOverride',{width:432,height:768,deviceScaleFactor:2.5,mobile:true,scale:v.scale}); }catch(e){ console.log(v.name,'emul err',e.message.split('\n')[0]); } }
  let got=null; cdp.on('Page.screencastFrame',({data,sessionId})=>{ if(!got){ got=Buffer.from(data,'base64'); fs.writeFileSync(`/Users/booga/Growth/zuzone/reel/ref/probe_${v.name}.jpg`,got);} cdp.send('Page.screencastFrameAck',{sessionId}).catch(()=>{}); });
  await p.goto('https://zuzone.boogaav.workers.dev/why-zuzone',{waitUntil:'networkidle',timeout:60000});
  await cdp.send('Page.startScreencast',{format:'jpeg',quality:92,maxWidth:1100,maxHeight:1950,everyNthFrame:1});
  await p.evaluate(()=>window.scrollTo(0,60)); await p.waitForTimeout(1500); await cdp.send('Page.stopScreencast');
  const iw=await p.evaluate(()=>[window.innerWidth,window.innerHeight,document.querySelector('button[aria-label="Menu"]')?'menu':'nomenu']);
  await b.close(); console.log(v.name, got?'frame bytes '+got.length:'no frame', 'inner',iw);
}
