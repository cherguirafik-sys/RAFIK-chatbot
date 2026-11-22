import React, {useMemo} from 'react';
import {useCurrentFrame, interpolate} from 'remotion';
import {Box, Cyl, Blob, Window, noiseTex, planksTex, canvasTex, rng} from '../shared/Toon3D';
import {easeOut, smoother, mixCam, push, projector, depth, type Cam, type V} from '../shared/cam';
import {Person, INK, Inked, Vinyl, tone, type Look} from '../shared/Person';
import {Cat} from '../shared/Toys';
import {Sparkle, Burst, Question} from '../shared/Critters';
import {GLB} from '../shared/GLB';
import {Backdrop} from '../shared/Backdrop';
import {Shell, flashAt} from '../shared/Shell';

// PROVISIONAL timing (no narration yet): ~3.7 words/s estimate on SCRIPT_TEST.md.
// S1 "Marc est venu réparer un robinet,"                          0-66   exterior, arrives
// S2 "et il est reparti avec une couronne en carton sur la tête." 66-138  exterior, leaves crowned
// S3 "En entrant, il s'est mis à genoux pour ouvrir sa caisse..." 138-234 interior wide, kneels
// S4 "Tu vois, pour un chien et deux enfants, ... on joue !"     234-364 interior close, play
// S5 "Le robinet, lui, fuit toujours."                            364-430 sink close-up
export const T = {s2: 66, s3: 138, s4: 234, dog: 250, kids: 286, play: 334, s5: 364, end: 430};
const ci = (f: number, a: number[], b: number[]) => interpolate(f, a, b, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const MARC: Look = {moustache: true, skin: '#f6ece6', outfit: {style: 'overalls', main: '#3a6fc0', second: '#e05a3a', trim: '#f0c040'}, boots: '#3a2a20'};
const BOY: Look = {skin: '#f3e2d6', outfit: {style: 'shirt', main: '#f2b84a'}, boots: '#2a6a8a'};
const GIRL: Look = {skin: '#f6ece6', headwear: 'bun', hatColor: '#7a4a2e', outfit: {style: 'shirt', main: '#e86a9a'}, boots: '#7a3a8a'};

// ---------- 2D props (cast layer) ----------
const Toolbox: React.FC<{s: number; open?: number}> = ({s, open = 0}) => (
	<g transform={`scale(${s})`}>
		<Inked d="M-48,-52 h96 v52 h-96 Z" fill="#d8403a" thin={2} heavy={3} />
		<path d="M-48,-30 h96" stroke="#9a2a26" strokeWidth={4} />
		<rect x={-8} y={-36} width={16} height={10} rx={2} fill="#f0c040" stroke={INK} strokeWidth={2} />
		{open > 0 ? (
			<g>
				<path d="M-30,-52 l10,-26 M-6,-52 l4,-30 M16,-52 l14,-22" stroke="#9aa4b0" strokeWidth={7} strokeLinecap="round" />
				<path d="M-30,-52 l10,-26 M-6,-52 l4,-30 M16,-52 l14,-22" stroke={INK} strokeWidth={2} strokeLinecap="round" opacity={0.6} />
			</g>
		) : null}
		<g transform={`rotate(${-open * 110},-48,-52)`}>
			<Inked d="M-50,-64 h100 v12 h-100 Z" fill="#e8564e" thin={1.8} heavy={2.4} />
			<path d="M-16,-64 v-12 h32 v12" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
		</g>
	</g>
);

const Crown: React.FC<{x: number; y: number; s: number; f: 1 | -1; pop?: number}> = ({x, y, s, f, pop = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s * f * pop},${s * pop})`}>
		<Inked d="M-54,0 L-58,-46 L-32,-22 L-12,-58 L6,-22 L30,-56 L40,-20 L60,-44 L56,0 C30,6 -28,6 -54,0 Z" fill="#f6c94a" thin={2} heavy={3} />
		<path d="M-52,-8 C-26,-2 28,-2 54,-8" stroke="#c8902a" strokeWidth={4} fill="none" />
		{[-32, 6, 40].map((cx) => <circle key={cx} cx={cx} cy={-12} r={5} fill="#e8403a" stroke={INK} strokeWidth={1.6} />)}
	</g>
);

// DOG: bean body, round head, floppy ears, stick legs. Native height 170, facing right.
const Dog: React.FC<{x: number; y: number; h: number; facing?: 1 | -1; t: number; bow?: number; hop?: number; eyes?: 'open' | 'wide' | 'closed'; tongue?: boolean}> = ({x, y, h, facing = 1, t, bow = 0, hop = 0, eyes = 'open', tongue = false}) => {
	const id = useMemo(() => `dog${Math.round(x * 7 + y)}`, [x, y]);
	const s = h / 170;
	const col = '#d99a5a';
	const wag = Math.sin(t * (0.5 + bow * 0.4)) * (14 + bow * 10);
	const tilt = -bow * 16; // front goes down in a play bow
	return (
		<g transform={`translate(${x},${y - hop}) scale(${s * facing},${s})`}>
			<defs>
				<Vinyl id={`${id}b`} light={tone(col, 1.35)} mid={col} shade={tone(col, 0.6)} />
				<radialGradient id={`${id}sh`}>
					<stop offset="0" stopColor="#1d1430" stopOpacity="0.38" />
					<stop offset="1" stopColor="#1d1430" stopOpacity="0" />
				</radialGradient>
			</defs>
			<ellipse cx={4} cy={hop + 2} rx={80} ry={11} fill={`url(#${id}sh)`} />
			<g transform={`rotate(${tilt},-50,-62)`}>
				{/* legs (back pair stays planted, front pair folds in the bow) */}
				<path d={`M-44,-50 L-50,${-2 + hop * 0}`} stroke={INK} strokeWidth={6} strokeLinecap="round" />
				<path d={`M-28,-50 L-24,-2`} stroke={INK} strokeWidth={6} strokeLinecap="round" />
				<path d={`M30,-50 L${36 + bow * 22},${-2 - bow * 26}`} stroke={INK} strokeWidth={6} strokeLinecap="round" />
				<path d={`M46,-50 L${54 + bow * 24},${-2 - bow * 28}`} stroke={INK} strokeWidth={6} strokeLinecap="round" />
				{/* tail */}
				<path d={`M-62,-80 q-18,-14 ${-10 + wag * 0.3},${-36 - bow * 8}`} stroke={INK} strokeWidth={13} fill="none" strokeLinecap="round" />
				<path d={`M-62,-80 q-18,-14 ${-10 + wag * 0.3},${-36 - bow * 8}`} stroke={col} strokeWidth={7} fill="none" strokeLinecap="round" />
				<Inked d="M-70,-74 C-72,-104 -40,-112 0,-110 C40,-110 66,-102 64,-74 C62,-48 36,-44 0,-44 C-40,-44 -68,-48 -70,-74 Z" fill={`url(#${id}b)`} />
				<path d="M-20,-108 C-6,-96 10,-96 22,-108" stroke={tone(col, 0.7)} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.6} />
				{/* head */}
				<g transform={`translate(66,-118) rotate(${bow * 10})`}>
					<Inked d="M-38,-6 C-40,-40 -10,-52 10,-50 C38,-48 50,-26 48,-2 C46,22 24,32 4,32 C-24,32 -36,18 -38,-6 Z" fill={`url(#${id}b)`} />
					<Inked d="M10,8 C14,-6 50,-6 58,6 C62,20 44,30 26,28 C14,26 8,18 10,8 Z" fill={tone(col, 1.25)} thin={1.8} heavy={2.4} />
					<ellipse cx={54} cy={4} rx={8} ry={6} fill={INK} />
					{tongue ? <path d="M30,24 q4,16 12,14 q6,-2 2,-14 Z" fill="#e8708a" stroke={INK} strokeWidth={1.6} /> : <path d="M30,22 q8,4 16,-2" stroke={INK} strokeWidth={2.2} fill="none" strokeLinecap="round" />}
					{eyes === 'closed' ? (
						<path d="M8,-14 q5,4 10,0" stroke={INK} strokeWidth={2.6} fill="none" strokeLinecap="round" />
					) : (
						<g>
							<circle cx={14} cy={-14} r={eyes === 'wide' ? 8 : 6} fill="#fffefc" stroke={INK} strokeWidth={2.1} />
							<circle cx={16} cy={-13.5} r={2.6} fill={INK} />
						</g>
					)}
					{/* floppy ear */}
					<Inked d={`M-24,-38 C-44,-38 -50,-6 ${-40 + Math.sin(t * 0.3) * 3},14 C-30,16 -20,0 -14,-30 Z`} fill="#8a5a36" thin={1.8} heavy={2.4} />
				</g>
			</g>
		</g>
	);
};

