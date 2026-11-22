import React, {useMemo} from 'react';
import {useCurrentFrame, interpolate} from 'remotion';
import {Box, Cyl, Blob, planksTex, noiseTex, canvasTex, rng} from '../shared/Toon3D';
import {easeOut, mixCam, push, projector, depth, type Cam, type V} from '../shared/cam';
import {Person, type Look} from '../shared/Person';
import {Bird, Crab, Sparkle, Burst} from '../shared/Critters';
import {GLB} from '../shared/GLB';
import {Backdrop} from '../shared/Backdrop';
import {Shell} from '../shared/Shell';

const FULL = 367;
const T = {fry: 38, just: 83, gus: 102, pete: 147, lock: 197, blink: 221, crab: 252};
const ci = (f: number, a: number[], b: number[]) => interpolate(f, a, b, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const CROWD = (() => {
	const r = rng(91);
	const shirts = ['#d9534f', '#4a90c8', '#f0b84a', '#5cb85c', '#9b6bc8', '#f07aa0', '#3a8a8a'];
	return Array.from({length: 12}, (_, i) => ({
		x: -6 + i * 1.05 + r() * 0.5,
		z: -1.7 - r() * 0.8,
		dir: (r() > 0.5 ? 1 : -1) as 1 | -1,
		sp: 0.012 + r() * 0.01,
		look: {headwear: (['none', 'none', 'farmer', 'none', 'none', 'none', 'none', 'none', 'none', 'farmer', 'none', 'none'] as const)[i], hatColor: '#f2e2b0', outfit: {style: 'shirt' as const, main: shirts[i % shirts.length]}} as Look,
	}));
})();

const FRY: V = [0, 0, 0.6];
const GUS: V = [-0.3, 0, 0.62];
const PETE: V = [0.3, 0, 0.6];
const BENCH: V = [1.6, 0, -1.0];
const CRAB: V = [1.55, 0, -0.95];

const Boardwalk: React.FC<{f: number}> = ({f}) => {
	const tex = useMemo(() => ({
		deck: planksTex('#c8a070', '#6e4e34', '#e2bc88', 71, true, [14, 14]),
		sand: noiseTex('#ecc890', ['#f5d8a4', '#d8b07a', '#fbe4b8'], 72, [10, 10], 200, 6, 40, 0.3),
		sea: canvasTex(512, 512, (g, r) => {
			const gr = g.createLinearGradient(0, 0, 0, 512);
			gr.addColorStop(0, '#5a6fb8');
			gr.addColorStop(1, '#2f4f9a');
			g.fillStyle = gr;
			g.fillRect(0, 0, 512, 512);
			for (let i = 0; i < 260; i++) {
				g.fillStyle = r() > 0.6 ? '#ffd29a' : '#8aa6e0';
				g.globalAlpha = 0.6;
				g.fillRect(r() * 512, r() * 512, 10 + r() * 30, 2);
			}
		}, 73, [6, 6]),
		awning: canvasTex(256, 64, (g) => {
			for (let i = 0; i < 8; i++) {
				g.fillStyle = i % 2 ? '#f4efe6' : '#d8323a';
				g.fillRect(i * 32, 0, 32, 64);
			}
		}, 74, [1, 1]),
		wood: planksTex('#8a5a36', '#40281a', '#a8724a', 75),
	}), []);
	return (
		<group>
			{/* low golden sun behind-left: rim light + long shadows */}
			<directionalLight position={[-12, 5, -8]} intensity={3.6} color="#ffb36b" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-14} shadow-camera-right={14} shadow-camera-top={14} shadow-camera-bottom={-14} shadow-bias={-0.0006} />
			<directionalLight position={[6, 6, 10]} intensity={1.6} color="#ffd9b0" />
			<hemisphereLight args={['#ffd8a8', '#7a68b8', 1.0]} />
			<fog attach="fog" args={['#89627e', 40, 200]} />
			<Backdrop file="bg/fry.jpg" radius={420} horizon={-1.7} hFrac={0.41} yaw={0.25} />
			{/* deck */}
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 12]} receiveShadow>
				<planeGeometry args={[60, 30]} />
				<meshStandardMaterial map={tex.deck} roughness={0.95} />
			</mesh>
			{/* railing on the sea side */}
			{Array.from({length: 24}, (_, i) => -18 + i * 1.6).map((x) => <Box key={x} s={[0.1, 1.0, 0.1]} p={[x, 0.5, -2.8]} map={tex.wood} />)}
			<Box s={[40, 0.1, 0.12]} p={[0, 1.0, -2.8]} map={tex.wood} />
			<Box s={[40, 0.08, 0.08]} p={[0, 0.55, -2.8]} map={tex.wood} />
			{/* beach and sea below */}
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.6, -9]} receiveShadow>
				<planeGeometry args={[200, 12]} />
				<meshStandardMaterial map={tex.sand} roughness={1} />
			</mesh>
			{[[-6, -8, 0.3], [-1, -10, 1.4], [5, -8.5, 2.2], [10, -10, 0.9]].map(([x, z, ry], i) => (
				<GLB key={i} file="models/umbrella.glb" p={[x, -1.6, z]} r={[0, ry, 0]} height={2.4} ink={0.7} />
			))}
			{/* bench */}
			<GLB file="models/bench.glb" p={BENCH} height={1.0} fit={undefined} />
			{/* lamp posts */}
			{[-5, 5].map((x) => (
				<group key={x}>
					<GLB file="models/lamp.glb" p={[x, 0, -2.4]} height={3.6} ink={0.7} />
					<pointLight position={[x, 3.3, -2.1]} intensity={2.5} distance={6} decay={1.6} color="#ffd9a0" />
				</group>
			))}
			{/* fries kiosk */}
			<GLB file="models/kiosk.glb" p={[-4.4, 0, -1.4]} r={[0, 0.5, 0]} height={3.0} />
			{/* the last fry + empty cone */}
			<group position={FRY}>
				<Box s={[0.3, 0.045, 0.045]} p={[0, 0.025, 0]} r={[0, 0.3, 0]} color="#ffcf40" />
				<Box s={[0.035, 0.048, 0.048]} p={[0.14, 0.025, -0.045]} r={[0, 0.3, 0]} color="#d99a2a" ink={false} />
			</group>
			<group position={[-1.8, 0.0, 0.0]} rotation={[0, 0, Math.PI / 2.2]}>
				<Cyl p={[0, 0.16, 0]} rt={0.14} rb={0.02} h={0.32} color="#d8323a" seg={10} />
			</group>
			<Blob p={[12, -1.0, -6]} r={0.9} color="#7aa846" />
		</group>
	);
};

