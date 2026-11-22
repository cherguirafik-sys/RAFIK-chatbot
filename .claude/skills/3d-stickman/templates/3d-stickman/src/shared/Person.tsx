import React from 'react';

// Generic RicksClips-style person rig. Units: head width 100, feet at y=0, ~315 tall.
// Rules: head slightly wider than tall, tiny low deadpan face, no neck, gumdrop torso, stick limbs
// (0.055 W), ink-dot hands, arms grow from the torso outline and are drawn in front of it,
// headwear optional and always seated low around the skull.
export const INK = '#2a1a26';
const STICK = 5.5;
let uid = 0;
const useId = (p: string) => React.useMemo(() => `${p}${uid++}`, []);

export const Inked: React.FC<{d: string; fill: string; thin?: number; heavy?: number}> = ({d, fill, thin = 2.4, heavy = 3.6}) => (
	<g>
		<path d={d} fill={INK} transform={`translate(${heavy * 0.55},${heavy * 0.85})`} />
		<path d={d} fill={INK} stroke={INK} strokeWidth={thin * 2} strokeLinejoin="round" />
		<path d={d} fill={fill} />
	</g>
);
export const Vinyl: React.FC<{id: string; light: string; mid: string; shade: string}> = ({id, light, mid, shade}) => (
	<radialGradient id={id} cx="0.32" cy="0.28" r="0.85" fx="0.28" fy="0.22">
		<stop offset="0" stopColor={light} />
		<stop offset="0.55" stopColor={mid} />
		<stop offset="0.9" stopColor={shade} />
		<stop offset="1" stopColor={mid} />
	</radialGradient>
);
// shade a hex colour (k<1 darker, >1 lighter)
export const tone = (hex: string, k: number) => {
	const n = parseInt(hex.slice(1), 16);
	const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(k >= 1 ? v + (255 - v) * (k - 1) : v * k))));
	return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
};

const HEAD = 'M0,-46 C30,-47 52,-30 52,-2 C52,24 34,44 2,45 C-32,45 -50,26 -50,-1 C-50,-29 -29,-46 0,-46 Z';

export type Headwear = 'none' | 'farmer' | 'tricorn' | 'turban' | 'slouch' | 'officer' | 'wig' | 'gnome' | 'santa' | 'bun';
export type Outfit = {
	style: 'overalls' | 'coat' | 'robe' | 'uniform' | 'shirt' | 'sweater';
	main: string; // main garment colour
	second?: string; // shirt / sash / trim
	trim?: string; // buttons / braid
};
export type Look = {
	skin?: string; // head fill
	outfit: Outfit;
	headwear?: Headwear;
	hatColor?: string;
	moustache?: boolean;
	beard?: string; // beard colour, covers the lower face
	wooden?: boolean; // automaton: wood-toned face with joint seams
	boots?: string;
};
export type Pose = {
	facing?: 1 | -1;
	lookX?: number;
	armL?: number;
	armR?: number;
	handL?: [number, number]; // explicit local hand targets (override angle)
	handR?: [number, number];
	handsOnBelly?: number;
	walk?: number;
	bob?: number;
	headTilt?: number;
	hatPop?: number;
	mouth?: 'dash' | 'o' | 'smile' | 'wobble' | 'frown' | 'grin';
	eyes?: 'open' | 'wide' | 'lidded' | 'angry' | 'closed';
	lean?: number;
	seated?: boolean; // no legs drawn (behind furniture)
};

const torsoTop = -235, torsoBot = -135;
const TORSO = `M-44,${torsoTop + 20} C-46,${torsoTop - 2} -26,${torsoTop - 8} 0,${torsoTop - 8} C26,${torsoTop - 8} 47,${torsoTop - 2} 46,${torsoTop + 20} L50,${torsoBot - 26} C51,${torsoBot - 2} 30,${torsoBot + 4} 0,${torsoBot + 4} C-30,${torsoBot + 4} -51,${torsoBot - 2} -49,${torsoBot - 26} Z`;