// KNEELING Marc: the person rig without legs, lowered, plus folded stick legs behind.
const Kneel: React.FC<{x: number; y: number; h: number; look: Look; pose: React.ComponentProps<typeof Person>['pose']; t: number; crown?: number}> = ({x, y, h, look, pose, t, crown = 0}) => {
	const s = h / 315;
	const f = pose?.facing ?? 1;
	const drop = 70 * s;
	return (
		<g>
			<g transform={`translate(${x},${y}) scale(${s * f},${s})`}>
				<ellipse cx={-10} cy={2} rx={70} ry={10} fill="#1d1430" opacity={0.22} />
				<path d="M-14,-62 L18,-4 L-62,-4" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
				<path d="M14,-62 L42,-4 L-36,-4" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
				<path d="M-62,-4 l-12,0 M-36,-4 l-12,0" stroke={look.boots ?? INK} strokeWidth={9} strokeLinecap="round" />
			</g>
			<Person x={x} y={y + drop} h={h} look={look} t={t} pose={{...pose, seated: true}} />
			{crown > 0 ? <Crown x={x + 2 * s * f} y={y + drop - 296 * s} s={s * 0.62} f={f} pop={crown} /> : null}
		</g>
	);
};

// ---------- 3D sets ----------
const Pine: React.FC<{p: V; s?: number}> = ({p, s = 1}) => <GLB file="models/pine.glb" p={p} r={[0, (p[0] * 1.7 + p[2]) % 6, 0]} height={3.4 * s} ink={0.7} />;

