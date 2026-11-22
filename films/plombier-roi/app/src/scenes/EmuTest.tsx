import React, {useMemo, useLayoutEffect, useRef} from 'react';
import * as THREE from 'three';
import {useCurrentFrame, interpolate} from 'remotion';
import {Box, Cyl, planksTex, noiseTex, canvasTex, rng} from '../shared/Toon3D';
import {easeOut, smoother, mixCam, push, projector, depth, type Cam, type V} from '../shared/cam';
import {Person, type Look} from '../shared/Person';
import {Emu, Burst, Dust, Sparkle} from '../shared/Critters';
import {Shell, flashAt} from '../shared/Shell';
import {GLB} from '../shared/GLB';
import {Backdrop} from '../shared/Backdrop';

const S2 = 94, S3 = 148, S4 = 213, FULL = 322;
const ci = (f: number, a: number[], b: number[]) => interpolate(f, a, b, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const SOLDIER: Look = {headwear: 'slouch', hatColor: '#b59a6a', skin: '#f6eee9', outfit: {style: 'uniform', main: '#8f8458', second: '#6a5a3a', trim: '#d8b04a'}, boots: '#3a2a20'};
const MAJOR: Look = {headwear: 'officer', hatColor: '#8a7f55', moustache: true, outfit: {style: 'uniform', main: '#7d7550', second: '#5a3a28', trim: '#e7c35a'}, boots: '#3a2a20'};

// field emus for the herd shot (deterministic)
const HERD = (() => {
	const r = rng(77);
	return Array.from({length: 26}, () => ({x: -11 + r() * 8, z: -3 - r() * 9, sp: 0.07 + r() * 0.04, ph: r() * 6, s: 0.92 + r() * 0.16}));
})();

const Wheat: React.FC = () => {
	const ref = useRef<THREE.InstancedMesh>(null);
	const N = 2600;
	useLayoutEffect(() => {
		const m = new THREE.Matrix4();
		const q = new THREE.Quaternion();
		const r = rng(31);
		const col = new THREE.Color();
		for (let i = 0; i < N; i++) {
			const x = -16 + r() * 22, z = -2.5 - r() * 26;
			const h = 0.75 + r() * 0.35;
			q.setFromEuler(new THREE.Euler((r() - 0.5) * 0.25, r() * 3, (r() - 0.5) * 0.25));
			m.compose(new THREE.Vector3(x, h / 2, z), q, new THREE.Vector3(1, h, 1));
			ref.current!.setMatrixAt(i, m);
			ref.current!.setColorAt(i, col.set(['#e8c35a', '#d9a940', '#f0d27a', '#c99a38'][i % 4]));
		}
		ref.current!.instanceMatrix.needsUpdate = true;
		if (ref.current!.instanceColor) ref.current!.instanceColor.needsUpdate = true;
	}, []);
	return (
		<instancedMesh ref={ref} args={[undefined, undefined, N]} castShadow receiveShadow>
			<coneGeometry args={[0.06, 1, 4]} />
			<meshStandardMaterial roughness={1} />
		</instancedMesh>
	);
};

const Truck: React.FC<{p: V; f: number}> = ({p}) => {
	return (
		<group position={p} rotation={[0, -0.3, 0]}>
			<GLB file="models/truck.glb" p={[0.4, 0, 0]} r={[0, Math.PI, 0]} fit={5.2} />
			{/* two Lewis guns on the bed: barrel + drum */}
			{[-0.45, 0.45].map((z, i) => (
				<group key={z} position={[-0.6 + i * 0.6, 1.25, z]} rotation={[0, 0, 0.25]}>
					<Cyl p={[0.45, 0.12, 0]} rt={0.06} rb={0.06} h={1.2} r={[0, 0, Math.PI / 2]} color="#2e2c30" seg={10} />
					<Cyl p={[0.2, 0.26, 0]} rt={0.2} rb={0.2} h={0.08} color="#3a383e" seg={14} />
					<Box s={[0.08, 0.3, 0.08]} p={[0.0, -0.08, 0]} color="#2e2c30" />
				</group>
			))}
		</group>
	);
};

const Bush: React.FC<{f: number}> = ({f}) => {
	const tex = useMemo(() => ({
		dirt: noiseTex('#c8784a', ['#b0623a', '#dc8c58', '#a9583a', '#e8a070'], 41, [14, 14], 260, 8, 60, 0.28),
		road: noiseTex('#dca478', ['#c88c60', '#eab88c'], 42, [1, 10], 120, 6, 30, 0.3),
		iron: canvasTex(256, 256, (g) => {
			for (let i = 0; i < 16; i++) {
				g.fillStyle = i % 2 ? '#b9bec4' : '#8e959c';
				g.fillRect(i * 16, 0, 16, 256);
			}
		}, 3, [2, 1]),
		weather: planksTex('#c9b8a0', '#7a6a58', '#e6d8c0', 51),
	}), []);
	const truckX = S4 <= f ? -8 + 8 * easeOut((f - S4) / 40) : -8;
	return (
		<group>
			<directionalLight position={[-10, 14, 6]} intensity={3.4} color="#ffe2b0" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-16} shadow-camera-right={16} shadow-camera-top={16} shadow-camera-bottom={-16} shadow-bias={-0.0006} />
			<hemisphereLight args={['#bcd8ff', '#8a6aa8', 0.55]} />
			<fog attach="fog" args={['#d3826a', 40, 240]} />
			<Backdrop file="bg/emu.jpg" radius={380} horizon={0} hFrac={0.43} />
			<mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
				<planeGeometry args={[500, 500]} />
				<meshStandardMaterial map={tex.dirt} roughness={1} />
			</mesh>
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 2.2]} receiveShadow>
				<planeGeometry args={[60, 2.2]} />
				<meshStandardMaterial map={tex.road} roughness={1} />
			</mesh>
			<Wheat />
			{/* wire fence along the road */}
			{Array.from({length: 16}, (_, i) => -14 + i * 2).map((x) => <Box key={x} s={[0.1, 1.1, 0.1]} p={[x, 0.55, -1.7]} color="#8a6a48" />)}
			{[0.5, 0.85].map((y) => <Box key={y} s={[30, 0.02, 0.02]} p={[1, y, -1.7]} color="#7c8288" ink={false} />)}
			{/* generated set dressing: homestead, windmill, hay, gums */}
			<GLB file="models/farmhouse_au.glb" p={[7.5, 0, -12]} r={[0, -0.35, 0]} fit={7} />
			<GLB file="models/windmill.glb" p={[-13, 0, -22]} r={[0, 0.4, 0]} height={8} />
			{[[-6.5, -5.5, 0.3], [-4.6, -6.4, 1.2], [4.2, -6, 2.1]].map(([x, z, ry], i) => (
				<GLB key={i} file="models/haybale.glb" p={[x, 0, z]} r={[0, ry, 0]} fit={1.5} />
			))}
			{[[-4, -24], [3, -20], [12, -26], [-15, -8]].map(([x, z], i) => (
				<GLB key={i} file="models/gumtree.glb" p={[x, 0, z]} r={[0, i * 1.3, 0]} height={7.2} ink={0.7} tint="#b9c9a0" />
			))}
			<Truck p={[truckX, 0, 2.3]} f={f} />
		</group>
	);
};

