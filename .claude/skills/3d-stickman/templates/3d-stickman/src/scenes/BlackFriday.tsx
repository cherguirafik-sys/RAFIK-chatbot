import React, {useMemo} from 'react';
import {useCurrentFrame, interpolate} from 'remotion';
import {Box, noiseTex, canvasTex, rng} from '../shared/Toon3D';
import {easeOut, smoother, mixCam, push, projector, depth, type Cam, type V} from '../shared/cam';
import {Person, INK, Inked, type Look} from '../shared/Person';
import {Sparkle, Burst} from '../shared/Critters';
import {Shell, flashAt} from '../shared/Shell';
import {GLB} from '../shared/GLB';
import {Backdrop} from '../shared/Backdrop';

// 16:9, silent (the creator's own voice goes over it). 7.5 s.
export const BF_W = 1920, BF_H = 1080, BF_FRAMES = 225;
const T = {out: 24, flash: 118, cousins: 120};
const ci = (f: number, a: number[], b: number[]) => interpolate(f, a, b, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const Bag: React.FC<{c: string; s?: number; label?: string}> = ({c, s = 1}) => (
	<g transform={`scale(${s})`}>
		<path d="M-12,-2 C-12,-22 12,-22 12,-2" stroke={INK} strokeWidth={4} fill="none" />
		<Inked d="M-26,-2 h52 l-4,58 h-44 Z" fill={c} thin={1.8} heavy={2.4} />
		<path d="M-14,20 h28" stroke="#ffffff" strokeWidth={5} strokeLinecap="round" opacity={0.85} />
	</g>
);
const BoxGift: React.FC<{c: string; s?: number}> = ({c, s = 1}) => (
	<g transform={`scale(${s})`}>
		<Inked d="M-30,-4 h60 v50 h-60 Z" fill={c} thin={1.8} heavy={2.4} />
		<path d="M0,-4 v50 M-30,18 h60" stroke="#ffd34d" strokeWidth={6} />
	</g>
);

const FAMILY: {look: Look; h: number; x: number; z: number; bags: [string, string]}[] = [
	{look: {outfit: {style: 'shirt', main: '#3a7ad8'}}, h: 1.8, x: -0.9, z: 0.4, bags: ['#d8323a', '#f0b84a']},
	{look: {headwear: 'bun', hatColor: '#8a5a3a', outfit: {style: 'coat', main: '#c8487a', second: '#f4e2ea', trim: '#f0d080'}}, h: 1.7, x: 0.2, z: 0.2, bags: ['#5cb85c', '#9b6bc8']},
	{look: {outfit: {style: 'shirt', main: '#f0b84a'}}, h: 1.15, x: -0.3, z: 0.9, bags: ['#3aa8ff', '#f07aa0']},
	{look: {headwear: 'farmer', hatColor: '#3a3a4a', outfit: {style: 'shirt', main: '#5cb85c'}}, h: 1.25, x: 0.85, z: 0.85, bags: ['#d8323a', '#ffffff']},
	{look: {headwear: 'bun', hatColor: '#d8d8e0', outfit: {style: 'coat', main: '#8a6ab8', second: '#f4eef8', trim: '#e7c35a'}}, h: 1.6, x: 1.3, z: 0.1, bags: ['#f0b84a', '#3a7ad8']},
];
const COUSINS = (() => {
	const r = rng(12);
	const sw: [string, string][] = [['#c8323a', '#ffffff'], ['#2f7a4a', '#ffffff'], ['#3a5ad8', '#ffe066'], ['#8a2a3a', '#7ad8a0'], ['#2f7a4a', '#d8323a']];
	return Array.from({length: 16}, (_, i) => ({
		x: 2.6 + r() * 4.8,
		z: -0.6 + r() * 2.6,
		h: 1.25 + r() * 0.6,
		delay: Math.floor(r() * 26),
		hat: r() > 0.35,
		sw: sw[i % sw.length],
		gift: ['#d8323a', '#3a9a4a', '#f0b84a', '#3aa8ff'][i % 4],
	}));
})();

const Street: React.FC<{f: number}> = ({f}) => {
	const tex = useMemo(() => ({
		walk: noiseTex('#8a8aa0', ['#9a9ab2', '#7a7a92'], 91, [12, 4], 160, 6, 30, 0.25),
		brick: noiseTex('#6a3a5a', ['#7a4a6a', '#5a2a4a'], 92, [4, 2], 140, 8, 30, 0.3),
		banner: canvasTex(512, 128, (g) => {
			g.fillStyle = '#111018';
			g.fillRect(0, 0, 512, 128);
			g.font = 'bold 60px sans-serif';
			g.fillStyle = '#ffffff';
			g.textAlign = 'center';
			g.fillText('BLACK FRIDAY', 256, 92);
		}, 93),
		sale: canvasTex(256, 256, (g) => {
			g.fillStyle = '#e8263a';
			g.fillRect(0, 0, 256, 256);
			g.font = 'bold 84px sans-serif';
			g.fillStyle = '#ffffff';
			g.textAlign = 'center';
			g.fillText('SALE', 128, 110);
			g.font = 'bold 70px sans-serif';
			g.fillText('-70%', 128, 200);
		}, 94),
		window: canvasTex(256, 256, (g, r) => {
			g.fillStyle = '#ffd98a';
			g.fillRect(0, 0, 256, 256);
			for (let i = 0; i < 26; i++) {
				g.fillStyle = ['#e85a5a', '#5a8ae8', '#5ab86a', '#e8b84a', '#b86ae8'][i % 5];
				g.fillRect(10 + r() * 220, 140 + r() * 100, 20 + r() * 20, 30 + r() * 40);
			}
		}, 95),
	}), []);
	const xmas = ci(f, [T.cousins, T.cousins + 10], [0, 1]);
	const doorOpen = easeOut((f - 12) / 14);
	const treeS = easeOut((f - T.cousins - 6) / 14);
	return (
		<group>
			<directionalLight position={[-6, 8, 8]} intensity={1.3} color="#ffd8b0" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={10} shadow-camera-bottom={-10} shadow-bias={-0.0006} />
			<hemisphereLight args={['#6a6ad8', '#2a1a3a', 0.8]} />
			<pointLight position={[0, 2.4, -1.0]} intensity={24} distance={10} decay={1.5} color="#ffc27a" />
			<fog attach="fog" args={['#2a2050', 30, 90]} />
			<Backdrop file="bg/bf.jpg" center={[0, 8]} radius={66} horizon={9} hFrac={0.28} />
			<mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
				<planeGeometry args={[60, 30]} />
				<meshStandardMaterial map={tex.walk} roughness={0.8} />
			</mesh>
			{/* storefront */}
			<Box s={[26, 4.3, 1]} p={[0, 2.15, -2.2]} map={tex.brick} />
			<Box s={[26.4, 0.22, 1.3]} p={[0, 4.35, -2.2]} color="#3a2a44" />
			<Box s={[3.6, 2.4, 0.1]} p={[-3.4, 1.5, -1.65]} map={tex.window} />
			<Box s={[3.6, 2.4, 0.1]} p={[3.4, 1.5, -1.65]} map={tex.window} />
			{/* doorway: warm interior behind two sliding glass doors that open before the family walks out */}
			<Box s={[2.3, 2.7, 0.1]} p={[0, 1.35, -1.72]} color="#fff3c8" ink={false} />
			<Box s={[2.5, 0.12, 0.2]} p={[0, 2.72, -1.6]} color="#2a2a34" />
			<Box s={[0.12, 2.72, 0.2]} p={[-1.19, 1.36, -1.6]} color="#2a2a34" />
			<Box s={[0.12, 2.72, 0.2]} p={[1.19, 1.36, -1.6]} color="#2a2a34" />
			{[-1, 1].map((sd) => (
				<group key={sd} position={[sd * (0.55 + doorOpen * 1.0), 1.32, -1.55]}>
					<mesh>
						<boxGeometry args={[1.08, 2.6, 0.04]} />
						<meshStandardMaterial color="#cfe8ff" transparent opacity={0.35} roughness={0.1} />
					</mesh>
					<Box s={[1.08, 0.08, 0.06]} p={[0, 1.28, 0]} color="#2a2a34" />
					<Box s={[1.08, 0.08, 0.06]} p={[0, -1.28, 0]} color="#2a2a34" />
					<Box s={[0.06, 2.6, 0.06]} p={[sd * -0.51, 0, 0]} color="#2a2a34" />
					<Box s={[0.04, 0.5, 0.08]} p={[sd * -0.4, 0, 0.05]} color="#d8d8e0" />
				</group>
			))}
			<Box s={[6.4, 1.2, 0.14]} p={[0, 3.4, -1.6]} map={tex.banner} />
			{[-4.4, -2.4, 2.4, 4.4].map((x) => <Box key={x} s={[0.8, 0.8, 0.06]} p={[x, 1.7, -1.56]} map={tex.sale} />)}
			{/* lamp posts + shopping carts piled with gifts (generated models) */}
			{[-6, 6].map((x) => (
				<group key={x}>
					<GLB file="models/lamp.glb" p={[x, 0, 0.6]} height={3.6} ink={0.7} />
					<pointLight position={[x, 3.3, 0.9]} intensity={4} distance={7} decay={1.6} color="#ffd9a0" />
				</group>
			))}
			<GLB file="models/cart.glb" p={[-2.5, 0, -0.7]} r={[0, 0.5, 0]} height={1.5} />
			<GLB file="models/cart.glb" p={[2.6, 0, -0.9]} r={[0, -0.6, 0]} height={1.5} />
			<GLB file="models/car.glb" p={[-8.6, 0, 2.2]} r={[0, 0.1, 0]} fit={4.0} />
			{/* christmas: string lights + tree pop in with the cousins */}
			{Array.from({length: 26}, (_, i) => (
				<mesh key={i} position={[-6.5 + i * 0.52, 4.3 - Math.abs(Math.sin(i * 0.6)) * 0.3, -1.5]} scale={xmas}>
					<sphereGeometry args={[0.08, 8, 8]} />
					<meshBasicMaterial color={['#ff4a4a', '#4aff8a', '#ffe14a', '#4ab8ff'][i % 4]} />
				</mesh>
			))}
			{treeS > 0 ? (
				<group position={[6.6, 0, -0.6]} scale={treeS}>
					<GLB file="models/xmastree.glb" height={3.4} emissive={0.2} />
				</group>
			) : null}
		</group>
	);
};

const C: Record<string, Cam> = {
	a: {pos: [0, 1.5, 9.5], look: [0, 1.6, -1.5], fov: 34, roll: 0},
	b: {pos: [0.3, 1.45, 7.6], look: [0.1, 1.55, 0], fov: 34, roll: -2},
	c: {pos: [2.6, 1.7, 9.2], look: [2.6, 1.3, 0], fov: 38, roll: 0},
	d: {pos: [2.9, 1.9, 10.6], look: [2.9, 1.35, 0], fov: 38, roll: 2},
};
const camAt = (f: number): Cam => {
	if (f < T.flash) return push(mixCam(C.a, C.b, easeOut((f - T.out) / 40)), Math.max(0, f - 70) * 0.0012);
	return mixCam(C.c, C.d, smoother((f - T.flash) / (BF_FRAMES - T.flash)));
};

export const BlackFriday: React.FC = () => {
	const f = useCurrentFrame();
	const c = camAt(f);
	const P = (p: V) => projector(c, BF_W, BF_H)(p);
	const cast: {d: number; n: React.ReactNode}[] = [];
	const add = (p: V, n: React.ReactNode) => cast.push({d: depth(c, p), n});
	// family bursts out of the doors and marches toward the camera, arms full
	FAMILY.forEach((m, i) => {
		const start = T.out + i * 4;
		const u = easeOut((f - start) / 50);
		if (f < start || f >= T.cousins) return;
		const p: V = [m.x * u, 0, -1.4 + (m.z + 1.4) * u + Math.max(0, f - start - 50) * 0.004];
		const q = P(p);
		add(p, (
			<Person
				key={`fam${i}`}
				x={q.x}
				y={q.y}
				h={q.ppm * m.h}
				look={m.look}
				t={f}
				pose={{facing: i % 2 ? -1 : 1, walk: f * 0.45 + i, eyes: 'lidded', mouth: 'smile', lookX: 0.4, handR: [70, -170], handL: [-70, -170]}}
				holdR={<g transform="translate(0,6)">{i % 2 ? <BoxGift c={m.bags[0]} s={0.9} /> : <Bag c={m.bags[0]} />}</g>}
				holdL={<g transform="translate(0,6)"><Bag c={m.bags[1]} /></g>}
			/>
		));
	});
	if (f >= T.out + 30 && f < T.flash) {
		const sp = P([0.2, 2.3, 0.4]);
		add([0, 0, 50], <Sparkle key="s1" x={sp.x - 200} y={sp.y} s={ci(f, [T.out + 30, T.out + 36, T.out + 50], [0, 2, 0])} o={ci(f, [T.out + 30, T.out + 36, T.out + 52], [0, 1, 0])} rot={f * 5} />);
		add([0, 0, 50], <Sparkle key="s2" x={sp.x + 220} y={sp.y - 60} s={ci(f, [T.out + 44, T.out + 50, T.out + 64], [0, 2, 0])} o={ci(f, [T.out + 44, T.out + 50, T.out + 66], [0, 1, 0])} rot={-f * 5} />);
	}
	// "plus the cousins": a second wave in christmas sweaters and santa hats floods in from the right
	if (f >= T.cousins) {
		FAMILY.forEach((m, i) => {
			const p: V = [m.x, 0, m.z];
			const q = P(p);
			add(p, <Person key={`fam2${i}`} x={q.x} y={q.y} h={q.ppm * m.h} look={m.look} t={f} pose={{facing: -1, eyes: 'wide', mouth: 'o', lookX: 1, handR: [70, -170], handL: [-70, -170]}} holdR={<g transform="translate(0,6)"><Bag c={m.bags[0]} /></g>} holdL={<g transform="translate(0,6)"><Bag c={m.bags[1]} /></g>} />);
		});
		COUSINS.forEach((k, i) => {
			const st = T.cousins + 4 + k.delay;
			if (f < st) return;
			const u = easeOut((f - st) / 30);
			const p: V = [k.x + (1 - u) * 7, 0, k.z];
			const q = P(p);
			const look: Look = {headwear: k.hat ? 'santa' : 'none', hatColor: '#d8323a', outfit: {style: 'sweater', main: k.sw[0], second: k.sw[1], trim: '#ffd34d'}};
			add(p, <Person key={`cz${i}`} x={q.x} y={q.y} h={q.ppm * k.h} look={look} t={f} pose={{facing: -1, walk: u < 1 ? f * 0.6 + i : undefined, eyes: i % 3 ? 'open' : 'lidded', mouth: 'smile', lookX: 1, handR: [70, -170], handL: [-70, -170]}} holdR={<g transform="translate(0,6)"><BoxGift c={k.gift} s={0.85} /></g>} holdL={<g transform="translate(0,6)"><Bag c={k.sw[0]} s={0.9} /></g>} />);
		});
		const b = P([4.5, 2.6, 0.4]);
		add([0, 0, 60], <Burst key="cb" x={b.x} y={b.y} o={ci(f, [T.cousins + 4, T.cousins + 7, T.cousins + 18], [0, 1, 0])} r={60 + (f - T.cousins) * 3} color="#ff5a5a" />);
	}
	cast.sort((a, b2) => b2.d - a.d);
	const r = rng(5);
	const snow = f >= T.cousins ? Array.from({length: 90}, (_, i) => {
		const x = r() * BF_W, y = r() * BF_H, v = 2 + r() * 3, s = 3 + r() * 5;
		return <circle key={`sn${i}`} cx={(x + Math.sin(f * 0.05 + i) * 20) % BF_W} cy={(y + (f - T.cousins) * v) % BF_H} r={s} fill="#ffffff" opacity={0.85 * ci(f, [T.cousins, T.cousins + 10], [0, 1])} />;
	}) : [];
	return (
		<Shell w={BF_W} h={BF_H} cam={c} sky="linear-gradient(180deg,#1a1440 0%,#3a2a6a 60%,#5a3a7a 80%)" blur={f < T.flash ? 1.6 : 0} world={<Street f={f} />} cast={[...cast.map((x) => x.n), ...snow]} flash={flashAt(f, T.flash)} tint="1.02 0 0 0 0.02  0 0.95 0 0 0.0  0 0 0.95 0 0.03  0 0 0 1 0" />
	);
};