const Outside: React.FC = () => {
	const tex = useMemo(() => ({snow: noiseTex('#eef3fb', ['#dfe7f6', '#ffffff', '#d4def2'], 61, [12, 12], 200, 10, 70, 0.35), path: noiseTex('#c9b8a8', ['#b8a08a', '#dcc8b4'], 64, [1, 6], 80, 6, 30, 0.3)}), []);
	return (
		<group>
			<directionalLight position={[-8, 10, 6]} intensity={2.6} color="#ffe0b8" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12} shadow-bias={-0.0006} />
			<hemisphereLight args={['#cfe2ff', '#6a74c8', 0.9]} />
			<fog attach="fog" args={['#cfdcf2', 30, 140]} />
			<Backdrop file="bg/snow.jpg" radius={120} horizon={0} hFrac={0.3} yaw={Math.PI} />
			<mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
				<planeGeometry args={[240, 240]} />
				<meshStandardMaterial map={tex.snow} roughness={1} />
			</mesh>
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.3, 0.01, 1.5]} receiveShadow>
				<planeGeometry args={[1.3, 8]} />
				<meshStandardMaterial map={tex.path} roughness={1} />
			</mesh>
			<GLB file="models/cottage.glb" p={[0, 0, -4.6]} fit={5.2} />
			{Array.from({length: 9}, (_, i) => -5.5 + i * 0.5).map((x) => <Box key={x} s={[0.1, 0.7, 0.05]} p={[x, 0.35, -0.6]} color="#ffffff" />)}
			{Array.from({length: 9}, (_, i) => 1.5 + i * 0.5).map((x) => <Box key={x} s={[0.1, 0.7, 0.05]} p={[x, 0.35, -0.6]} color="#ffffff" />)}
			<Box s={[4.2, 0.08, 0.05]} p={[-3.5, 0.5, -0.6]} color="#ffffff" />
			<Box s={[4.2, 0.08, 0.05]} p={[3.5, 0.5, -0.6]} color="#ffffff" />
			<GLB file="models/mailbox.glb" p={[1.6, 0, 0.2]} r={[0, -0.3, 0]} height={1.3} />
			<GLB file="models/lamp.glb" p={[-1.5, 0, 0.0]} height={2.6} />
			<Pine p={[4.2, 0, -5]} s={1.3} />
			<Pine p={[-5.5, 0, -4]} s={1.1} />
			<Pine p={[6.5, 0, -9]} s={1.6} />
			<Pine p={[-8, 0, -10]} s={1.5} />
			<Pine p={[-4.2, 0, 2.2]} s={0.9} />
			{Array.from({length: 14}, (_, i) => -30 + i * 4.6).map((x, i) => <Pine key={`r${i}`} p={[x, 0, -24 - ((i * 7) % 5)]} s={1.6 + (i % 3) * 0.3} />)}
		</group>
	);
};

