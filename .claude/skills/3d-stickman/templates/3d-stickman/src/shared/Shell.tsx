import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {CameraRig, W, H, type Cam} from './cam';

// Standard frame: 3D toon world (with optional DOF blur) + 2D cast overlay + flash + vignette + narration.
export const Shell: React.FC<{
	cam: Cam;
	sky: string;
	blur: number;
	world: React.ReactNode;
	cast: React.ReactNode;
	flash?: number;
	tint?: string; // feColorMatrix values for scene light on the cast
	audio?: string;
	w?: number;
	h?: number;
}> = ({cam, sky, blur, world, cast, flash = 0, tint = '1.02 0 0 0 0.01  0 0.97 0 0 0  0 0 0.9 0 0  0 0 0 1 0', audio, w = W, h = H}) => (
	<AbsoluteFill style={{background: sky}}>
		<AbsoluteFill style={{filter: blur ? `blur(${blur}px)` : undefined, transform: blur ? 'scale(1.012)' : undefined}}>
			<ThreeCanvas width={w} height={h} shadows gl={{antialias: true, alpha: true}} camera={{fov: 40, position: [0, 1.5, 9]}}>
				<CameraRig c={cam} />
				{world}
			</ThreeCanvas>
		</AbsoluteFill>
		<svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position: 'absolute', left: 0, top: 0}}>
			<defs>
				<filter id="scenelight" colorInterpolationFilters="sRGB">
					<feColorMatrix type="matrix" values={tint} />
				</filter>
			</defs>
			<g filter="url(#scenelight)">{cast}</g>
		</svg>
		<AbsoluteFill style={{background: '#fffaf0', opacity: flash}} />
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(30,20,60,0.22) 100%)'}} />
		{audio ? <Audio src={staticFile(audio)} /> : null}
	</AbsoluteFill>
);
export const flashAt = (f: number, at: number) => (f >= at - 2 && f < at + 4 ? [0.35, 0.9, 1, 0.8, 0.45, 0.15][f - (at - 2)] : 0);
