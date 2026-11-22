import {useEffect,useLayoutEffect,useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import {staticFile} from 'remotion';
import {useAsset} from './assets';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {Puppet} from './Puppet';
import {probeScene} from './qa';
import type {Prop,SceneSpec,Shot,V} from './types';
const smooth=(v:number)=>{const t=Math.max(0,Math.min(1,v));return t*t*(3-2*t);};
const lerpV=(a:V,b:V,t:number)=>a.map((x,i)=>x+(b[i]-x)*t) as V;
function useTexture(file?:string){const tx=useAsset(file,()=>new Promise<THREE.Texture>((resolve,reject)=>new THREE.TextureLoader().load(staticFile(file!),v=>{v.colorSpace=THREE.SRGBColorSpace;resolve(v);},undefined,reject)));useEffect(()=>()=>tx?.dispose(),[tx]);return tx;}
function Model({file,size}:{file:string;size:V}){const model=useAsset(file,()=>new Promise<THREE.Group>((resolve,reject)=>new GLTFLoader().load(staticFile(file),g=>{const box=new THREE.Box3().setFromObject(g.scene),factor=size[1]/Math.max(.001,box.max.y-box.min.y);g.scene.scale.setScalar(factor);g.scene.position.set(-(box.min.x+box.max.x)/2*factor,-box.min.y*factor,-(box.min.z+box.max.z)/2*factor);g.scene.traverse(o=>{o.castShadow=true;o.receiveShadow=true;});resolve(g.scene);},undefined,reject)));return model?<primitive object={model}/>:null;}
function SetProp({prop}:{prop:Prop}){const tx=useTexture(prop.texture??(prop.type==='image'?prop.file:undefined));return <group position={prop.position} rotation={prop.rotation??[0,0,0]} userData={{qaObstacle:prop.id}}>
 {prop.type==='model'?<Model file={prop.file!} size={prop.size}/>:<mesh castShadow receiveShadow>
 {prop.type==='cylinder'?<cylinderGeometry args={[prop.size[0],prop.size[0],prop.size[1],20]}/>:prop.type==='image'?<planeGeometry args={[prop.size[0],prop.size[1]]}/>:<boxGeometry args={prop.size}/>}
 <meshStandardMaterial color={prop.color??'#ffffff'} map={tx} roughness={.9} transparent={prop.type==='image'} side={THREE.DoubleSide}/>
 </mesh>}
 </group>;}
function Ground({color,texture}:{color:string;texture?:string}){const tx=useTexture(texture);useMemo(()=>{if(tx){tx.wrapS=tx.wrapT=THREE.RepeatWrapping;tx.repeat.set(10,10);}},[tx]);return <mesh rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[80,80]}/><meshStandardMaterial color={color} map={tx} roughness={1}/></mesh>;}
function Backdrop({file}:{file:string}){const tx=useTexture(file);return <mesh position={[0,6,-20]}><planeGeometry args={[60,20]}/><meshBasicMaterial map={tx} transparent/></mesh>;}
function Probe({frame,shot}:{frame:number;shot:string}){const {scene,camera}=useThree();useLayoutEffect(()=>{const probe=()=>{if(process.env.STUDIO_QA==='1')console.log('STUDIO_QA:'+JSON.stringify({frame,shot,flags:probeScene(scene,camera)}));};probe();window.addEventListener('studio-assets-ready',probe);return()=>window.removeEventListener('studio-assets-ready',probe);},[frame,shot,scene,camera]);return null;}
export function World({spec,shot,previous,frame,fps}:{spec:SceneSpec;shot:Shot;previous?:Shot;frame:number;fps:number}){
 const {camera}=useThree();const progress=smooth((frame-shot.a)/Math.max(1,shot.b-shot.a-1));
 let pos=lerpV(shot.camera.position,shot.camera.endPosition??shot.camera.position,progress),look=lerpV(shot.camera.lookAt,shot.camera.endLookAt??shot.camera.lookAt,progress);
 const blend=shot.transition==='glide'&&previous?smooth((frame-shot.a)/(shot.transitionFrames??15)):1;
 if(previous&&blend<1){pos=lerpV(previous.camera.endPosition??previous.camera.position,pos,blend);look=lerpV(previous.camera.endLookAt??previous.camera.lookAt,look,blend);}
 camera.position.set(...pos);camera.lookAt(...look);(camera as THREE.PerspectiveCamera).fov=shot.camera.fov??38;camera.updateProjectionMatrix();
 const mood=spec.moods[shot.mood],prior=previous?spec.moods[previous.mood]:mood;
 const environment=spec.environments.find(e=>e.id===shot.environment);if(!environment||!mood)throw new Error('Unknown environment or mood in '+shot.id);
 const sunColor=new THREE.Color(prior.sunColor).lerp(new THREE.Color(mood.sunColor),blend);const background=new THREE.Color(prior.background).lerp(new THREE.Color(mood.background),blend);
 return <>
 <color attach="background" args={[background]}/><ambientLight intensity={prior.ambient+(mood.ambient-prior.ambient)*blend}/>
 <directionalLight position={lerpV(prior.position,mood.position,blend)} intensity={prior.sun+(mood.sun-prior.sun)*blend} color={sunColor} castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-10} shadow-bias={-.001}/>
 <Ground color={environment.ground} texture={environment.groundTexture}/>{environment.backdrop?<Backdrop file={environment.backdrop}/>:null}
 {environment.props.map(p=><SetProp key={p.id} prop={p}/>)}
 {spec.characters.filter(c=>shot.actions[c.id]).map(c=>{const events=shot.events.filter(e=>e.who===c.id&&e.frame<=frame).sort((a,b)=>a.frame-b.frame);let action={...shot.actions[c.id],angles:{...shot.actions[c.id].angles}};let actionStart=shot.a;
 for(const event of events){const u=smooth((frame-event.frame)/Math.max(1,(event.ease??.3)*fps));const angles={...action.angles};for(const [joint,value] of Object.entries(event.angles??{}))angles[joint]=(angles[joint]??0)+(value-(angles[joint]??0))*u;action={...action,kind:event.kind??action.kind,face:event.face??action.face,angles};if(event.kind)actionStart=event.frame;}
 return <Puppet key={c.id} spec={c} action={action} t={(frame-actionStart)/fps}/>;})}
 <Probe frame={frame} shot={shot.id}/>
 </>;
}
