// node render.js page.html out.mp4 [fps]
const { chromium } = require('playwright'); const path=require('path'); const {spawn}=require('child_process');
(async()=>{const [f,out,fpsA]=process.argv.slice(2);const fps=+(fpsA||30);
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.addInitScript(()=>{window.__recording=true});
await p.goto('file://'+path.resolve(f));await p.waitForFunction(()=>window.__ready);await p.evaluate(()=>document.fonts.ready);
const dur=await p.evaluate(()=>window.__duration);const N=Math.round(dur*fps);
const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(fps),'-i','-','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',out],{stdio:['pipe','inherit','inherit']});
for(let i=0;i<N;i++){await p.evaluate(t=>window.__seek(t),i/fps);const buf=await p.screenshot({type:'jpeg',quality:94});
 if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r)); if(i%150===0)console.log('frame',i,'/',N);}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();console.log('done',out)})();
