import fs from 'node:fs';
import path from 'node:path';
export function validateScene(scene,timeline,root){
 const errors=[];const need=(ok,m)=>{if(!ok)errors.push(m);};const vec=x=>Array.isArray(x)&&x.length===3&&x.every(Number.isFinite);
 const file=(f)=>{if(!f)return;const p=path.resolve(root,'public',f);need(p.startsWith(path.resolve(root,'public')+path.sep)&&fs.existsSync(p),'Missing/invalid public asset: '+f);};
 need(Number.isInteger(scene.width)&&scene.width>0&&Number.isInteger(scene.height)&&scene.height>0,'Positive integer dimensions required');
 need(Number.isInteger(timeline.fps)&&timeline.fps>0,'Positive fps required');
 const characters=new Set();for(const c of scene.characters??[]){need(!characters.has(c.id),'Duplicate character '+c.id);characters.add(c.id);need(vec(c.position)&&Number.isFinite(c.height)&&c.height>0,'Invalid character '+c.id);file(c.rig);
 if(c.rig&&fs.existsSync(path.resolve(root,'public',c.rig))){const r=JSON.parse(fs.readFileSync(path.resolve(root,'public',c.rig)));const ids=new Set((r.layers??[]).map(l=>l.id));need(ids.size===r.layers?.length,'Duplicate rig layer IDs');for(const l of r.layers??[]){file(path.join(path.dirname(c.rig),l.file));need(!l.parent||ids.has(l.parent),'Unknown rig parent');const seen=new Set([l.id]);let p=l.parent;while(p&&ids.has(p)){if(seen.has(p)){errors.push('Cyclic rig parents');break;}seen.add(p);p=r.layers.find(x=>x.id===p)?.parent;}}for(const f of Object.values(r.faces??{}))file(path.join(path.dirname(c.rig),f.file));}}
 const envs=new Set();for(const e of scene.environments??[]){need(!envs.has(e.id),'Duplicate environment '+e.id);envs.add(e.id);file(e.groundTexture);file(e.backdrop);const props=new Set();for(const p of e.props??[]){need(!props.has(p.id),'Duplicate prop '+p.id);props.add(p.id);need(['box','cylinder','image','model'].includes(p.type),'Unknown prop type');need(vec(p.position)&&vec(p.size)&&p.size.every(v=>v>0),'Invalid prop '+p.id);if(['image','model'].includes(p.type))need(Boolean(p.file),'Prop asset missing: '+p.id);file(p.file);file(p.texture);}}
 for(const [name,m] of Object.entries(scene.moods??{}))need(Number.isFinite(m.ambient)&&m.ambient>=0&&Number.isFinite(m.sun)&&m.sun>=0&&vec(m.position)&&typeof m.sunColor==='string'&&typeof m.background==='string','Invalid mood '+name);
 let end=0;const ids=new Set();for(const s of timeline.shots??[]){need(!ids.has(s.id),'Duplicate shot '+s.id);ids.add(s.id);need(s.a===end&&Number.isInteger(s.b)&&s.b>s.a,'Timeline gap/overlap: '+s.id);end=s.b;
 need(envs.has(s.environment),'Missing environment in '+s.id);need(Boolean(scene.moods?.[s.mood]),'Unknown mood in '+s.id);need(vec(s.camera?.position)&&vec(s.camera?.lookAt),'Camera vectors missing in '+s.id);
 for(const k of ['endPosition','endLookAt'])if(s.camera?.[k])need(vec(s.camera[k]),'Invalid camera '+k);
 need(['cut','glide','dissolve'].includes(s.transition??'cut'),'Unknown transition');
 if(s.transitionFrames!==undefined)need(Number.isInteger(s.transitionFrames)&&s.transitionFrames>0&&s.transitionFrames<=s.b-s.a,'Transition exceeds shot duration');
 if(s.camera?.fov!==undefined)need(Number.isFinite(s.camera.fov)&&s.camera.fov>1&&s.camera.fov<170,'Invalid camera fov');
 for(const who of Object.keys(s.actions??{}))need(characters.has(who),'Unknown actor '+who);
 for(const e of s.events??[])need(e.frame>=s.a&&e.frame<s.b&&(!e.who||characters.has(e.who)),'Invalid event in '+s.id);
 need(s.reviewFrames?.length>=Math.min(3,s.b-s.a)&&s.reviewFrames.every(f=>Number.isInteger(f)&&f>=s.a&&f<s.b),'Invalid review frames in '+s.id);
 }
 need(end===timeline.durationInFrames&&end>0,'Invalid total duration');
 if(scene.narration&&!/^https?:/.test(scene.narration))file(scene.narration);
 return errors;
}