// interior: living room + kitchen sink with the leaking tap
const SINK: V = [2.55, 0, -2.2];
const Inside: React.FC<{f: number}> = ({f}) => {
	const tex = useMemo(() => ({
		floor: planksTex('#c88a52', '#8a5a32', '#e0a86a', 71, false, [6, 6]),
		wall: canvasTex(256, 256, (g, r) => {
			g.fillStyle = '#f2d9a8';
			g.fillRect(0, 0, 256, 256);
			for (let i = 0; i < 8; i++) {
				g.fillStyle = i % 2 ? '#ecca90' : '#f2d9a8';
				g.fillRect(i * 32, 0, 32, 256);
			}
			for (let i = 0; i < 40; i++) {
				g.fillStyle = 'rgba(200,120,90,0.35)';
				g.beginPath();
				g.arc(r() * 256, r() * 256, 3 + r() * 3, 0, 7);
				g.fill();
			}
		}, 9, [6, 3]),
		rug: noiseTex('#4a8ac8', ['#3a72b0', '#6aa8e0', '#e86a5a'], 72, [2, 2], 120, 6, 24, 0.35),
		sofa: noiseTex('#7a9a4a', ['#6a8a3e', '#8aaa5a'], 73, [2, 2], 80, 6, 20, 0.3),
	}), []);
	// one drip every 24 frames, falling from the spout into the basin
	const ph = (f % 24) / 24;
	const dripY = 1.34 - ph * ph * 0.42;
	return (
		<group>
			<directionalLight position={[-4, 7, 6]} intensity={2.3} color="#ffd9a8" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={8} shadow-camera-bottom={-8} shadow-bias={-0.0006} />
			<pointLight position={[-2.4, 2.4, -1.6]} intensity={6} distance={7} color="#ffb870" />
			<pointLight position={[2.3, 2.0, -0.6]} intensity={5} distance={4} color="#fff0d8" />
			<hemisphereLight args={['#ffe8c8', '#7a5aa8', 0.75]} />
			<fog attach="fog" args={['#e8c8a0', 14, 40]} />
			<mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
				<planeGeometry args={[14, 14]} />
				<meshStandardMaterial map={tex.floor} roughness={1} />
			</mesh>
			<mesh position={[0, 2, -3.2]} receiveShadow>
				<planeGeometry args={[14, 4]} />
				<meshStandardMaterial map={tex.wall} roughness={1} />
			</mesh>
			<mesh position={[-4.6, 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
				<planeGeometry args={[14, 4]} />
				<meshStandardMaterial map={tex.wall} roughness={1} color="#f0d8c0" />
			</mesh>
			<Box s={[14, 0.16, 0.06]} p={[0, 0.08, -3.17]} color="#fbf6ee" />
			<Window p={[-1.6, 1.85, -3.15]} w={1.1} h={1.1} />
			<Box s={[0.7, 0.5, 0.05]} p={[0.5, 2.0, -3.15]} color="#5aa0d8" />
			<Box s={[0.5, 0.32, 0.06]} p={[0.5, 2.0, -3.12]} color="#f6e08a" ink={false} />
			{/* rug */}
			<mesh position={[-0.1, 0.012, 0.2]} receiveShadow>
				<cylinderGeometry args={[1.7, 1.7, 0.02, 40]} />
				<meshStandardMaterial map={tex.rug} roughness={1} />
			</mesh>
			{/* sofa */}
			<group position={[-2.4, 0, -2.35]}>
				<Box s={[2.4, 0.45, 0.95]} p={[0, 0.225, 0]} color="#7a9a4a" map={tex.sofa} />
				<Box s={[2.4, 0.65, 0.25]} p={[0, 0.75, -0.38]} color="#6a8a3e" map={tex.sofa} />
				<Box s={[0.25, 0.65, 0.95]} p={[-1.2, 0.33, 0]} color="#6a8a3e" />
				<Box s={[0.25, 0.65, 0.95]} p={[1.2, 0.33, 0]} color="#6a8a3e" />
				<Box s={[0.5, 0.35, 0.18]} p={[-0.6, 0.62, -0.2]} r={[0.2, 0.2, 0]} color="#f0c040" />
			</group>
			{/* little table + toys */}
			<Box s={[0.7, 0.35, 0.5]} p={[-0.9, 0.175, -1.2]} color="#a8683a" />
			<Blob p={[-0.75, 0.47, -1.2]} r={0.12} color="#e8403a" />
			<Box s={[0.22, 0.22, 0.22]} p={[-1.05, 0.46, -1.15]} r={[0, 0.5, 0]} color="#5ab0e8" />
			<Cyl p={[1.1, 0.25, -2.7]} rt={0.22} rb={0.17} h={0.5} color="#c8724a" />
			<Blob p={[1.1, 0.75, -2.7]} r={0.38} color="#4a9a4a" />
			{/* kitchen counter + sink + leaking tap */}
			<group position={SINK}>
				<Box s={[2.0, 0.95, 0.75]} p={[0, 0.475, 0]} color="#e8eef6" />
				<Box s={[2.1, 0.06, 0.82]} p={[0, 0.98, 0]} color="#9aa8b8" />
				<Box s={[0.8, 0.04, 0.5]} p={[0, 1.0, 0.05]} color="#8aa0b8" ink={false} />
				<Cyl p={[0, 1.2, -0.25]} rt={0.04} rb={0.05} h={0.4} color="#c8d0da" />
				<Cyl p={[0, 1.38, -0.1]} rt={0.035} rb={0.035} h={0.3} r={[Math.PI / 2, 0, 0]} color="#c8d0da" />
				<Blob p={[0, 1.38, -0.25]} r={0.06} color="#d8e0ea" />
				<Blob p={[0, dripY, 0.06]} r={0.028 + 0.01 * (1 - ph)} color="#7ec8f0" detail={2} />
				{[-0.35, 0.35].map((x) => <Box key={x} s={[0.5, 0.6, 0.02]} p={[x * 1.8, 0.45, 0.38]} color="#d8e2ee" />)}
				<Box s={[2.0, 0.9, 0.35]} p={[0, 2.25, -0.2]} color="#e8eef6" />
			</group>
		</group>
	);
};

// ---------- cameras ----------
const C: Record<string, Cam> = {
	extA: {pos: [1.9, 1.5, 6.0], look: [0.3, 1.25, -2.2], fov: 40, roll: 0},
	extB: {pos: [1.6, 1.45, 5.2], look: [0.3, 1.2, -2.2], fov: 40, roll: 0},
	leaveA: {pos: [0.4, 1.3, 5.4], look: [0.3, 1.25, -1.6], fov: 42, roll: -2},
	leaveB: {pos: [0.35, 1.25, 4.8], look: [0.3, 1.25, -1.2], fov: 42, roll: -3},
	inA: {pos: [0.1, 1.6, 6.6], look: [0.0, 0.85, -0.6], fov: 46, roll: 0},
	inB: {pos: [0.05, 1.5, 6.0], look: [0.0, 0.8, -0.6], fov: 46, roll: 0},
	playA: {pos: [0.1, 1.2, 4.9], look: [0.05, 0.75, -0.3], fov: 46, roll: 3},
	playB: {pos: [0.1, 1.15, 4.5], look: [0.05, 0.75, -0.3], fov: 46, roll: 3},
	tapA: {pos: [2.3, 1.45, -0.6], look: [2.55, 1.15, -2.35], fov: 36, roll: 0},
	tapB: {pos: [2.35, 1.42, -0.9], look: [2.55, 1.15, -2.35], fov: 36, roll: 0},
};
const camAt = (f: number): Cam => {
	if (f < T.s2) return mixCam(C.extA, C.extB, smoother(f / T.s2));
	if (f < T.s3) return mixCam(C.leaveA, C.leaveB, smoother((f - T.s2) / (T.s3 - T.s2)));
	if (f < T.s4) return mixCam(C.inA, C.inB, smoother((f - T.s3) / (T.s4 - T.s3)));
	if (f < T.s5) return push(mixCam(C.inB, C.playA, easeOut((f - T.s4) / 10)), Math.max(0, f - T.s4 - 10) * 0.0012);
	return mixCam(C.tapA, C.tapB, smoother((f - T.s5) / (T.end - T.s5)));
};

export const PlombierTest: React.FC = () => {
	const f = useCurrentFrame();
	const c = camAt(f);
	const P = projector(c);
	const cast: {d: number; n: React.ReactNode}[] = [];
	const add = (p: V, n: React.ReactNode) => cast.push({d: depth(c, p), n});
	const outside = f < T.s3;
	const H = 1.78, KID = 1.12;

	if (f < T.s2) {
		// Marc arrives at the door with his toolbox
		const walkIn = ci(f, [0, 34], [0, 1]);
		const mp: V = [1.3 - walkIn * 0.6, 0, -0.9 - walkIn * 0.9];
		const m = P(mp);
		const walking = f < 34;
		add(mp, <Person key="marc" x={m.x} y={m.y} h={m.ppm * H} look={MARC} t={f} pose={{facing: -1, walk: walking ? f * 0.5 : undefined, eyes: 'open', mouth: 'dash', lookX: 0.8, armR: 6, armL: f > 44 ? 150 : 14, lean: walking ? 3 : 0}} holdR={<g transform="translate(0,8)"><Toolbox s={0.7} /></g>} />);
		if (f > 46) {
			const bell = P([0.3, 1.6, -2.05]);
			add([0, 9, 0], <Sparkle key="bell" x={bell.x} y={bell.y} s={ci(f, [46, 50, 62], [0, 1.4, 0])} o={ci(f, [46, 50, 64], [0, 1, 0])} rot={f * 6} />);
		}
	} else if (f < T.s3) {
		// leaves crowned, kids + dog wave from the door
		const u = (f - T.s2) / (T.s3 - T.s2);
		const mp: V = [0.55, 0, -1.5 + u * 1.9];
		const m = P(mp);
		const s = (m.ppm * H) / 315;
		const ph = f * 0.5;
		const bob = -Math.abs(Math.cos(ph)) * 6;
		add(mp, (
			<g key="marc">
				<Person x={m.x} y={m.y} h={m.ppm * H} look={MARC} t={f} pose={{facing: 1, walk: ph, eyes: 'closed', mouth: 'grin', lookX: 0.2, armL: 10, armR: 8}} holdR={<g transform="translate(0,8)"><Toolbox s={0.7} /></g>} />
				<Crown x={m.x + 2 * s} y={m.y + (bob - 300) * s} s={s * 0.62} f={1} />
			</g>
		));
		const wave = Math.sin(f * 0.45) * 30;
		[[-0.25, -2.25, BOY], [1.35, -2.2, GIRL]].forEach(([x, z, lk], i) => {
			const kp: V = [x as number, 0, z as number];
			const k = P(kp);
			add(kp, <Person key={`k${i}`} x={k.x} y={k.y} h={k.ppm * KID} look={lk as Look} t={f} pose={{facing: i ? -1 : 1, eyes: 'open', mouth: 'smile', armR: 160 + wave, armL: 14, bob: Math.max(0, Math.sin(f * 0.3 + i)) * -10}} />);
		});
		const dp: V = [-0.75, 0, -1.6];
		const d = P(dp);
		add(dp, <Dog key="dog" x={d.x} y={d.y} h={d.ppm * 0.62} facing={1} t={f} tongue hop={Math.max(0, Math.sin(f * 0.35)) * d.ppm * 0.12} />);
		const hd = P([mp[0], 2.05, mp[2]]);
		add([0, 9, 0], <Sparkle key="cs" x={hd.x + 40} y={hd.y} s={ci(f, [T.s2, T.s2 + 6, T.s2 + 22], [0, 1.6, 0])} o={ci(f, [T.s2, T.s2 + 6, T.s2 + 24], [0, 1, 0])} rot={f * 5} />);
	} else if (f < T.s4) {
		// inside: Marc kneels and opens his toolbox, the house watches
		const mp: V = [-0.45, 0, 0.5];
		const m = P(mp);
		const kneelU = easeOut((f - T.s3 - 4) / 12);
		const open = easeOut((f - 182) / 10);
		const tp: V = [0.2, 0, 0.62];
		const tb = P(tp);
		add(mp, <Kneel key="marc" x={m.x} y={m.y - (1 - kneelU) * m.ppm * 0.35} h={m.ppm * H} look={MARC} t={f} pose={{facing: 1, eyes: 'open', mouth: 'dash', lookX: 1, handR: open > 0 ? [96, -170] : [70, -190], armL: 20, lean: 6}} />);
		add(tp, <g key="tb" transform={`translate(${tb.x},${tb.y})`}><Toolbox s={(tb.ppm * 0.45) / 100} open={open} /></g>);
		const kids: [number, number, Look, number][] = [[1.15, -0.7, BOY, -1], [-1.3, -0.9, GIRL, 1]];
		kids.forEach(([x, z, lk, fc], i) => {
			const kp: V = [x, 0, z];
			const k = P(kp);
			const peek = ci(f, [150 + i * 10, 166 + i * 10], [0, 1]);
			add(kp, <Person key={`k${i}`} x={k.x} y={k.y} h={k.ppm * KID} look={lk} t={f} pose={{facing: fc as 1 | -1, eyes: f > 190 ? 'wide' : 'open', mouth: f > 190 ? 'o' : 'dash', lookX: 1, armL: 10, armR: 10, lean: peek * 8}} />);
		});
		const dp: V = [0.85, 0, 0.1];
		const d = P(dp);
		add(dp, <Dog key="dog" x={d.x} y={d.y} h={d.ppm * 0.62} facing={-1} t={f} eyes={f > 190 ? 'wide' : 'open'} />);
		const cp: V = [-0.9, 0.35, -1.2];
		const cpp = P(cp);
		add(cp, <Cat key="cat" x={cpp.x} y={cpp.y} h={cpp.ppm * 0.5} facing={1} t={f} eyes={f > 190 ? 'open' : 'lidded'} color="#4a4258" />);
		if (f > 192) {
			const q = P([1.15, 1.45, -0.7]);
			add([0, 9, 0], <Question key="q" x={q.x} y={q.y} s={q.ppm / 220} o={ci(f, [192, 198], [0, 1])} />);
		}
	} else if (f < T.s5) {
		// "on joue !" : dog play bow, kids jump, cat moves into the toolbox, crown lands on Marc
		const mp: V = [-0.45, 0, 0.5];
		const m = P(mp);
		const crown = f >= T.play + 6 ? easeOut((f - T.play - 6) / 8) : 0;
		const playing = f >= T.play;
		add(mp, <Kneel key="marc" x={m.x} y={m.y} h={m.ppm * H} look={MARC} t={f} crown={crown} pose={{facing: 1, eyes: playing ? 'closed' : 'open', mouth: playing ? 'grin' : f > T.dog + 6 ? 'smile' : 'dash', lookX: 1, armR: playing ? 150 + Math.sin(f * 0.4) * 10 : 30, armL: playing ? 150 - Math.sin(f * 0.4) * 10 : 20, lean: playing ? 0 : 4}} />);
		const tp: V = [0.2, 0, 0.62];
		const tb = P(tp);
		add(tp, <g key="tb" transform={`translate(${tb.x},${tb.y})`}><Toolbox s={(tb.ppm * 0.45) / 100} open={1} /></g>);
		if (f > T.kids + 20) {
			const catIn = easeOut((f - T.kids - 20) / 10);
			add([0.2, 0, 0.6], <g key="cat" transform={`translate(0,${(1 - catIn) * 80})`} opacity={catIn}><Cat x={tb.x + 4} y={tb.y - tb.ppm * 0.26} h={tb.ppm * 0.38} facing={-1} t={f} eyes="lidded" color="#4a4258" /></g>);
		}
		const bow = f >= T.dog ? easeOut((f - T.dog) / 8) : 0;
		const dp: V = [0.85, 0, 0.05];
		const d = P(dp);
		add(dp, <Dog key="dog" x={d.x} y={d.y} h={d.ppm * 0.62} facing={-1} t={f} bow={playing ? 0 : bow} hop={playing ? Math.max(0, Math.sin(f * 0.5)) * d.ppm * 0.25 : 0} tongue={f > T.dog} />);
		const jump = f >= T.kids;
		const kids: [number, number, Look, number][] = [[1.1, -0.8, BOY, -1], [0.35, -1.5, GIRL, 1]];
		kids.forEach(([x, z, lk, fc], i) => {
			const kp: V = [x, 0, z];
			const k = P(kp);
			const hop = jump ? Math.max(0, Math.sin(f * 0.42 + i * 1.5)) * k.ppm * 0.3 : 0;
			add(kp, <Person key={`k${i}`} x={k.x} y={k.y - hop} h={k.ppm * KID} look={lk} t={f} pose={{facing: fc as 1 | -1, eyes: jump ? 'closed' : 'open', mouth: jump ? 'grin' : 'smile', lookX: 1, armL: jump ? 160 : 12, armR: jump ? 160 : 12}} />);
		});
		if (f >= T.dog && f < T.dog + 24) {
			const dh = P([0.85, 0.8, 0.05]);
			add([0, 9, 0], <Burst key="db" x={dh.x} y={dh.y} o={ci(f, [T.dog, T.dog + 3, T.dog + 16], [0, 1, 0])} r={30 + (f - T.dog) * 2.5} />);
		}
		if (playing) {
			const hd = P([-0.45, 1.5, 0.5]);
			add([0, 9, 0], <Burst key="pb" x={hd.x} y={hd.y} o={ci(f, [T.play, T.play + 3, T.play + 16], [0, 1, 0])} r={50 + (f - T.play) * 3} />);
			const r = rng(5);
			for (let i = 0; i < 7; i++) {
				const sx = r() * 1080, sy = 500 + r() * 700, ph = r() * 20;
				add([0, 9, 0], <Sparkle key={`sp${i}`} x={sx} y={sy - (f - T.play) * 2} s={ci(f, [T.play + ph * 0.5, T.play + ph * 0.5 + 6, T.play + ph * 0.5 + 22], [0, 1.5, 0])} o={ci(f, [T.play + ph * 0.5, T.play + ph * 0.5 + 6, T.play + ph * 0.5 + 24], [0, 1, 0])} rot={f * 5 + i * 40} />);
			}
		}
	} else {
		// the tap still drips; muffled play in the background
		const pl = P([2.55, 1.0, -2.15]);
		const ph = (f % 24) / 24;
		if (ph < 0.25) add([0, 9, 0], <g key="spl" transform={`translate(${pl.x},${pl.y})`} opacity={1 - ph * 4}>{[-1, 1].map((sd) => <path key={sd} d={`M${sd * 8},-4 q${sd * 14},-22 ${sd * 26},-6`} stroke="#7ec8f0" strokeWidth={6} fill="none" strokeLinecap="round" />)}</g>);
	}

	cast.sort((a, b) => b.d - a.d);
	const snow = outside
		? (() => {
				const r = rng(3);
				return Array.from({length: 60}, (_, i) => {
					const x = r() * 1080, y = r() * 1920, s = 3 + r() * 6, v = 2 + r() * 3, w = r() * 6;
					return <circle key={`fl${i}`} cx={(x + Math.sin(f * 0.05 + w) * 20) % 1080} cy={(y + f * v) % 1920} r={s} fill="#ffffff" opacity={0.85} />;
				});
			})()
		: [];
	const blur = f < T.s2 ? 1.4 : f < T.s3 ? 2.4 : f < T.s4 ? 0 : f < T.s5 ? 2.2 : 0;
	const flash = flashAt(f, T.s2) + flashAt(f, T.s3) + flashAt(f, T.s5);
	return (
		<Shell
			cam={c}
			sky={outside ? 'linear-gradient(180deg,#7fa8e6 0%,#b8d0f2 45%,#e6eefa 70%)' : '#e8c8a0'}
			blur={blur}
			world={outside ? <Outside /> : <Inside f={f} />}
			cast={[...cast.map((x) => x.n), ...snow]}
			flash={Math.min(1, flash)}
			tint={outside ? '1.0 0 0 0 0.0  0 1.0 0 0 0.01  0 0 1.03 0 0.02  0 0 0 1 0' : '1.04 0 0 0 0.02  0 0.98 0 0 0.01  0 0 0.9 0 0  0 0 0 1 0'}
		/>
	);
};
export const PLOMBIER_FRAMES = T.end;
