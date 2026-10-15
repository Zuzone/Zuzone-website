import { chromium } from 'playwright-core';
import fs from 'node:fs';
const ROOT='/Users/booga/Growth/zuzone/reel'; const OUT=`${ROOT}/out/promo_frames`; fs.rmSync(OUT,{recursive:true,force:true}); fs.mkdirSync(OUT,{recursive:true});
const URL='https://zuzone.boogaav.workers.dev';
const b=await chromium.launch({channel:'chrome',headless:false,args:['--window-size=600,1100','--window-position=40,40']});
const VW=540,VH=960; const ctx=await b.newContext({viewport:{width:VW,height:VH},deviceScaleFactor:2,isMobile:true,hasTouch:true});
const page=await ctx.newPage(); const cdp=await ctx.newCDPSession(page);
let n=0; const frames=[]; const marks=[]; const mark=(name)=>{marks.push({name,ts:Date.now()/1000}); console.log('mark',name);};
const wait=(ms)=>page.waitForTimeout(ms);
cdp.on('Page.screencastFrame',({data,metadata,sessionId})=>{ const i=n++; fs.writeFileSync(`${OUT}/f${String(i).padStart(5,'0')}.jpg`,Buffer.from(data,'base64')); frames.push({i,ts:metadata.timestamp||Date.now()/1000}); cdp.send('Page.screencastFrameAck',{sessionId}).catch(()=>{}); });
async function wheel(k,dy,gap){ await page.mouse.move(VW/2,VH*0.68); for(let i=0;i<k;i++){ await page.mouse.wheel(0,dy); await wait(gap);} }
async function openPanel(name){ const menu=page.getByRole('button',{name:'Menu'}).first(); if(await menu.count()){ await menu.click(); await wait(800); } const t=page.getByText(name,{exact:true}).first(); if(await t.count()) await t.dispatchEvent('click').catch(e=>console.log('fail',name)); else console.log('not found',name); await wait(600); await page.mouse.click(75,37); }
await page.goto(URL+'/',{waitUntil:'networkidle',timeout:60000});
await cdp.send('Page.startScreencast',{format:'jpeg',quality:92,maxWidth:1100,maxHeight:2000,everyNthFrame:1});
mark('load'); await wait(6500); mark('globe_ready');
// List view
const list=page.getByRole('radio',{name:'List'}).first(); if(await list.count()) await list.click(); else console.log('no list'); await wait(600);
const expand=page.getByRole('button',{name:/expand panel/i}).first(); if(await expand.count()) await expand.click(); await wait(1500); mark('list_open');
await wheel(12,70,160); mark('list_scrolled'); await wait(500);
const collapse=page.getByRole('button',{name:/collapse panel/i}).first(); if(await collapse.count()) await collapse.click(); await wait(600);
// Add a village entry (never signs in)
await openPanel('Events'); await wait(1500); mark('events_open');
const add=page.getByRole('button',{name:/add a village/i}).first(); if(await add.count()){ await add.click().catch(()=>{}); mark('add_tap'); } else console.log('no add button');
await wait(3500); mark('add_wait');
await cdp.send('Page.stopScreencast'); await wait(300);
fs.writeFileSync(`${OUT}/manifest.json`,JSON.stringify({frames,marks},null,1)); console.log('frames',frames.length,'pages',ctx.pages().length); await b.close();
