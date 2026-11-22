import React, {useMemo} from 'react';
import {useCurrentFrame, interpolate} from 'remotion';
import {Box, noiseTex, planksTex, rng} from '../shared/Toon3D';
import {easeOut, smoother, mixCam, push, projector, depth, type Cam, type V} from '../shared/cam';
import {INK, Inked} from '../shared/Person';
import {Snowman} from '../shared/Toys';
import {Sparkle, Burst} from '../shared/Critters';
import {GLB} from '../shared/GLB';
import {Backdrop} from '../shared/Backdrop';
import {Shell, flashAt} from '../shared/Shell';

const T = {suitcase: 82, shades: 100, plan: 126, problem: 160, hill: 186, end: 266};
const ci = (f: number, a: number[], b: number[]) => interpolate(f, a, b, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
const FRANK: V = [0, 0, 0];
const EDGE: V = [0.05, 0, 1.75];

const Pine: React.FC<{p: V; s?: number}> = ({p, s = 1}) => (
	<GLB file="models/pine.glb" p={p} r={[0, (p[0] * 1.7 + p[2]) % 6, 0]} height={3.4 * s} ink={0.7} />
);

const Hill: React.FC<{f: number}> = () => {
	const tex = useMemo(() => ({
		snow: noiseTex('#eef3fb', ['#dfe7f6', '#ffffff', '#d4def2'], 61, [12, 12], 200, 10, 70, 0.35),
		wall: planksTex('#6f9bd1', '#3e5f8e', '#8fb4e0', 62),
		roof: noiseTex('#f6f9ff', ['#e2e9f6', '#ffffff'], 63, [2, 2], 60, 10, 40, 0.3),
	}), []);
	const slope = Math.atan2(22, 40);
	const len = Math.hypot(22, 40);
	return (
		<group>
			<directionalLight position={[-8, 10, -4]} intensity={2.4} color="#ffe0b8" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12} shadow-bias={-0.0006} />
			<hemisphereLight args={['#cfe2ff', '#6a74c8', 0.9]} />
			<fog attach="fog" args={['#cfdcf2', 30, 140]} />
			<Backdrop file="bg/snow.jpg" center={[0, 30]} radius={120} horizon={-25} hFrac={0.3} yaw={Math.PI} />
			{/* hilltop plateau */}
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -18]} receiveShadow>
				<planeGeometry args={[80, 40]} />
				<meshStandardMaterial map={tex.snow} roughness={1} />
			</mesh>
			{/* the very steep slope down to town */}
			<mesh rotation={[-Math.PI / 2 + slope, 0, 0]} position={[0, -11, 2 + 20]} receiveShadow>
				<planeGeometry args={[80, len]} />
				<meshStandardMaterial map={tex.snow} color="#b9c8ee" roughness={1} />
			</mesh>
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -22, 50]} receiveShadow>
				<planeGeometry args={[160, 20]} />
				<meshStandardMaterial map={tex.snow} color="#e6ecf8" roughness={1} />
			</mesh>
			{/* house */}
			<GLB file="models/cottage.glb" p={[-2.4, 0, -5]} fit={5.2} />
			{/* picket fence */}
			{Array.from({length: 18}, (_, i) => -6 + i * 0.5).map((x) => <Box key={x} s={[0.1, 0.7, 0.05]} p={[x, 0.35, -2.4]} color="#ffffff" />)}
			<Box s={[9, 0.08, 0.05]} p={[-1.75, 0.5, -2.4]} color="#ffffff" />
			{/* mailbox */}
			<GLB file="models/mailbox.glb" p={[2.2, 0, -1.6]} r={[0, -0.3, 0]} height={1.3} />
			<Pine p={[3.6, 0, -4]} s={1.2} />
			<Pine p={[-6, 0, -3]} />
			<Pine p={[5.5, 0, -7]} s={1.4} />
			<Pine p={[-4.5, 0, 1.0]} s={0.9} />
			{/* crest edge ink + ski tracks down the slope */}
			<Box s={[80, 0.04, 0.04]} p={[0, 0.0, 2]} color="#2a2440" ink={false} />
			{[-0.6, 0.6].map((x) => <Box key={x} s={[0.08, 0.01, len]} p={[x + 1, -11.0, 22]} r={[slope, 0, 0]} color="#8a9ad8" ink={false} />)}
			{/* pines down the slope so its steepness reads */}
			{[[-5, 8], [4, 11], [-2.5, 16], [6, 20], [-6, 24], [2.5, 28], [-3.5, 33], [5, 36]].map(([x, z], i) => (
				<Pine key={`sp${i}`} p={[x, -((z - 2) * 22) / 40, z]} s={1.3} />
			))}
			{/* pine row along the valley floor hides the join with the painted valley */}
			{Array.from({length: 18}, (_, i) => -26 + i * 3.1).map((x, i) => (
				<Pine key={`vr${i}`} p={[x, -22, 55 + ((i * 7) % 5)]} s={1.6 + (i % 3) * 0.3} />
			))}
			{/* bus stop at the bottom (the town is in the painted backdrop) */}
			<GLB file="models/busstop.glb" p={[1.5, -22, 42]} r={[0, Math.PI, 0]} height={2.6} />
		</group>
	);
};

