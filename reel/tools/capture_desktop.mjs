import { chromium } from 'playwright-core';
import fs from 'node:fs';
const ROOT='/Users/booga/Growth/zuzone/reel'; const OUT=`${ROOT}/out/desktop_frames`; fs.rmSync(OUT,{recursive:true,force:true}); fs.mkdirSync(OUT,{recursive:true});
const URL='https://zuzone.boogaav.workers.dev';
const b=await chromium.launch({channel:'chrome',headless:false,args:['--window-size=1460,900','--window-position=20,20']});
const VW=1440,VH=810; const ctx=await b.newContext({viewport:{width:VW,height:VH},deviceScaleFactor:4/3});
const page=await ctx.newPage(); const cdp=await ctx.newCDPSession(page);
let n=0; const frames=[]; const marks=[]; const mark=(name)=>{marks.push({name,ts:Date.now()/1000}); console.log('mark',name);};
const wait=(ms)=>page.waitForTimeout(ms);
cdp.on('Page.screencastFrame',({data,metadata,sessionId})=>{ const i=n++; fs.writeFileSync(`${OUT}/f${String(i).padStart(5,'0')}.jpg`,Buffer.from(data,'base64')); frames.push({i,ts:metadata.timestamp||Date.now()/1000}); if(i===0) console.log('first frame bytes',data.length); cdp.send('Page.screencastFrameAck',{sessionId}).catch(()=>{}); });
async function drag(x1,y1,x2,y2,ms,steps=45){ await page.mouse.move(x1,y1); await page.mouse.down(); for(let s=1;s<=steps;s++){const k=s/steps; const e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2; await page.mouse.move(x1+(x2-x1)*e,y1+(y2-y1)*e); await wait(ms/steps);} await page.mouse.up(); }
async function wheel(x,y,k,dy,gap){ await page.mouse.move(x,y); for(let i=0;i<k;i++){ await page.mouse.wheel(0,dy); await wait(gap);} }
async function clickBtn(re){ const b=page.getByRole('button',{name:re}).first(); if(await b.count()){ await b.click({timeout:3000}).catch(async()=>{ await b.dispatchEvent('click').catch(()=>{}); }); return true; } console.log('no button',re); return false; }
await page.goto(URL+'/',{waitUntil:'networkidle',timeout:60000});
await cdp.send('Page.startScreencast',{format:'jpeg',quality:92,maxWidth:1920,maxHeight:1080,everyNthFrame:1});
mark('load'); await wait(7000); mark('globe_ready');
await drag(560,430,900,430,1800); await wait(400); await drag(560,430,860,430,1800); mark('spin_end'); await wait(600);
const pick=await page.evaluate(()=>{ const prefer=['Zuitzerland','4Seas','Zanzalu','ZuCity Japan','ZuKaş','AyaHQ','Futura']; const ms=[...document.querySelectorAll('.mapboxgl-marker')].map(m=>{const r=m.getBoundingClientRect(); const op=parseFloat(getComputedStyle(m).opacity||'1'); return {t:m.textContent.trim().split('\n')[0].trim(),x:r.x+r.width/2,y:r.y+r.height/2,vis:op>0.5&&r.x>200&&r.x+r.width<window.innerWidth-200&&r.y>150&&r.y<window.innerHeight-200};}).filter(m=>m.vis); for(const p of prefer){const m=ms.find(x=>x.t.startsWith(p)); if(m) return m;} return ms[0]||null; });
console.log('pick',JSON.stringify(pick)); mark('tap_pin:'+(pick?pick.t:'none')); if(pick) await page.mouse.click(pick.x,pick.y); await wait(3200); mark('village_end');
await page.goBack({waitUntil:'networkidle',timeout:30000}).catch(()=>{}); if(!/\/$/.test(page.url())) await page.goto(URL+'/',{waitUntil:'networkidle',timeout:60000}); await wait(5000); mark('home_again');
const list=page.getByRole('radio',{name:'List'}).first(); if(await list.count()) await list.click(); await wait(500);
await clickBtn(/expand panel/i); await wait(1500); mark('list_open'); await wheel(VW/2,VH-120,12,70,160); mark('list_scrolled'); await wait(400);
const gantt=page.getByRole('radio',{name:'Gantt'}).first(); if(await gantt.count()) await gantt.click(); await wait(1200); mark('gantt_open');
const r=await page.evaluate(()=>new Promise(res=>{ let sc=null; const el=[...document.querySelectorAll('*')].find(e=>e.children.length===0&&e.textContent.trim()==='Today'); if(el){ sc=el; while(sc&&!(sc.scrollWidth>sc.clientWidth+20&&getComputedStyle(sc).overflowX!=='visible')) sc=sc.parentElement; } if(!sc){ const c=[...document.querySelectorAll('*')].filter(e=>e.scrollWidth>e.clientWidth+100&&getComputedStyle(e).overflowX!=='visible'&&!e.classList.contains('mapboxgl-map')&&e.getBoundingClientRect().y>380); sc=c[0]||null; } if(!sc) return res('none'); const s0=sc.scrollLeft,d=Math.min(1200,sc.scrollWidth-sc.clientWidth-s0); const t0=performance.now(); (function step(){ const k=Math.min(1,(performance.now()-t0)/2600); const e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2; sc.scrollLeft=s0+d*e; if(k<1) requestAnimationFrame(step); else res('ok '+d); })(); }));
console.log('gantt scroll',r); mark('gantt_scrolled'); await wait(500); await clickBtn(/collapse panel/i); await wait(500);
await clickBtn(/^Zupulse$/); await wait(4500); mark('zupulse_open'); await wheel(VW*0.84,VH*0.6,14,70,150); mark('zupulse_scrolled'); await wait(400); await clickBtn(/close/i); await wait(700);
await clickBtn(/^Events$/); await wait(2000); mark('events_open'); const add=await clickBtn(/add a village/i); mark('add_tap'); await wait(3500); mark('add_wait'); await page.keyboard.press('Escape'); await wait(500); await clickBtn(/close/i); await wait(600);
const inp=page.getByPlaceholder('you@example.com').first(); if(await inp.count()){ await inp.click(); mark('newsletter_type'); await page.keyboard.type('hello@zuzone.org',{delay:75}); } mark('newsletter_typed'); await wait(800);
await page.goto(URL+'/why-zuzone',{waitUntil:'networkidle',timeout:60000}); mark('why_load'); await wait(1500); mark('why_scroll');
await page.evaluate(()=>new Promise(res=>{ const el=document.scrollingElement; const t0=performance.now(); (function step(){ const k=Math.min(1,(performance.now()-t0)/3200); const e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2; el.scrollTop=1400*e; if(k<1) requestAnimationFrame(step); else res(); })(); })); mark('why_scrolled'); await wait(800);
await cdp.send('Page.stopScreencast'); await wait(300);
fs.writeFileSync(`${OUT}/manifest.json`,JSON.stringify({frames,marks},null,1)); console.log('frames',frames.length); await b.close();
