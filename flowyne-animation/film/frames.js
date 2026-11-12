// usage: node frames.js file.html outdir t1 t2 ...
const { chromium } = require('playwright'); const path=require('path'); const fs=require('fs');
(async()=>{const [f,out,...ts]=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.addInitScript(()=>{window.__recording=true});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+path.resolve(f));await p.waitForFunction(()=>window.__ready);await p.evaluate(()=>document.fonts.ready);
for(const t of ts){await p.evaluate(t=>window.__seek(+t),t);await p.screenshot({path:`${out}/t${String(t).padStart(5,'0')}.png`});}
await b.close()})();
