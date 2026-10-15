import { chromium } from 'playwright-core';
const b=await chromium.launch({channel:'chrome',args:['--use-angle=metal']});
const ctx=await b.newContext({viewport:{width:432,height:768},deviceScaleFactor:2.5,isMobile:true,hasTouch:true});
const p=await ctx.newPage(); await p.goto('https://zuzone.boogaav.workers.dev/',{waitUntil:'networkidle',timeout:60000}); await p.waitForTimeout(5000);
await p.getByRole('button',{name:'Menu'}).first().click(); await p.waitForTimeout(900);
const leaves=await p.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>e.children.length===0&&e.textContent.trim()&&e.offsetParent!==null).map(e=>{const r=e.getBoundingClientRect(); let n=e, chain=[]; for(let i=0;i<3&&n;i++){chain.push(n.tagName+(n.getAttribute('role')?'['+n.getAttribute('role')+']':'')); n=n.parentElement;} return e.textContent.trim().slice(0,24)+' @'+Math.round(r.x)+','+Math.round(r.y)+' '+chain.join('<');}));
console.log(leaves.filter(l=>/Zupulse|Events|Historic|Newsletter|Twitter/.test(l)).join('\n'));
const roles=await p.evaluate(()=>[...document.querySelectorAll('[role]')].filter(e=>e.offsetParent!==null).map(e=>e.getAttribute('role')+':'+e.textContent.trim().slice(0,20)));
console.log('roles:',roles.join(' | '));
const opened=async()=>{ await p.waitForTimeout(1800); return (await p.getByText('ZuThread').count())>0; };
let ok=false;
const mi=p.getByRole('menuitem',{name:/Zupulse/}).first(); if(await mi.count()){ await mi.click({timeout:3000}).catch(e=>console.log('menuitem click fail',e.message.split('\n')[0])); ok=await opened(); console.log('menuitem role click ->',ok); }
if(!ok){ const t=p.getByText('Zupulse').first(); const bb=await t.boundingBox().catch(()=>null); console.log('bbox',bb); if(bb){ await p.touchscreen.tap(bb.x+bb.width/2,bb.y+bb.height/2); ok=await opened(); console.log('touch tap ->',ok);} }
if(!ok){ const t=p.getByText('Zupulse').first(); await t.dispatchEvent('click').catch(()=>{}); ok=await opened(); console.log('dispatch click ->',ok); }
if(!ok){ await p.keyboard.press('ArrowDown'); await p.keyboard.press('ArrowDown'); await p.keyboard.press('ArrowDown'); await p.keyboard.press('ArrowDown'); await p.keyboard.press('Enter'); ok=await opened(); console.log('keyboard ->',ok); }
if(ok){ const btns=await p.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null).map(b=>(b.getAttribute('aria-label')||b.textContent.trim()).slice(0,30))); console.log('buttons now:',btns.join(' | ')); }
await p.screenshot({path:'/Users/booga/Growth/zuzone/reel/ref/probe_menu.jpg',type:'jpeg',quality:80});
await b.close();