const C: Record<string, Cam> = {
	wideA: {pos: [0.3, 3.4, 10.5], look: [0, 0.7, -1.5], fov: 46, roll: 0},
	wideB: {pos: [0.2, 2.2, 7.4], look: [0, 0.4, 0], fov: 44, roll: 0},
	fry: {pos: [0.15, 0.2, 1.75], look: [0, 0.05, 0.6], fov: 34, roll: 2},
	just: {pos: [0.08, 0.14, 1.25], look: [0, 0.04, 0.6], fov: 34, roll: -3},
	two: {pos: [0.0, 0.45, 3.9], look: [0, 0.28, 0.6], fov: 36, roll: 0},
	lock: {pos: [0.0, 0.3, 3.3], look: [0, 0.27, 0.6], fov: 34, roll: 0},
	blink: {pos: [0.0, 0.32, 2.85], look: [0, 0.3, 0.6], fov: 34, roll: 4},
	crab: {pos: [1.25, 0.32, 0.6], look: [1.55, 0.18, -0.95], fov: 36, roll: -2},
};
const camAt = (f: number): Cam => {
	if (f < T.fry) return mixCam(C.wideA, C.wideB, easeOut(f / T.fry));
	if (f < T.just) return push(mixCam(C.wideB, C.fry, easeOut((f - T.fry) / 12)), Math.max(0, f - T.fry - 12) * 0.0015);
	if (f < T.gus) return mixCam(C.fry, C.just, easeOut((f - T.just) / 8));
	if (f < T.lock) return push(mixCam(C.just, C.two, easeOut((f - T.gus) / 12)), Math.max(0, f - T.gus - 12) * 0.0012);
	if (f < T.blink) return mixCam(C.two, C.lock, easeOut((f - T.lock) / 8));
	if (f < T.crab) return push(mixCam(C.lock, C.blink, easeOut((f - T.blink) / 6)), Math.max(0, f - T.blink - 6) * 0.002);
	return push(mixCam(C.blink, C.crab, easeOut((f - T.crab) / 10)), Math.max(0, f - T.crab - 10) * 0.0016);
};

