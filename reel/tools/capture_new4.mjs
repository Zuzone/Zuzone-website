import { chromium } from 'playwright-core';
import fs from 'node:fs';
const ROOT='/Users/booga/Growth/zuzone/reel'; const OUT=`${ROOT}/out/new_frames4`; fs.rmSync(OUT,{recursive:true,force:true}); fs.mkdirSync(OUT,{recursive:true});
const URL='https://zuzone.boogaav.workers.dev';
const b=await chromium.launch({channel:'chrome',args:['--use-angle=metal']});
const ctx=await b.newContext({viewport:{width:432,height:768},deviceScaleFactor:2.5,isMobile:true,hasTouch:true});
const page=await ctx.newPage(); const cdp=await ctx.newCDPSession(page); 
let n=0; const frames=[]; const marks=[]; const mark=(name)=>{marks.push({name,ts:Date.now()/1000}); console.log('mark',name);};
let running=false; let loopDone=null;
async function shotLoop(){ while(running){ try{ const {data}=await cdp.send('Page.captureScreenshot',{format:'jpeg',quality:90,fromSurface:true}); const i=n++; fs.writeFileSync(`${OUT}/f${String(i).padStart(5,'0')}.jpg`,Buffer.from(data,'base64')); frames.push({i,ts:Date.now()/1000}); if(i===0) console.log('first frame bytes',data.length); }catch(e){ await page.waitForTimeout(50); } } }
const wait=(ms)=>page.waitForTimeout(ms);
async function drag(x1,y1,x2,y2,ms,steps=45){ await page.mouse.move(x1,y1); await page.mouse.down(); for(let s=1;s<=steps;s++){const k=s/steps; const e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2; await page.mouse.move(x1+(x2-x1)*e,y1+(y2-y1)*e); await wait(ms/steps);} await page.mouse.up(); }
async function wheel(n,dy,gap){ await page.mouse.move(216,520); for(let i=0;i<n;i++){ await page.mouse.wheel(0,dy); await wait(gap);} }
async function openPanel(name){ const menu=page.getByRole('button',{name:'Menu'}).first(); if(await menu.count()){ await menu.click(); await wait(800); mark('menu_open'); } else console.log('no menu'); const t=page.getByText(name,{exact:true}).first(); if(await t.count()) await t.dispatchEvent('click').catch(e=>console.log('click fail',name,e.message)); else console.log('not found',name); }
async function closePanel(){ const c=page.getByRole('button',{name:/close/i}).first(); if(await c.count()) await c.click().catch(()=>{}); else await page.keyboard.press('Escape'); await wait(800); }
await page.goto(URL+'/',{waitUntil:'networkidle',timeout:60000});
running=true; loopDone=shotLoop();
mark('load'); await wait(7000); mark('globe_ready');
await drag(110,420,330,420,1800); await wait(400); await drag(110,420,300,420,1800); mark('spin_end'); await wait(600);
const pick=await page.evaluate(()=>{ const prefer=['4Seas','Zanzalu','ZuCity Japan','Zuitzerland','ZuKaş','AyaHQ','Futura']; const ms=[...document.querySelectorAll('.mapboxgl-marker')].map(m=>{const r=m.getBoundingClientRect(); const op=parseFloat(getComputedStyle(m).opacity||'1'); return {t:m.textContent.trim().split('\n')[0].trim(),x:r.x+r.width/2,y:r.y+r.height/2,op,vis:op>0.5&&r.x>40&&r.x+r.width<392&&r.y>120&&r.y<600};}).filter(m=>m.vis); for(const p of prefer){const m=ms.find(x=>x.t.startsWith(p)); if(m) return m;} return ms[0]||null; });
console.log('pick',JSON.stringify(pick)); mark('tap_pin:'+(pick?pick.t:'none'));
if(pick) await page.mouse.click(pick.x,pick.y); await wait(3200); mark('village_end');
await page.goBack({waitUntil:'networkidle',timeout:30000}).catch(()=>{}); if(!/\/$/.test(page.url())) await page.goto(URL+'/',{waitUntil:'networkidle',timeout:60000}); await wait(5000); mark('home_again');
const expand=page.getByRole('button',{name:/expand panel/i}).first(); if(await expand.count()) await expand.click(); else console.log('no expand'); await wait(1500); mark('gantt_open');
const r=await page.evaluate(()=>new Promise(res=>{ let sc=null; const el=[...document.querySelectorAll('*')].find(e=>e.children.length===0&&e.textContent.trim()==='Today'); if(el){ sc=el; while(sc&&!(sc.scrollWidth>sc.clientWidth+20&&getComputedStyle(sc).overflowX!=='visible')) sc=sc.parentElement; } if(!sc){ const c=[...document.querySelectorAll('*')].filter(e=>e.scrollWidth>e.clientWidth+100&&getComputedStyle(e).overflowX!=='visible'&&!e.classList.contains('mapboxgl-map')&&e.getBoundingClientRect().y>380); sc=c[0]||null; } if(!sc) return res('none'); const s0=sc.scrollLeft,d=Math.min(900,sc.scrollWidth-sc.clientWidth-s0); const t0=performance.now(); (function step(){ const k=Math.min(1,(performance.now()-t0)/2600); const e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2; sc.scrollLeft=s0+d*e; if(k<1) requestAnimationFrame(step); else res('ok '+d+' '+(sc.className||'').toString().slice(0,60)); })(); }));
console.log('gantt scroll',r); mark('gantt_scrolled'); await wait(600);
const collapse=page.getByRole('button',{name:/collapse panel/i}).first(); if(await collapse.count()) await collapse.click(); await wait(600);
await openPanel('Zupulse'); await wait(4500); mark('zupulse_open'); await wheel(14,70,150); mark('zupulse_scrolled'); await wait(500); await closePanel();
await openPanel('Events'); await wait(2500); mark('events_open'); await wheel(8,60,150); mark('events_scrolled'); await closePanel();
const inp=page.getByPlaceholder('you@example.com').first(); if(await inp.count()){ await inp.click(); mark('newsletter_type'); await page.keyboard.type('hello@zuzone.org',{delay:75}); } else console.log('no input'); mark('newsletter_typed'); await wait(900);
await page.goto(URL+'/why-zuzone',{waitUntil:'networkidle',timeout:60000}); mark('why_load'); await wait(1500); mark('why_scroll');
await page.evaluate(()=>new Promise(res=>{ const el=document.scrollingElement; const t0=performance.now(); (function step(){ const k=Math.min(1,(performance.now()-t0)/3200); const e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2; el.scrollTop=1500*e; if(k<1) requestAnimationFrame(step); else res(); })(); })); mark('why_scrolled'); await wait(800);
running=false; await loopDone;
fs.writeFileSync(`${OUT}/manifest.json`,JSON.stringify({frames,marks},null,1)); console.log('frames',frames.length,'marks',marks.length); await b.close();