const HOOK_A: Cam = {pos: [0.3, 1.3, 6.4], look: [0.1, 1.2, 0], fov: 34, roll: 0};
const HOOK_B: Cam = {pos: [0.25, 1.3, 5.8], look: [0.1, 1.22, 0], fov: 34, roll: 0};
const LOST: Cam = {pos: [0.05, 1.45, 4.9], look: [-0.05, 1.45, 0], fov: 34, roll: -4};
const WIDE_A: Cam = {pos: [-3.5, 3.4, 9.5], look: [-3.5, 0.9, -8], fov: 52, roll: 0};
const WIDE_B: Cam = {pos: [-2.2, 3.1, 8.6], look: [-2.2, 0.9, -8], fov: 52, roll: 0};
const TRUCK: Cam = {pos: [1.6, 1.7, 15.5], look: [-0.35, 1.15, 3.6], fov: 42, roll: 2};

const camAt = (f: number): Cam => {
	if (f < S2) return mixCam(HOOK_A, HOOK_B, smoother(f / S2));
	if (f < S3) return push(mixCam(HOOK_B, LOST, easeOut((f - S2) / 9)), Math.max(0, f - S2 - 9) * 0.002);
	if (f < S4) return mixCam(WIDE_A, WIDE_B, smoother((f - S3) / (S4 - S3)));
	return push(mixCam(WIDE_B, TRUCK, easeOut((f - S4) / 16)), Math.max(0, f - S4 - 16) * 0.0016);
};