const HeadwearShape: React.FC<{kind: Headwear; id: string; color: string; pop: number}> = ({kind, id, color, pop}) => {
	if (kind === 'none') return null;
	const g = `url(#${id}hw)`;
	const lift = `translate(0,${-pop}) rotate(${pop * 0.15})`;
	const defs = <Vinyl id={`${id}hw`} light={tone(color, 1.35)} mid={color} shade={tone(color, 0.62)} />;
	if (kind === 'wig') {
		// powdered wig: wraps the back and sides of the head, curls at the ears, small queue at the back
		return (
			<g>
				<defs>{defs}</defs>
				<Inked d="M-54,6 C-62,-30 -40,-56 -2,-56 C38,-56 62,-32 56,6 C50,-10 40,-28 2,-30 C-34,-30 -48,-10 -54,6 Z" fill={g} thin={1.8} heavy={2.6} />
				{[-1, 1].map((s) => (
					<g key={s}>
						<Inked d={`M${s * 50},-4 c${s * 10},0 ${s * 12},10 ${s * 2},12 c${s * 10},2 ${s * 10},12 0,12 c${-s * 8},0 ${-s * 8},-12 ${-s * 2},-24 Z`} fill={g} thin={1.5} heavy={2} />
					</g>
				))}
			</g>
		);
	}
	if (kind === 'turban') {
		return (
			<g transform={lift}>
				<defs>{defs}</defs>
				<Inked d="M-56,-8 C-62,-40 -36,-66 2,-66 C40,-66 64,-40 58,-8 C30,0 -28,0 -56,-8 Z" fill={g} thin={2} heavy={3} />
				<path d="M-52,-22 C-20,-12 24,-12 54,-24 M-46,-38 C-14,-28 22,-30 48,-42 M-30,-54 C-6,-46 18,-48 34,-58" stroke={tone(color, 0.7)} strokeWidth={3} fill="none" opacity={0.8} />
				<Inked d="M-8,-30 l8,-12 l8,12 l-8,12 Z" fill="#c8323a" thin={1.4} heavy={1.6} />
				<path d="M2,-66 c6,-14 18,-18 22,-10" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
			</g>
		);
	}
	if (kind === 'santa') {
		// santa hat: red cap wrapping the skull with a white fur band, tip flops to the side
		return (
			<g transform={lift}>
				<defs>{defs}</defs>
				<Inked d="M-52,-14 C-54,-44 -30,-70 4,-74 C30,-76 56,-66 74,-40 C80,-30 74,-22 66,-26 C54,-44 42,-46 40,-36 C48,-28 54,-22 54,-14 C28,-6 -26,-6 -52,-14 Z" fill={g} thin={2} heavy={3} />
				<Inked d="M-58,-22 C-28,-12 30,-12 60,-22 L60,-6 C30,4 -28,4 -58,-6 Z" fill="#fbf8f4" thin={1.8} heavy={2.4} />
				<circle cx={72} cy={-28} r={11} fill="#fbf8f4" stroke={INK} strokeWidth={2.4} />
			</g>
		);
	}
	if (kind === 'bun') {
		// grey hair wrapping the head with a bun on top
		return (
			<g>
				<defs>{defs}</defs>
				<Inked d="M-52,6 C-60,-32 -38,-56 -2,-56 C36,-56 60,-32 54,6 C46,-12 36,-26 2,-28 C-32,-28 -46,-12 -52,6 Z" fill={g} thin={1.8} heavy={2.6} />
				<Inked d="M-18,-52 C-22,-74 18,-78 18,-54 Z" fill={g} thin={1.6} heavy={2} />
			</g>
		);
	}
	if (kind === 'gnome') {
		// tall pointed cap: base wraps the skull low, tip flops to the back
		return (
			<g transform={lift}>
				<defs>{defs}</defs>
				<Inked d="M-56,-10 C-58,-40 -40,-70 -14,-104 C-4,-118 10,-130 30,-134 C40,-136 50,-128 44,-120 C30,-112 26,-90 34,-64 C44,-40 58,-28 58,-10 C30,-2 -28,-2 -56,-10 Z" fill={g} thin={2} heavy={3} />
				<path d="M-40,-60 C-30,-80 -18,-96 -6,-108" stroke={tone(color, 1.5)} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.7} />
			</g>
		);
	}
	if (kind === 'tricorn') {
		return (
			<g transform={lift}>
				<defs>{defs}</defs>
				<Inked d="M-70,-12 C-60,-30 -30,-58 0,-58 C30,-58 60,-30 72,-12 C50,-2 -48,-2 -70,-12 Z" fill={g} thin={2} heavy={3} />
				<path d="M-66,-14 C-40,-6 42,-6 68,-14" stroke="#e7c35a" strokeWidth={3.5} fill="none" />
			</g>
		);
	}
	if (kind === 'slouch') {
		// slouch hat: crown wraps the skull, left brim pinned up
		return (
			<g transform={lift}>
				<defs>{defs}</defs>
				<Inked d="M-44,-22 C-56,-2 -62,-30 -54,-52 C-46,-48 -40,-40 -38,-22 Z" fill={g} thin={1.6} heavy={2.2} />
				<Inked d="M-52,-12 C-55,-36 -40,-56 -14,-58 C-6,-53 6,-53 14,-58 C42,-56 56,-36 54,-12 C30,-5 -28,-5 -52,-12 Z" fill={g} thin={2} heavy={3} />
				<path d="M-52,-19 C-28,-11 30,-11 54,-19 L54,-12 C30,-5 -28,-5 -52,-12 Z" fill="#5a4630" />
				<Inked d="M-40,-12 C-20,-4 30,-3 76,-12 C70,-2 40,6 0,5 C-24,4 -38,-2 -40,-12 Z" fill={g} thin={1.8} heavy={2.6} />
			</g>
		);
	}
	if (kind === 'officer') {
		// peaked cap: crown + band + short visor, seated low
		return (
			<g transform={lift}>
				<defs>{defs}</defs>
				<Inked d="M-58,-22 C-62,-46 -30,-58 4,-58 C40,-58 66,-46 60,-22 C30,-16 -30,-16 -58,-22 Z" fill={g} thin={2} heavy={3} />
				<path d="M-54,-24 C-24,-18 26,-18 56,-24 L56,-12 C26,-6 -24,-6 -54,-12 Z" fill="#7a2a2a" stroke={INK} strokeWidth={1.6} />
				<Inked d="M-10,-12 C10,-10 40,-10 64,-4 C46,4 10,4 -10,-4 Z" fill="#3a2c22" thin={1.6} heavy={2} />
				<circle cx={2} cy={-34} r={5} fill="#e7c35a" stroke={INK} strokeWidth={1.4} />
			</g>
		);
	}
	// farmer
	return (
		<g transform={lift}>
			<defs>{defs}</defs>
			<Inked d="M-68,-12 C-62,-24 -38,-28 0,-28 C38,-28 64,-24 70,-12 C60,-17 34,-19 0,-19 C-34,-19 -60,-17 -68,-12 Z" fill={g} thin={1.8} heavy={2.4} />
			<Inked d="M-53,-12 C-56,-36 -40,-56 -14,-58 C-6,-53 6,-53 14,-58 C42,-56 56,-36 54,-12 C30,-5 -28,-5 -53,-12 Z" fill={g} thin={2} heavy={3} />
			<path d="M-53,-19 C-28,-11 30,-11 54,-19 L54,-12 C30,-5 -28,-5 -53,-12 Z" fill={tone(color, 0.55)} />
			<Inked d="M-70,-12 C-60,-6 -34,-3 0,-3 C34,-3 62,-6 72,-12 C66,-4 40,4 0,4 C-40,4 -64,-4 -70,-12 Z" fill={g} thin={1.8} heavy={2.6} />
		</g>
	);
};