export const FryTest: React.FC = () => {
	const f = useCurrentFrame();
	const c = camAt(f);
	const P = projector(c);
	const cast: {d: number; n: React.ReactNode}[] = [];
	const add = (p: V, n: React.ReactNode) => cast.push({d: depth(c, p), n});
	// crowd strolling in the background
	const showCrowd = f < T.fry + 4;
	if (showCrowd) CROWD.forEach((p, i) => {
		const pos: V = [p.x + p.dir * f * p.sp, 0, p.z];
		const q = P(pos);
		if (q.y > -200 && q.y < 2400) add(pos, <Person key={`c${i}`} x={q.x} y={q.y} h={q.ppm * 1.72} look={p.look} t={f} pose={{facing: p.dir, walk: f * 0.4 + i, eyes: i % 3 ? 'open' : 'lidded', mouth: 'dash', lookX: 0.8}} />);
	});
	// Gus lands from the left, Pete walks in from the right
	const gusIn = easeOut((f - T.gus) / 16);
	if (f >= T.gus) {
		const gp: V = [GUS[0] - (1 - gusIn) * 1.4, (1 - gusIn) * 0.9, GUS[2]];
		const g = P(gp);
		const angry = f >= T.lock;
		add(gp, <Bird key="gus" kind="gull" x={g.x} y={g.y} h={g.ppm * 0.42} facing={1} t={f} wing={gusIn < 1 ? 0.6 + 0.4 * Math.sin(f * 1.2) : 0} eyes={f >= T.blink ? 'wide' : angry ? 'angry' : 'open'} puff={angry ? 0.6 : 0} lean={angry ? 10 : 0} />);
	}
	if (f >= T.pete) {
		const u = easeOut((f - T.pete) / 22);
		const pp: V = [PETE[0] + (1 - u) * 1.2, 0, PETE[2]];
		const p = P(pp);
		const angry = f >= T.lock;
		add(pp, <Bird key="pete" kind="pigeon" x={p.x} y={p.y} h={p.ppm * 0.34} facing={-1} t={f} walk={u < 1 ? f * 0.8 : undefined} eyes={f >= T.blink ? 'wide' : angry ? 'angry' : 'open'} puff={angry ? 0.6 : 0} lean={angry ? 10 : 0} />);
	}
	// the fry glows
	const fp = P([FRY[0], 0.12, FRY[2]]);
	if (f >= T.fry && f < T.crab) add([FRY[0], 0, FRY[2] + 0.01], <Sparkle key="fs" x={fp.x} y={fp.y - fp.ppm * 0.05} s={(fp.ppm / 900) * (1.6 + Math.sin(f * 0.3) * 0.3)} o={ci(f, [T.fry, T.fry + 6], [0, 1])} rot={f * 3} />);
	if (f >= T.just && f < T.gus) add([0, 0, 9], <Burst key="jb" x={fp.x} y={fp.y - fp.ppm * 0.15} o={ci(f, [T.just, T.just + 3, T.just + 14], [0, 1, 0])} r={(fp.ppm / 900) * (60 + (f - T.just) * 4)} />);
	// crab under the bench
	if (f >= T.crab - 2) {
		const k = P(CRAB);
		const peek = ci(f, [278, 296], [0, 1]);
		add(CRAB, <Crab key="crab" x={k.x} y={k.y} h={k.ppm * 0.22} facing={-1} t={f} peek={peek} snap={f > 340 ? Math.abs(Math.sin(f * 0.5)) : 0} eyes="lidded" />);
	}
	cast.sort((a, b) => b.d - a.d);
	const blur = f < T.fry ? 0 : 2.8;
	return (
		<Shell cam={c} sky="linear-gradient(180deg,#5a6ac0 0%,#c97aa8 35%,#ffb27a 60%,#ffd9a0 72%)" blur={blur} world={<Boardwalk f={f} />} cast={cast.map((x) => x.n)} tint="1.05 0 0 0 0.03  0 0.95 0 0 0.01  0 0 0.84 0 0  0 0 0 1 0" audio="nar_fry.mp3" />
	);
};
export const FRY_FRAMES = FULL;
