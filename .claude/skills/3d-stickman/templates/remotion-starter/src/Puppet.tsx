import {useEffect,useLayoutEffect,useMemo} from 'react';
import {staticFile} from 'remotion';
import {useAsset} from './assets';
import * as THREE from 'three';
import type {Action,CharacterSpec,Rig} from './types';
function useRig(file?:string){return useAsset(file,async()=>{
 const dir=file!.slice(0,file!.lastIndexOf('/')+1);const response=await fetch(staticFile(file!));if(!response.ok)throw new Error(`Missing rig ${file}`);const rig:Rig=await response.json();
 const files=[...rig.layers.map(l=>l.file),...Object.values(rig.faces??{}).map(f=>f.file)];const images:Record<string,HTMLImageElement>={};
 await Promise.all(files.map(f=>new Promise<void>((resolve,reject)=>{const im=new Image();im.onload=()=>{images[f]=im;resolve();};im.onerror=()=>reject(new Error('Missing rig layer '+dir+f));im.src=staticFile(dir+f);})));return {rig,images};
});}
export function Puppet({spec,action,t}:{spec:CharacterSpec;action:Action;t:number}){
 const loaded=useRig(spec.rig),cv=useMemo(()=>{const c=document.createElement('canvas');c.width=768;c.height=1024;return c;},[]);
 const texture=useMemo(()=>{const tx=new THREE.CanvasTexture(cv);tx.colorSpace=THREE.SRGBColorSpace;return tx;},[cv]);useEffect(()=>()=>texture.dispose(),[texture]);
 const g=cv.getContext('2d',{willReadFrequently:true})!;g.clearRect(0,0,768,1024);
 if(loaded){const {rig,images}=loaded;const pad=.25,scale=Math.min(768/(rig.size[0]*(1+pad*2)),1024/(rig.size[1]*(1+pad*2)));g.save();g.translate((768-rig.size[0]*scale)/2,940-rig.feetY*scale);g.scale(scale,scale);
 const by=Object.fromEntries(rig.layers.map(l=>[l.id,l]));const face=action.face?rig.faces[action.face]:undefined;if(action.face&&!face)throw new Error('Unknown rig expression '+action.face);
 for(const layer of rig.layers){g.save();const chain:typeof rig.layers=[];let part:typeof layer|undefined=layer;const seen=new Set<string>();while(part){if(seen.has(part.id))throw new Error('Cyclic rig parent');seen.add(part.id);chain.unshift(part);part=part.parent?by[part.parent]:undefined;}
 for(const p of chain){g.translate(...p.pivot);g.rotate((action.angles?.[p.id]??0)*Math.PI/180);g.translate(-p.pivot[0],-p.pivot[1]);}
 g.drawImage(images[face?.layer===layer.id?face.file:layer.file],layer.box[0],layer.box[1],layer.box[2],layer.box[3]);g.restore();}g.restore();
 }else if(!spec.rig){
 const ink='#282132';g.strokeStyle=ink;g.fillStyle=ink;g.lineWidth=23;g.lineCap='round';g.lineJoin='round';
 const wave=action.kind==='wave'?Math.sin(t*7)*.4:0,walk=action.kind==='walk'?Math.sin(t*7):0,bob=Math.sin(t*2)*4;
 const line=(pts:number[][])=>{g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.stroke();};
 const limb=(x:number,y:number,a:number,b:number,len:number)=>{const ex=x+Math.sin(a)*len,ey=y+Math.cos(a)*len;line([[x,y],[ex,ey],[ex+Math.sin(a+b)*len,ey+Math.cos(a+b)*len]]);};
 limb(350,630,walk*.5,Math.max(0,-walk)*.7,135);limb(420,630,-walk*.5,Math.max(0,walk)*.7,135);
 g.fillStyle=spec.color??'#327a9e';g.beginPath();g.roundRect(307,375+bob,160,260,60);g.fill();g.stroke();
 limb(315,405+bob,-.3-walk*.3,.3,115);limb(460,405+bob,action.kind==='wave'?2.2+wave:.3+walk*.3,action.kind==='wave'?.5:-.3,115);
 g.fillStyle='#fff0d5';g.beginPath();g.ellipse(385,275+bob,105,112,0,0,Math.PI*2);g.fill();g.stroke();
 const blink=(t%3.1)>.14?1:.12;g.fillStyle=ink;for(const x of [352,420]){g.beginPath();g.ellipse(x,275+bob,8,13*blink,0,0,Math.PI*2);g.fill();}g.lineWidth=7;line([[365,323+bob],[385,330+bob],[407,320+bob]]);
 }
 texture.needsUpdate=true;
 useLayoutEffect(()=>{window.dispatchEvent(new Event('studio-assets-ready'));},[loaded]);
 // Alpha bounds include the complete pose, including hands and feet. Used by scene-aware QA.
 const pixels=g.getImageData(0,0,768,1024).data;let minX=768,minY=1024,maxX=0,maxY=0;
 for(let y=0;y<1024;y+=4)for(let x=0;x<768;x+=4)if(pixels[(y*768+x)*4+3]>50){minX=Math.min(minX,x);maxX=Math.max(maxX,x+4);minY=Math.min(minY,y);maxY=Math.max(maxY,y+4);}
 const height=spec.height*1024/780,width=height*.75;
 const hop=action.kind==='hop'?Math.sin(Math.min(1,t/.7)*Math.PI)*.4:0;
 const position=spec.position.map((v,i)=>v+(action.to? (action.to[i]-v)*Math.min(1,t/(action.over??1)):0)) as [number,number,number];position[1]+=hop;
 return <group position={position}>
 <mesh rotation={[-Math.PI/2,0,0]} position={[0,.01-hop,0]} scale={[.38,.18,1]}><circleGeometry args={[1,24]}/><meshBasicMaterial color="#273848" transparent opacity={.25} depthWrite={false}/></mesh>
 <sprite position={[0,0,0]} scale={[width,height,1]} center={[.5,1-940/1024]} userData={{qaSubject:spec.id,alphaBounds:[minX/768,minY/1024,maxX/768,maxY/1024]}}><spriteMaterial map={texture} transparent depthWrite={false}/></sprite>
 </group>;
}