const C: Record<string, Cam> = {
	hookA: {pos: [0.3, 1.5, 6.2], look: [0, 1.0, -1], fov: 40, roll: 0},
	hookB: {pos: [0.25, 1.3, 4.8], look: [0, 1.0, -0.5], fov: 40, roll: 0},
	props: {pos: [0.6, 1.25, 3.4], look: [0, 1.15, 0], fov: 36, roll: -2},
	problem: {pos: [0.2, 1.3, 3.0], look: [0.05, 1.2, 0], fov: 34, roll: 3},
	hillA: {pos: [0.3, 4.0, -0.9], look: [0.0, -8, 18], fov: 52, roll: 0},
	hillB: {pos: [0.25, 3.95, -0.85], look: [0.1, -12, 28], fov: 50, roll: -3},
};
const camAt = (f: number): Cam => {
	if (f < T.suitcase) return mixCam(C.hookA, C.hookB, smoother(f / T.suitcase));
	if (f < T.problem) return push(mixCam(C.hookB, C.props, easeOut((f - T.suitcase) / 12)), Math.max(0, f - T.suitcase - 12) * 0.0012);
	if (f < T.hill) return push(mixCam(C.props, C.problem, easeOut((f - T.problem) / 8)), Math.max(0, f - T.problem - 8) * 0.002);
	return mixCam(C.hillA, C.hillB, smoother((f - T.hill) / 80));
};

const Suitcase: React.FC<{s: number}> = ({s}) => (
	<g transform={`scale(${s})`}>
		<path d="M-14,-6 v-12 h28 v12" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
		<Inked d="M-46,-6 h92 v66 h-92 Z" fill="#c8724a" thin={2} heavy={3} />
		<path d="M-46,20 h92 M-18,-6 v66 M18,-6 v66" stroke="#8a4a2a" strokeWidth={4} />
		<circle cx={-30} cy={40} r={8} fill="#f0b84a" stroke={INK} strokeWidth={2} />
		<rect x={8} y={30} width={26} height={16} rx={3} fill="#5cb8e8" stroke={INK} strokeWidth={2} />
	</g>
);
const PlanBubble: React.FC<{x: number; y: number; s: number; o: number}> = ({x, y, s, o}) => (
	<g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
		<circle cx={-58} cy={92} r={8} fill="#fffdfb" stroke={INK} strokeWidth={3} />
		<circle cx={-36} cy={64} r={13} fill="#fffdfb" stroke={INK} strokeWidth={3} />
		<path d="M-90,0 C-100,-40 -60,-70 -20,-60 C0,-90 60,-90 76,-58 C118,-62 128,-10 100,10 C112,46 66,64 40,46 C14,70 -40,66 -50,40 C-90,50 -112,20 -90,0 Z" fill="#fffdfb" stroke={INK} strokeWidth={3.5} />
		<path d="M-60,30 C-30,18 30,18 70,30 L70,40 L-60,40 Z" fill="#7ec8f0" />
		<path d="M-50,30 C-20,22 20,22 60,30" stroke="#f0d28a" strokeWidth={8} fill="none" />
		<circle cx={50} cy={-30} r={16} fill="#ffd34d" stroke={INK} strokeWidth={3} />
		<path d="M-20,28 C-22,0 -18,-20 -10,-34" stroke="#8a5a36" strokeWidth={7} fill="none" strokeLinecap="round" />
		<path d="M-10,-34 c-20,-6 -36,2 -40,12 M-10,-34 c20,-8 34,0 38,10 M-10,-34 c-6,-16 4,-26 16,-26" stroke="#3a9a4a" strokeWidth={9} fill="none" strokeLinecap="round" />
	</g>
);

