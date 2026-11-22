import {Composition} from 'remotion';
import {Short} from './Short';
import timeline from '../TIMELINE.json';
import scene from '../SCENE.json';
export const Root=()=> <Composition id="CartoonShort" component={Short} width={scene.width} height={scene.height} fps={timeline.fps} durationInFrames={timeline.durationInFrames}/>;
