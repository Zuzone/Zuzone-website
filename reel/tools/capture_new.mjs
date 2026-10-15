import { chromium } from 'playwright-core';
import fs from 'node:fs';
const ROOT='/Users/booga/Growth/zuzone/reel'; const OUT=`${ROOT}/out/new_frames`; fs.rmSync(OUT,{recursive:true,force:true}); fs.mkdirSync(OUT,{recursive:true});
const URL='https://zuzone.boogaav.workers.dev';
const b=await chromium.launch({channel:'chrome',args:['--use-angle=metal']});
const ctx=await b.newContext({viewport:{width:432,height:768},deviceScaleFactor:2.5,isMobile:true,hasTouch:true});
const page=await ctx.newPage(); const cdp=await ctx.newCDPSession(page);
let n=0; const frames=[]; const marks=[]; const mark=(name)=>{marks.push({name,ts:Date.now()/1000}); console.log('mark',name);};
cdp.on('Page.screencastFrame',({data,metadata,sessionId})=>{ const i=n++; fs.writeFileSync(`${OUT}/f${String(i).padStart(5,'0')}.jpg`,Buffer.from(data,'base64')); frames.push({i,ts:metadata.timestamp,rx:Date.now()/1000}); cdp.send('Page.screencastFrameAck',{sessionId}).catch(()=>{}); });
async function drag(x1,y1,x2,y2,ms,steps=45){ await page.mouse.move(x1,y1); await page.mouse.down(); for(let s=1;s<=steps;s++){const k=s/steps; const e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2; await page.mouse.move(x1+(x2-x1)*e,y1+(y2-y1)*e); await page.waitForTimeout(ms/steps);} await page.mouse.up(); }
async function smoothScroll(sel,dy,ms){ return page.evaluate(([sel,dy,ms])=>new Promise(res=>{ const el=sel?document.querySelector(sel):document.scrollingElement; const s0=el.scrollTop; const t0=performance.now(); (function step(){ const k=Math.min(1,(performance.now()-t0)/ms); const e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2; el.scrollTop=s0+dy*e; if(k<1) requestAnimationFrame(step); else res('ok'); })(); }),[sel,dy,ms]); }
async function clickText(t,ms=2500){ const l=page.getByText(t,{exact:false}).first(); if(await l.count()){ await l.click({timeout:4000}).catch(e=>console.log('click fail',t,e.message)); } else console.log('not found',t); await page.waitForTimeout(ms); }
await page.goto(URL+'/',{waitUntil:'networkidle',timeout:60000});
await cdp.send('Page.startScreencast',{format:'jpeg',quality:92,maxWidth:1080,maxHeight:1920,everyNthFrame:1});
mark('load'); await page.waitForTimeout(7000); mark('globe_ready');
await drag(110,420,330,420,1800); await page.waitForTimeout(500); await drag(110,420,300,420,1800); mark('spin_end'); await page.waitForTimeout(800);
mark('tap_zuitzerland'); await clickText('Zuitzerland',3000); mark('card_zuitzerland_end');
await page.keyboard.press('Escape'); await page.waitForTimeout(600);
await drag(330,420,120,420,1600); await page.waitForTimeout(500); mark('tap_4seas'); await clickText('4Seas',3000); mark('card_4seas_end');
await page.keyboard.press('Escape'); await page.waitForTimeout(600);
const expand=page.getByRole('button',{name:/expand panel/i}).first(); if(await expand.count()) await expand.click(); else console.log('no expand'); await page.waitForTimeout(1500); mark('gantt_open');
const r=await page.evaluate(()=>new Promise(res=>{ const el=[...document.querySelectorAll('*')].find(e=>e.children.length===0&&e.textContent.trim()==='Today'); let sc=el; while(sc&&!(sc.scrollWidth>sc.clientWidth+20)) sc=sc.parentElement; if(!sc) return res('none'); const s0=sc.scrollLeft, d=Math.min(900,sc.scrollWidth-sc.clientWidth-s0); const t0=performance.now(); (function step(){ const k=Math.min(1,(performance.now()-t0)/2600); const e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2; sc.scrollLeft=s0+d*e; if(k<1) requestAnimationFrame(step); else res('ok '+d); })(); })); console.log('gantt scroll',r); mark('gantt_scrolled'); await page.waitForTimeout(600);
const collapse=page.getByRole('button',{name:/collapse panel/i}).first(); if(await collapse.count()) await collapse.click(); await page.waitForTimeout(600);
async function openPanel(name){ const menu=page.getByRole('button',{name:/menu|navigation/i}).first(); if(await menu.count()){ await menu.click(); await page.waitForTimeout(700); } const btn=page.getByRole('button',{name}).first(); if(await btn.count()) await btn.click({timeout:4000}).catch(()=>{}); else await clickText(name,0); }
await openPanel('Zupulse'); await page.waitForTimeout(4500); mark('zupulse_open');
await page.mouse.move(216,520); for(let i=0;i<14;i++){ await page.mouse.wheel(0,70); await page.waitForTimeout(150); } mark('zupulse_scrolled'); await page.waitForTimeout(500);
let close=page.getByRole('button',{name:/close/i}).first(); if(await close.count()) await close.click().catch(()=>{}); await page.waitForTimeout(700);
await openPanel('Events'); await page.waitForTimeout(2500); mark('events_open'); await page.mouse.move(216,520); for(let i=0;i<8;i++){ await page.mouse.wheel(0,60); await page.waitForTimeout(150);} mark('events_scrolled');
close=page.getByRole('button',{name:/close/i}).first(); if(await close.count()) await close.click().catch(()=>{}); await page.waitForTimeout(700);
const inp=page.getByPlaceholder('you@example.com').first(); if(await inp.count()){ await inp.scrollIntoViewIfNeeded().catch(()=>{}); await inp.click(); mark('newsletter_type'); await page.keyboard.type('hello@zuzone.org',{delay:75}); } mark('newsletter_typed'); await page.waitForTimeout(900);
await page.goto(URL+'/why-zuzone',{waitUntil:'networkidle',timeout:60000}); mark('why_load'); await page.waitForTimeout(1500); mark('why_scroll');
await smoothScroll(null,1500,3200); mark('why_scrolled'); await page.waitForTimeout(800);
await cdp.send('Page.stopScreencast'); await page.waitForTimeout(500);
fs.writeFileSync(`${OUT}/manifest.json`,JSON.stringify({frames,marks},null,1)); console.log('frames',frames.length,'marks',marks.length); await b.close();