const OutfitShape: React.FC<{o: Outfit; id: string}> = ({o, id}) => {
	const main = `url(#${id}m)`;
	const second = o.second ?? '#f2efe8';
	const trim = o.trim ?? '#e8c35a';
	const yT = torsoTop;
	const defs = (
		<defs>
			<Vinyl id={`${id}m`} light={tone(o.main, 1.4)} mid={o.main} shade={tone(o.main, 0.58)} />
			<Vinyl id={`${id}s`} light={tone(second, 1.3)} mid={second} shade={tone(second, 0.6)} />
		</defs>
	);
	const rim = <path d={`M44,${yT + 40} C49,${torsoBot - 40} 40,${torsoBot - 8} 20,${torsoBot - 3}`} stroke={tone(o.main, 1.6)} strokeWidth={3} fill="none" opacity={0.5} />;
	if (o.style === 'overalls') {
		return (
			<g>
				{defs}
				<Inked d={TORSO} fill={main} />
				<path d={`M-44,${yT + 20} C-46,${yT - 2} -26,${yT - 8} 0,${yT - 8} C26,${yT - 8} 47,${yT - 2} 46,${yT + 20} L46,${yT + 34} L-45,${yT + 34} Z`} fill={`url(#${id}s)`} />
				<path d={`M-26,${yT + 30} L26,${yT + 30} L28,${yT + 64} L-28,${yT + 64} Z`} fill={tone(o.main, 1.1)} stroke={INK} strokeWidth={1.4} />
				<path d={`M-26,${yT + 31} L-36,${yT - 2} M26,${yT + 31} L36,${yT - 2}`} stroke={tone(o.main, 0.8)} strokeWidth={7} strokeLinecap="round" />
				<circle cx={-25} cy={yT + 33} r={3.2} fill={trim} stroke={INK} strokeWidth={1} />
				<circle cx={25} cy={yT + 33} r={3.2} fill={trim} stroke={INK} strokeWidth={1} />
				{rim}
			</g>
		);
	}
	if (o.style === 'coat') {
		// frock coat with lapels over a waistcoat and cravat
		return (
			<g>
				{defs}
				<Inked d={TORSO} fill={main} />
				<path d={`M-14,${yT - 6} L14,${yT - 6} L18,${torsoBot - 6} L-18,${torsoBot - 6} Z`} fill={`url(#${id}s)`} stroke={INK} strokeWidth={1.4} />
				<path d={`M-14,${yT - 6} L-30,${yT + 40} L-16,${yT + 52} M14,${yT - 6} L30,${yT + 40} L16,${yT + 52}`} stroke={INK} strokeWidth={1.8} fill="none" />
				<path d={`M-10,${yT - 6} q10,16 20,0 q-4,14 -10,18 q-6,-4 -10,-18 Z`} fill="#fbf7f0" stroke={INK} strokeWidth={1.4} />
				{[0, 1, 2, 3].map((i) => <circle key={i} cx={22} cy={yT + 30 + i * 16} r={3} fill={trim} stroke={INK} strokeWidth={1} />)}
				{rim}
			</g>
		);
	}
	if (o.style === 'robe') {
		return (
			<g>
				{defs}
				<Inked d={TORSO} fill={main} />
				<path d={`M-6,${yT - 8} L-24,${torsoBot} M6,${yT - 8} L24,${torsoBot}`} stroke={trim} strokeWidth={4} />
				<path d={`M-49,${yT + 58} C-20,${yT + 66} 22,${yT + 66} 50,${yT + 56} L50,${yT + 72} C22,${yT + 82} -20,${yT + 82} -49,${yT + 74} Z`} fill={`url(#${id}s)`} stroke={INK} strokeWidth={1.4} />
				{rim}
			</g>
		);
	}
	if (o.style === 'uniform') {
		return (
			<g>
				{defs}
				<Inked d={TORSO} fill={main} />
				<path d={`M0,${yT - 6} L0,${torsoBot - 4}`} stroke={tone(o.main, 0.6)} strokeWidth={2} />
				{[0, 1, 2].map((i) => <circle key={i} cx={0} cy={yT + 10 + i * 20} r={3} fill={trim} stroke={INK} strokeWidth={1} />)}
				<path d={`M-34,${yT + 14} h20 v14 h-20 Z M14,${yT + 14} h20 v14 h-20 Z`} fill={tone(o.main, 0.85)} stroke={INK} strokeWidth={1.2} />
				<path d={`M-50,${yT + 62} C-20,${yT + 70} 22,${yT + 70} 50,${yT + 60} L50,${yT + 72} C22,${yT + 82} -20,${yT + 82} -50,${yT + 74} Z`} fill={second} stroke={INK} strokeWidth={1.4} />
				<rect x={-6} y={yT + 64} width={12} height={10} rx={2} fill={trim} stroke={INK} strokeWidth={1.2} />
				{rim}
			</g>
		);
	}
	if (o.style === 'sweater') {
		// ugly christmas sweater: zigzag band, dots, a little tree
		return (
			<g>
				{defs}
				<Inked d={TORSO} fill={main} />
				<path d={`M-48,${yT + 30} l12,-10 l12,10 l12,-10 l12,10 l12,-10 l12,10 l12,-10 l12,10`} stroke={second} strokeWidth={5} fill="none" strokeLinejoin="round" />
				<path d={`M0,${yT + 44} l-14,26 h28 Z`} fill="#3a9a4a" stroke={INK} strokeWidth={1.4} />
				<circle cx={0} cy={yT + 42} r={3.5} fill={trim} />
				{[-30, 30, -24, 26].map((dx, i) => <circle key={i} cx={dx} cy={yT + 54 + (i > 1 ? 24 : 0)} r={3} fill={second} />)}
				{rim}
			</g>
		);
	}
	return (
		<g>
			{defs}
			<Inked d={TORSO} fill={main} />
			{rim}
		</g>
	);
};

