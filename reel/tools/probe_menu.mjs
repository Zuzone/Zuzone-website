import { chromium } from 'playwright-core';
const b=await chromium.launch({channel:'chrome',args:['--use-angle=metal']});
const ctx=await b.newContext({viewport:{width:432,height:768},deviceScaleFactor:2.5,isMobile:true,hasTouch:true});
const p=await ctx.newPage(); await p.goto('https://zuzone.boogaav.workers.dev/',{waitUntil:'networkidle',timeout:60000}); await p.waitForTimeout(5000);
await p.getByRole('button',{name:'Menu'}).first().click(); await p.waitForTimeout(800);
const dom=await p.evaluate(()=>{ const el=[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&e.textContent.trim()==='Zupulse')[0]; let n=el,out=[]; for(let i=0;i<4&&n;i++){ out.push(n.tagName+' role='+n.getAttribute('role')+' cls='+(n.className||'').toString().slice(0,60)); n=n.parentElement;} const r=el.getBoundingClientRect(); return {chain:out,rect:[r.x,r.y,r.width,r.height]}; });
console.log(JSON.stringify(dom));
const opened=async()=>{ await p.waitForTimeout(1500); return (await p.getByText('ZuThread').count())>0; };
let ok=false;
const mi=p.getByRole('menuitem',{name:'Zupulse'}).first(); if(await mi.count()){ await mi.click({timeout:3000}).catch(e=>console.log('menuitem click fail',e.message.split('\n')[0])); ok=await opened(); console.log('menuitem role click ->',ok); }
if(!ok){ const r=dom.rect; await p.touchscreen.tap(r[0]+r[2]/2,r[1]+r[3]/2); ok=await opened(); console.log('touch tap ->',ok); }
if(!ok){ await p.keyboard.press('ArrowDown'); await p.keyboard.press('ArrowDown'); await p.keyboard.press('ArrowDown'); await p.keyboard.press('ArrowDown'); await p.keyboard.press('Enter'); ok=await opened(); console.log('keyboard ->',ok); }
if(!ok){ await p.evaluate(()=>{ const el=[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&e.textContent.trim()==='Zupulse')[0]; let n=el; while(n&&!/BUTTON|A|LI|DIV/.test(n.tagName)) n=n.parentElement; n.click(); }); ok=await opened(); console.log('dom click ->',ok); }
if(ok){ const closeBtns=await p.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null).map(b=>(b.getAttribute('aria-label')||b.textContent.trim()).slice(0,30))); console.log('buttons now:',closeBtns.join(' | ')); }
await p.screenshot({path:'/Users/booga/Growth/zuzone/reel/ref/probe_menu.jpg',type:'jpeg',quality:80});
await b.close();
