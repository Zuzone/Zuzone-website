import { chromium } from 'playwright-core';
const b=await chromium.launch({channel:'chrome',args:['--use-angle=metal']});
const ctx=await b.newContext({viewport:{width:432,height:768},deviceScaleFactor:2.5,isMobile:true,hasTouch:true});
const p=await ctx.newPage(); await p.goto('https://zuzone.boogaav.workers.dev/',{waitUntil:'networkidle',timeout:60000}); await p.waitForTimeout(6000);
const info=await p.evaluate(()=>{
  const btns=[...document.querySelectorAll('button,a[role=button],[role=button]')].map(b=>({t:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,40),r:b.getBoundingClientRect().toJSON(),vis:b.offsetParent!==null})).filter(x=>x.vis&&x.r.width>0);
  const markers=[...document.querySelectorAll('.mapboxgl-marker')].map(m=>({t:m.textContent.trim().slice(0,40),x:Math.round(m.getBoundingClientRect().x),y:Math.round(m.getBoundingClientRect().y)}));
  const inputs=[...document.querySelectorAll('input')].map(i=>({ph:i.placeholder,type:i.type,vis:i.offsetParent!==null}));
  const scrollers=[...document.querySelectorAll('*')].filter(e=>e.scrollWidth>e.clientWidth+20&&getComputedStyle(e).overflowX!=='visible').map(e=>({tag:e.tagName,cls:(e.className||'').toString().slice(0,80),sw:e.scrollWidth,cw:e.clientWidth}));
  return {btns,markers,inputs,scrollers};
});
console.log(JSON.stringify(info,null,1));
await b.close();