export const Person: React.FC<{x: number; y: number; h: number; look: Look; pose?: Pose; t?: number; holdR?: React.ReactNode; holdL?: React.ReactNode}> = ({x, y, h, look, pose = {}, t = 0, holdR, holdL}) => {
	const id = useId('p');
	const s = h / 315;
	const f = pose.facing ?? 1;
	const ph = pose.walk;
	const walking = !(ph === undefined || Number.isNaN(ph));
	const legSwing = walking ? Math.sin(ph!) * 18 : 0;
	const bob = (pose.bob ?? 0) + (walking ? -Math.abs(Math.cos(ph!)) * 6 : 0);
	const hipY = torsoBot - 4;
	const lookX = (pose.lookX ?? 0.6) * 6;
	const belly = pose.handsOnBelly ?? 0;
	const skin = look.skin ?? '#f7f0ee';
	const arm = (side: -1 | 1, a: number, target?: [number, number]) => {
		const sx = side * 44.5, sy = torsoTop + 30;
		const rad = (a * Math.PI) / 180;
		let ex = sx + side * Math.sin(rad) * 96, ey = sy + Math.cos(rad) * 96;
		if (target) [ex, ey] = target;
		const bx = side * 15, by = torsoTop + 82 + Math.sin(t * 0.5 + side) * 2;
		ex = ex * (1 - belly) + bx * belly;
		ey = ey * (1 - belly) + by * belly;
		// elbow bulges away from the body; more when the hand comes back across it
		const across = Math.max(0, -side * (ex - sx)) / 60;
		const out = 7 + across * 22 + belly * 30;
		const mx = (sx + ex) / 2, my = (sy + ey) / 2;
		const dx = ex - sx, dy = ey - sy, L = Math.hypot(dx, dy) || 1;
		let nx = -dy / L, ny = dx / L;
		if (nx * side < 0) {
			nx = -nx;
			ny = -ny;
		}
		return {sx, sy, ex, ey, cx: mx + nx * out, cy: my + ny * out};
	};
	const A = [arm(-1, pose.armL ?? 12, pose.handL), arm(1, pose.armR ?? 12, pose.handR)];
	const eyeR = pose.eyes === 'wide' ? 7.5 : 5.6;
	return (
		<g transform={`translate(${x},${y}) scale(${s * f},${s})`}>
			<defs>
				<Vinyl id={`${id}h`} light={tone(skin, 1.3)} mid={skin} shade={look.wooden ? tone(skin, 0.65) : '#d9cfe4'} />
				<radialGradient id={`${id}sh`}>
					<stop offset="0" stopColor="#1d1430" stopOpacity="0.38" />
					<stop offset="1" stopColor="#1d1430" stopOpacity="0" />
				</radialGradient>
			</defs>
			{!pose.seated ? <ellipse cx={8 * f} cy={2} rx={62} ry={9} fill={`url(#${id}sh)`} /> : null}
			<g transform={`rotate(${(pose.lean ?? 0) * f},0,0)`}>
				{!pose.seated ? (
					<g>
						<path d={`M-17,${hipY + bob} Q-22,${hipY / 2} ${-24 - legSwing},-2`} stroke={INK} strokeWidth={STICK} fill="none" strokeLinecap="round" />
						<path d={`M17,${hipY + bob} Q22,${hipY / 2} ${24 + legSwing},-2`} stroke={INK} strokeWidth={STICK} fill="none" strokeLinecap="round" />
						<path d={`M${-24 - legSwing},-2 l14,0`} stroke={look.boots ?? INK} strokeWidth={9} strokeLinecap="round" />
						<path d={`M${24 + legSwing},-2 l14,0`} stroke={look.boots ?? INK} strokeWidth={9} strokeLinecap="round" />
					</g>
				) : null}
				<g transform={`translate(0,${bob})`}>
					<OutfitShape o={look.outfit} id={id} />
					<g transform={`translate(2,${torsoTop - 36}) rotate(${pose.headTilt ?? 0})`}>
						{look.headwear === 'wig' || look.headwear === 'bun' ? <HeadwearShape kind={look.headwear} id={id} color={look.hatColor ?? '#f1ece6'} pop={0} /> : null}
						<Inked d={HEAD} fill={`url(#${id}h)`} />
						{look.wooden ? <path d="M-30,30 C-10,40 14,40 34,30 M-40,4 l8,0 M34,4 l8,0" stroke={tone(skin, 0.55)} strokeWidth={2} fill="none" /> : null}
						{pose.eyes === 'lidded' ? (
							<g>
								<path d={`M${-14 + lookX},16 l11,0 M${11 + lookX},16 l11,0`} stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
								<path d={`M${-13 + lookX},17 a5,5 0 0 0 9,0 Z M${12 + lookX},17 a5,5 0 0 0 9,0 Z`} fill={INK} />
							</g>
						) : pose.eyes === 'closed' ? (
							<path d={`M${-14 + lookX},17 q5,4 10,0 M${11 + lookX},17 q5,4 10,0`} stroke={INK} strokeWidth={2.4} fill="none" strokeLinecap="round" />
						) : (
							<g>
								<circle cx={-9 + lookX} cy={16} r={eyeR} fill="#fffefc" stroke={INK} strokeWidth={2.1} />
								<circle cx={16 + lookX} cy={16} r={eyeR} fill="#fffefc" stroke={INK} strokeWidth={2.1} />
								<circle cx={-8 + lookX * 1.25} cy={16.5} r={2.3} fill={INK} />
								<circle cx={16 + lookX * 1.25} cy={16.5} r={2.3} fill={INK} />
								{pose.eyes === 'angry' ? <path d={`M${-17 + lookX},6 l14,5 M${24 + lookX},6 l-14,5`} stroke={INK} strokeWidth={3} strokeLinecap="round" /> : null}
							</g>
						)}
						{look.beard ? <Inked d={`M-40,${20} C-40,58 -10,82 4,84 C20,82 46,58 44,20 C30,30 18,34 4,34 C-12,34 -28,30 -40,20 Z`} fill={look.beard} thin={1.8} heavy={2.6} /> : null}
						{look.moustache ? <path d={`M${-8 + lookX},26 q6,-6 12,0 q6,-6 12,0 q-6,6 -12,1 q-6,5 -12,-1 Z`} fill="#3a2a22" stroke={INK} strokeWidth={1.2} /> : null}
						{pose.mouth === 'o' ? (
							<ellipse cx={4 + lookX} cy={32} rx={4} ry={5} fill={INK} />
						) : pose.mouth === 'smile' ? (
							<path d={`M${-3 + lookX},30 q7,6 14,0`} stroke={INK} strokeWidth={2.2} fill="none" strokeLinecap="round" />
						) : pose.mouth === 'grin' ? (
							<path d={`M${-6 + lookX},29 q10,12 20,0 Z`} fill={INK} />
						) : pose.mouth === 'frown' ? (
							<path d={`M${-3 + lookX},33 q7,-6 14,0`} stroke={INK} strokeWidth={2.2} fill="none" strokeLinecap="round" />
						) : pose.mouth === 'wobble' ? (
							<path d={`M${-3 + lookX},31 q3.5,-3 7,0 q3.5,3 7,0`} stroke={INK} strokeWidth={2.2} fill="none" strokeLinecap="round" />
						) : (
							<path d={`M${-1 + lookX},31 l9,0`} stroke={INK} strokeWidth={2.2} strokeLinecap="round" />
						)}
						{look.headwear && look.headwear !== 'none' && look.headwear !== 'wig' && look.headwear !== 'bun' ? (
							<g transform="translate(0,-6)">
								<HeadwearShape kind={look.headwear} id={id} color={look.hatColor ?? '#c99a5e'} pop={pose.hatPop ?? 0} />
							</g>
						) : null}
					</g>
					{A.map((a, i) => (
						<g key={i}>
							<path d={`M${a.sx},${a.sy} Q${a.cx},${a.cy} ${a.ex},${a.ey}`} stroke={INK} strokeWidth={STICK} fill="none" strokeLinecap="round" />
							{(i === 1 ? holdR : holdL) ? <g transform={`translate(${a.ex},${a.ey})`}>{i === 1 ? holdR : holdL}</g> : null}
							<circle cx={a.ex} cy={a.ey} r={7} fill={INK} />
						</g>
					))}
				</g>
			</g>
		</g>
	);
};
