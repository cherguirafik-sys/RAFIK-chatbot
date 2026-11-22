import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {GLB} from '../shared/GLB';
import {CameraRig} from '../shared/cam';
export const SHEET_NAMES = ['truck','gumtree','farmhouse_au','haybale','windmill','bench','kiosk','lamp','umbrella','cottage','mailbox','busstop'];
export const ModelSheet: React.FC<{names?: string[]}> = ({names = SHEET_NAMES}) => (
	<AbsoluteFill style={{background: '#8aa0c8'}}>
		<ThreeCanvas width={1600} height={1200} shadows gl={{antialias: true}}>
			<CameraRig c={{pos: [0, 9, 26], look: [0, 0, 0], fov: 40, roll: 0}} />
			<directionalLight position={[-6, 10, 8]} intensity={2.4} color="#fff0d8" />
			<hemisphereLight args={['#dfe8ff', '#7a68a8', 0.8]} />
			{names.map((n, i) => {
				const c = i % 5, r = Math.floor(i / 5);
				return <GLB key={n} file={`models/${n}.glb`} p={[(c - 2) * 5, 0, (r - 1.5) * 5]} fit={3.6} />;
			})}
		</ThreeCanvas>
	</AbsoluteFill>
);