export const SnowTest: React.FC = () => {
	const f = useCurrentFrame();
	const c = camAt(f);
	const P = projector(c);
	const cast: {d: number; n: React.ReactNode}[] = [];
	const add = (p: V, n: React.ReactNode) => cast.push({d: depth(c, p), n});
	const atEdge = f >= T.hill;
	const pos: V = atEdge ? EDGE : FRANK;
	const fp = P(pos);
	const hasCase = f >= T.suitcase;
	const caseS = easeOut((f - T.suitcase) / 8);
	const shades = ci(f, [T.shades, T.shades + 8], [0, 1]);
	const worried = f >= T.problem;
	add(pos, (
		<Snowman
			key="frank"
			x={fp.x}
			y={fp.y}
			h={fp.ppm * 1.55}
			facing={1}
			t={f}
			eyes={worried ? 'wide' : f < T.suitcase ? 'lidded' : 'open'}
			mouth={atEdge ? 'wobble' : worried ? 'o' : 'smile'}
			shades={worried ? 1 - ci(f, [T.problem, T.problem + 6], [0, 1]) * 0.0 : shades}
			hop={!worried ? Math.max(0, Math.sin(f * 0.22)) * fp.ppm * 0.05 : 0}
			armL={hasCase ? 30 : 40}
			armR={hasCase ? 20 : 40}
			holdR={hasCase ? <g transform="translate(0,6)"><Suitcase s={0.55 * caseS} /></g> : undefined}
			tilt={atEdge ? -4 + Math.sin(f * 0.6) * 2 : 0}
			look={atEdge ? 1 : 0.6}
		/>
	));
	if (f >= T.suitcase && f < T.shades + 10) add([0, 0, 9], <Sparkle key="sc" x={fp.x + fp.ppm * 0.45} y={fp.y - fp.ppm * 0.5} s={ci(f, [T.suitcase, T.suitcase + 5, T.suitcase + 18], [0, 2.2, 0])} o={ci(f, [T.suitcase, T.suitcase + 5, T.suitcase + 20], [0, 1, 0])} rot={f * 5} />);
	if (f >= T.plan && f < T.problem + 4) {
		const hd = P([pos[0] - 0.35, 1.7, pos[2]]);
		add([0, 0, 9], <PlanBubble key="pb" x={hd.x} y={hd.y} s={(hd.ppm / 330) * (0.6 + 0.4 * easeOut((f - T.plan) / 7))} o={ci(f, [T.plan, T.plan + 5, T.problem - 2, T.problem + 3], [0, 1, 1, 0])} />);
	}
	if (f >= T.problem && f < T.hill) {
		const hd = P([pos[0], 1.75, pos[2]]);
		add([0, 0, 9], <Burst key="pr" x={hd.x} y={hd.y} o={ci(f, [T.problem, T.problem + 3, T.problem + 14], [0, 1, 0])} r={50 + (f - T.problem) * 3} />);
	}
	// falling snow
	const r = rng(3);
	const flakes = Array.from({length: 70}, () => ({x: r() * 1080, y: r() * 1920, s: 3 + r() * 6, v: 2 + r() * 3, w: r() * 6}));
	cast.sort((a, b) => b.d - a.d);
	const snow = flakes.map((fl, i) => <circle key={`fl${i}`} cx={(fl.x + Math.sin(f * 0.05 + fl.w) * 20) % 1080} cy={(fl.y + f * fl.v) % 1920} r={fl.s} fill="#ffffff" opacity={0.85} />);
	const blur = atEdge ? 0 : f < T.suitcase ? 1.2 : 2.6;
	return <Shell cam={c} sky="linear-gradient(180deg,#7fa8e6 0%,#b8d0f2 45%,#e6eefa 70%)" blur={blur} world={<Hill f={f} />} cast={[...cast.map((x) => x.n), ...snow]} flash={flashAt(f, T.hill)} tint="1.0 0 0 0 0.0  0 1.0 0 0 0.01  0 0 1.03 0 0.02  0 0 0 1 0" audio="nar_snow.mp3" />;
};
export const SNOW_FRAMES = T.end;
