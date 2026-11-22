import {bundle} from '@remotion/bundler';
import {selectComposition,renderStill} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {validateScene} from './validate.mjs';
// Python 3 on any OS: "py -3" (Windows launcher), "python3" or "python"; skips the Windows Store placeholder.
const PY=(process.platform==='win32'?[['py','-3'],['python'],['python3']]:[['python3'],['python']]).find(([e,...f])=>{try{execFileSync(e,[...f,'-c','import sys;assert sys.version_info[0]==3'],{stdio:'ignore'});return true;}catch{return false;}});
if(!PY){console.error('Python 3 not found (Windows: install from python.org and tick "Add python.exe to PATH").');process.exit(2);}
const scene=JSON.parse(fs.readFileSync('SCENE.json')),timeline=JSON.parse(fs.readFileSync('TIMELINE.json'));
const errors=validateScene(scene,timeline,process.cwd());if(errors.length){console.error(errors.join('\n'));process.exit(2);}
// Recompute without modifying the canonical timeline. Stale inputs are a build error.
const sourceHash=execFileSync(PY[0],[...PY.slice(1),'-c',"import json,sys;sys.path.insert(0,'tools');from studio import compile_timeline;compiled=compile_timeline(json.load(open('SHOT_PLAN.json',encoding='utf-8')),json.load(open('ALIGNMENT.json',encoding='utf-8')));assert compiled==json.load(open('TIMELINE.json',encoding='utf-8')),'Timeline is stale or manually diverged; run npm run compile';print(compiled['sourceHash'])"],{encoding:'utf8'}).trim();
if(sourceHash!==timeline.sourceHash)throw new Error('Timeline is stale; run npm run compile before preview QA');
const out=path.resolve('out','qa-'+new Date().toISOString().replace(/[:.]/g,'-'));fs.mkdirSync(out,{recursive:true});
const serveUrl=await bundle({entryPoint:'src/index.ts'});const browserExecutable=process.env.CHROME_BINARY||null;const chromiumOptions={gl:'angle'};
const composition=await selectComposition({serveUrl,id:'CartoonShort',browserExecutable,chromiumOptions});
const frames=[...new Set(timeline.shots.flatMap(s=>s.reviewFrames))].sort((a,b)=>a-b);const report=[];
for(const frame of frames){const s=timeline.shots.find(s=>s.a<=frame&&s.b>frame);let probe=null;const browserErrors=[];const file=path.join(out,`${s.id}-${frame}.png`);
 await renderStill({serveUrl,composition,frame,scale:.35,output:file,browserExecutable,chromiumOptions,envVariables:{STUDIO_QA:'1'},onBrowserLog:log=>{const i=log.text.indexOf('STUDIO_QA:');if(i>=0){const p=JSON.parse(log.text.slice(i+10));if(p.shot===s.id&&p.frame===frame)probe=p;}if(log.type==='error')browserErrors.push(log.text);}});
 const picture=JSON.parse(execFileSync(PY[0],[...PY.slice(1),'-c',"from PIL import Image,ImageStat;import json,sys;im=Image.open(sys.argv[1]).convert('L');s=ImageStat.Stat(im);print(json.dumps({'mean':s.mean[0],'std':s.stddev[0]}))",file],{encoding:'utf8'}));
 const flags=[...(probe?.flags??[{flag:'PROBE_MISSING',subject:s.id}]),...browserErrors.map(e=>({flag:'BROWSER_ERROR',subject:e}))];
 if(picture.mean<35)flags.push({flag:'DARK_FRAME',subject:'picture'});if(picture.mean>235)flags.push({flag:'BRIGHT_FRAME',subject:'picture'});if(picture.std<7)flags.push({flag:'FLAT_FRAME',subject:'picture'});
 const reviewed=flags.map(f=>{const exception=['PROBE_MISSING','BROWSER_ERROR'].includes(f.flag)?null:scene.qa?.exceptions?.find(e=>e.shot===s.id&&e.flag===f.flag&&e.reason?.trim());return {...f,accepted:!!exception,reason:exception?.reason??null};});
 report.push({frame,shot:s.id,file,picture,flags:reviewed});console.log(s.id,frame,reviewed.length?reviewed.map(f=>`${f.flag}${f.accepted?' (reviewed)':''}`).join(', '):'ok');
}
const unresolved=report.flatMap(r=>r.flags.filter(f=>!f.accepted));
fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({timelineRevision:timeline.revision,sourceHash,scope:'Sampled stills and scene geometry; playback/audio review remains separate',passed:unresolved.length===0,unresolved:unresolved.length,frames:report},null,2));
execFileSync(PY[0],[...PY.slice(1),'-c',`from PIL import Image,ImageDraw
import json,sys,math
from pathlib import Path
p=Path(sys.argv[1]);rows=json.load(open(p/'report.json'))['frames'];w,h=216,404
im=Image.new('RGB',(w*4,h*math.ceil(len(rows)/4)),'#ddd7ca');d=ImageDraw.Draw(im)
for i,r in enumerate(rows):
 a=Image.open(r['file']).convert('RGB');a.thumbnail((w,384));x=i%4*w;y=i//4*h;im.paste(a,(x,y+20));d.text((x+3,y+3),str(r['shot'])+' / '+str(r['frame']),fill='black')
im.save(p/'contact.png')`,out]);
console.log('Report:',out);process.exitCode=unresolved.length?2:0;
