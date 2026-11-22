import {AbsoluteFill,useCurrentFrame,useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Audio} from '@remotion/media';
import {staticFile} from 'remotion';
import {World} from './World';
import sceneData from '../SCENE.json';
import timelineData from '../TIMELINE.json';
import type {SceneSpec,Shot} from './types';
const scene=sceneData as unknown as SceneSpec,shots=timelineData.shots as unknown as Shot[];
export function Short(){const frame=useCurrentFrame(),{width,height,fps}=useVideoConfig();const index=shots.findIndex(s=>s.a<=frame&&s.b>frame);const shot=shots[index],previous=shots[index-1];if(!shot)throw new Error('Timeline gap at frame '+frame);
 const u=Math.min(1,(frame-shot.a)/(shot.transitionFrames??15));
 const layer=(s:Shot,prev:Shot|undefined,f:number)=><ThreeCanvas width={width} height={height} shadows camera={{fov:s.camera.fov??38,position:s.camera.position}} gl={{antialias:true,alpha:false}}><World spec={scene} shot={s} previous={prev} frame={f} fps={fps}/></ThreeCanvas>;
 return <AbsoluteFill style={{background:scene.background}}>
 {shot.transition==='dissolve'&&previous&&u<1?<AbsoluteFill>{layer(previous,shots[index-2],previous.b-1)}</AbsoluteFill>:null}
 <AbsoluteFill style={{opacity:shot.transition==='dissolve'&&previous?u:1}}>{layer(shot,previous,frame)}</AbsoluteFill>
 {scene.narration?<Audio name="Selected narration" src={/^https?:/.test(scene.narration)?scene.narration:staticFile(scene.narration)} premountFor={fps}/>:null}
 </AbsoluteFill>;
}