export const EmuTest: React.FC = () => {
	const f = useCurrentFrame();
	const c = camAt(f);
	const P = projector(c);
	const cast: {d: number; n: React.ReactNode}[] = [];
	const add = (p: V, n: React.ReactNode) => cast.push({d: depth(c, p), n});
	if (f < S3) {
		// soldier vs emu, nose to nose at the wheat edge
		const lost = f >= S2;
		const sp: V = [-0.55, 0, 0.2];
		const ep: V = [0.75, 0, 0.0];
		const s = P(sp), e = P(ep);
		add(sp, <Person key="sol" x={s.x} y={s.y} h={s.ppm * 1.78} look={SOLDIER} t={f} pose={{facing: 1, eyes: lost ? 'wide' : 'angry', mouth: lost ? 'frown' : 'dash', lookX: 1, hatPop: lost ? 140 * easeOut((f - S2) / 10) : 0, handR: !lost && f > 20 ? [70, -330] : undefined, armR: lost ? 4 : 14, armL: lost ? 4 : 12, lean: lost ? -3 : 2}} />);
		add(ep, <Emu key="emu" x={e.x} y={e.y} h={e.ppm * 1.85} facing={-1} t={f} eyes={lost ? 'lidded' : 'angry'} neck={lost ? -8 : Math.sin(f * 0.1) * 3} />);
		const hd = P([0.75, 2.0, 0]);
		add([0, 9, 0], <Burst key="b" x={hd.x} y={hd.y} o={ci(f, [S2, S2 + 3, S2 + 12], [0, 1, 0])} r={40 + (f - S2) * 3} />);
	} else if (f < S4) {
		HERD.forEach((h, i) => {
			const run = f >= 150;
			const x = h.x + (run ? (f - 150) * h.sp : 0);
			const p: V = [x, 0, h.z];
			const q = P(p);
			add(p, <Emu key={`h${i}`} x={q.x} y={q.y} h={q.ppm * 1.8 * h.s} facing={1} t={f} walk={run ? f * 0.55 + h.ph : undefined} neck={run ? 18 : 0} eyes="angry" />);
			if (run && i % 3 === 0) add([x - 0.6, 0, h.z + 0.01], <Dust key={`d${i}`} x={q.x - q.ppm * 0.7} y={q.y - q.ppm * 0.1} s={q.ppm / 260} o={0.7 + 0.3 * Math.sin(f * 0.5 + i)} />);
		});
	} else {
		const tx = -8 + 8 * easeOut((f - S4) / 40);
		const mj: V = [tx + 0.9, 0, 4.0];
		const m = P(mj);
		const majIn = f >= 228;
		if (majIn) add(mj, <Person key="maj" x={m.x} y={m.y} h={m.ppm * 1.76} look={MAJOR} t={f} pose={{facing: -1, eyes: 'lidded', mouth: 'dash', lookX: 0.6, handR: f > 236 ? [60, -330] : undefined, armL: 10, lean: 2}} />);
		[[-0.55, 3.9], [-1.6, 3.7]].forEach(([dx, dz], i) => {
			const sp: V = [tx + dx, 0, dz];
			const s = P(sp);
			const pop = easeOut((f - (258 + i * 4)) / 7);
			if (f >= 258 + i * 4) add(sp, <Person key={`s${i}`} x={s.x} y={s.y + (1 - pop) * 40} h={s.ppm * 1.72} look={SOLDIER} t={f} pose={{facing: -1, eyes: 'open', mouth: 'dash', lookX: 0.4, armL: 8, armR: 8}} />);
		});
		const g = P([tx - 0.6, 1.6, 2.3]);
		add([tx, 0, 2.3], <Sparkle key="g1" x={g.x} y={g.y} s={ci(f, [284, 290, 304], [0, 2.2, 0])} o={ci(f, [284, 290, 306], [0, 1, 0])} rot={f * 5} />);
		const mh = P([tx + 0.9, 2.0, 4.0]);
		if (majIn) add([0, 9, 0], <Burst key="mb" x={mh.x} y={mh.y} o={ci(f, [228, 231, 242], [0, 1, 0])} r={30 + (f - 228) * 2.5} />);
	}
	cast.sort((a, b) => b.d - a.d);
	const blur = f < S3 ? 2.8 : f < S4 ? 0 : 1.6 * easeOut((f - S4) / 16);
	return (
		<Shell cam={c} sky="linear-gradient(180deg,#2f78d6 0%,#7fb4ec 48%,#dfe9f2 70%)" blur={blur} world={<Bush f={f} />} cast={cast.map((x) => x.n)} flash={flashAt(f, S3)} tint="1.03 0 0 0 0.01  0 0.98 0 0 0  0 0 0.9 0 0  0 0 0 1 0" audio="nar_emu.mp3" />
	);
};
export const EMU_FRAMES = FULL;
