import React from 'react';
import {INK, Inked, Vinyl, tone} from './Person';

let uid = 0;
const useId = (p: string) => React.useMemo(() => `${p}${uid++}`, []);
const Shadow: React.FC<{id: string; rx: number}> = ({id, rx}) => (
	<>
		<defs>
			<radialGradient id={`${id}sh`}>
				<stop offset="0" stopColor="#1d1430" stopOpacity="0.38" />
				<stop offset="1" stopColor="#1d1430" stopOpacity="0" />
			</radialGradient>
		</defs>
		<ellipse cx={6} cy={2} rx={rx} ry={rx * 0.14} fill={`url(#${id}sh)`} />
	</>
);
const Eye: React.FC<{x: number; y: number; r?: number; look?: number; mode?: 'open' | 'lidded' | 'wide' | 'angry'}> = ({x, y, r = 6, look = 1, mode = 'open'}) =>
	mode === 'lidded' ? (
		<g>
			<path d={`M${x - r},${y} l${r * 2},0`} stroke={INK} strokeWidth={2.2} strokeLinecap="round" />
			<path d={`M${x - r * 0.8},${y + 1} a${r * 0.8},${r * 0.8} 0 0 0 ${r * 1.6},0 Z`} fill={INK} />
		</g>
	) : (
		<g>
			<circle cx={x} cy={y} r={mode === 'wide' ? r * 1.3 : r} fill="#fffefc" stroke={INK} strokeWidth={2} />
			<circle cx={x + look * r * 0.35} cy={y + 0.5} r={r * 0.4} fill={INK} />
			{mode === 'angry' ? <path d={`M${x - r * 1.3},${y - r * 1.6} l${r * 2.4},${r * 0.8}`} stroke={INK} strokeWidth={3} strokeLinecap="round" /> : null}
		</g>
	);

type Common = {x: number; y: number; h: number; facing?: 1 | -1; t?: number};

// EMU: tall shaggy body, long neck, small head, long backward-knee legs. Native height 300.
export const Emu: React.FC<Common & {walk?: number; neck?: number; eyes?: 'open' | 'lidded' | 'wide' | 'angry'; peck?: number}> = ({x, y, h, facing = 1, t = 0, walk, neck = 0, eyes = 'open', peck = 0}) => {
	const id = useId('emu');
	const s = h / 300;
	const w = walk === undefined ? null : walk;
	const la = w === null ? 0 : Math.sin(w) * 26, lb = w === null ? 0 : Math.sin(w + Math.PI) * 26;
	const bob = w === null ? Math.sin(t * 0.15) * 1.5 : -Math.abs(Math.cos(w)) * 8;
	const leg = (hx: number, sw: number, k: number) => {
		const kneeX = hx + 14 + sw * 0.4, kneeY = -70, fx = hx + sw;
		return (
			<g key={k}>
				<path d={`M${hx},${-142 + bob} L${kneeX},${kneeY} L${fx},-4`} stroke={INK} strokeWidth={10} fill="none" strokeLinejoin="round" strokeLinecap="round" />
				<path d={`M${hx},${-142 + bob} L${kneeX},${kneeY} L${fx},-4`} stroke="#8a7a6a" strokeWidth={5} fill="none" strokeLinejoin="round" strokeLinecap="round" />
				<path d={`M${fx},-4 l16,0 M${fx},-4 l10,-6 M${fx},-4 l-8,0`} stroke={INK} strokeWidth={6} strokeLinecap="round" />
			</g>
		);
	};
	const nk = neck + peck * 40;
	return (
		<g transform={`translate(${x},${y}) scale(${s * facing},${s})`}>
			<defs>
				<Vinyl id={`${id}b`} light="#8f7a68" mid="#5e4c3f" shade="#2f2430" />
				<Vinyl id={`${id}n`} light="#a5b3c8" mid="#6f7f98" shade="#3c4560" />
			</defs>
			<Shadow id={id} rx={80} />
			{leg(-12, lb, 0)}
			{leg(12, la, 1)}
			<g transform={`translate(0,${-170 + bob})`}>
				{/* shaggy body: scalloped bottom edge */}
				<Inked d="M-78,-10 C-80,-50 -30,-66 18,-60 C58,-56 82,-30 78,0 C74,20 60,30 50,26 C46,40 34,36 30,30 C24,44 10,40 6,32 C-2,46 -16,40 -18,32 C-28,44 -40,38 -42,30 C-56,40 -66,30 -64,22 C-80,24 -80,8 -78,-10 Z" fill={`url(#${id}b)`} />
				<path d="M-50,-30 c10,8 22,8 30,0 M-10,-40 c10,8 22,8 30,0 M-36,-6 c10,8 22,8 30,0" stroke={tone('#5e4c3f', 0.65)} strokeWidth={2.4} fill="none" opacity={0.8} />
				{/* neck + head */}
				<g transform={`translate(52,-40) rotate(${nk})`}>
					<Inked d="M-10,6 C-8,-40 -2,-90 4,-118 C12,-120 20,-118 24,-112 C18,-80 14,-40 14,4 Z" fill={`url(#${id}n)`} thin={2} heavy={3} />
					<g transform="translate(14,-124)">
						<Inked d="M-18,0 C-18,-18 -4,-26 10,-24 C24,-22 30,-12 28,0 C26,12 12,16 0,14 C-12,12 -18,8 -18,0 Z" fill="#4c4a5c" thin={1.8} heavy={2.4} />
						<path d="M26,-2 L46,2 L26,8 Z" fill="#3a3030" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
						<Eye x={10} y={-6} r={6.5} mode={eyes} look={1} />
						<path d="M-14,-14 c-6,-8 -2,-14 4,-12" stroke={INK} strokeWidth={2} fill="none" />
					</g>
				</g>
			</g>
		</g>
	);
};

// Generic small bird (seagull / pigeon). Native height ~170, side view facing right.
export const Bird: React.FC<Common & {kind: 'gull' | 'pigeon'; eyes?: 'open' | 'lidded' | 'wide' | 'angry'; puff?: number; walk?: number; wing?: number; lean?: number}> = ({x, y, h, facing = 1, t = 0, kind, eyes = 'open', puff = 0, walk, wing = 0, lean = 0}) => {
	const id = useId('bd');
	const s = h / 170;
	const gull = kind === 'gull';
	const body = gull ? '#f7f5f2' : '#8e94a8';
	const wingC = gull ? '#b9c2cf' : '#6c7288';
	const legC = gull ? '#f0a23a' : '#e48b9a';
	const w = walk === undefined ? null : walk;
	const la = w === null ? 0 : Math.sin(w) * 12;
	const bob = w === null ? Math.sin(t * 0.2) * 1.2 : -Math.abs(Math.cos(w)) * 5;
	return (
		<g transform={`translate(${x},${y}) scale(${s * facing},${s})`}>
			<defs>
				<Vinyl id={`${id}b`} light={tone(body, 1.25)} mid={body} shade={gull ? '#cfc7dc' : tone(body, 0.55)} />
				<Vinyl id={`${id}w`} light={tone(wingC, 1.25)} mid={wingC} shade={tone(wingC, 0.6)} />
				<linearGradient id={`${id}n`} x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor="#5fb08a" />
					<stop offset="1" stopColor="#8a5fa8" />
				</linearGradient>
			</defs>
			<Shadow id={id} rx={48} />
			{[-8, 10].map((lx, i) => {
				const fx = lx + (i ? la : -la);
				return (
					<g key={lx}>
						<path d={`M${lx},-50 L${fx},-4`} stroke={INK} strokeWidth={8} strokeLinecap="round" />
						<path d={`M${lx},-50 L${fx},-4`} stroke={legC} strokeWidth={4} strokeLinecap="round" />
						<path d={`M${fx},-4 l12,1 M${fx},-4 l-8,2`} stroke={legC} strokeWidth={4.5} strokeLinecap="round" />
					</g>
				);
			})}
			<g transform={`translate(0,${-92 + bob}) rotate(${lean},0,30) scale(${1 + puff * 0.08})`}>
				{/* tail */}
				<Inked d={gull ? 'M-50,0 L-84,-12 L-80,6 L-86,16 L-50,16 Z' : 'M-50,0 L-82,-4 L-84,16 L-50,18 Z'} fill={gull ? '#2c2a30' : '#545a6e'} thin={1.6} heavy={2} />
				<Inked d="M-58,4 C-58,-28 -26,-44 8,-42 C40,-40 58,-20 56,8 C54,34 30,46 0,46 C-34,46 -58,30 -58,4 Z" fill={`url(#${id}b)`} />
				{!gull ? <path d="M18,-38 C34,-30 44,-16 44,2 C34,-6 24,-14 12,-18 Z" fill={`url(#${id}n)`} opacity={0.9} /> : null}
				<g transform={`translate(-6,4) rotate(${-wing * 60},24,-10)`}>
					<Inked d="M26,-12 C10,-24 -24,-24 -50,-6 C-42,4 -30,10 -14,12 C4,14 22,8 26,-12 Z" fill={`url(#${id}w)`} thin={1.8} heavy={2.4} />
					{gull ? <path d="M-50,-6 C-42,0 -36,4 -30,6 L-40,10 Z" fill="#2c2a30" /> : <path d="M-30,-4 l18,2 M-26,4 l18,2" stroke="#3a3e52" strokeWidth={4} strokeLinecap="round" />}
				</g>
				{/* head */}
				<g transform="translate(40,-46)">
					<Inked d="M-24,6 C-26,-18 -10,-30 6,-30 C24,-30 34,-16 32,2 C30,18 16,26 2,26 C-14,26 -24,18 -24,6 Z" fill={`url(#${id}b)`} />
					<path d={gull ? 'M30,-2 L54,2 C54,8 44,10 30,8 Z' : 'M30,-2 L44,1 L30,5 Z'} fill={gull ? '#f2c22e' : '#3a3438'} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
					{gull ? <circle cx={46} cy={6} r={2.6} fill="#d8362e" /> : <ellipse cx={30} cy={-5} rx={4} ry={3} fill="#efe9ee" stroke={INK} strokeWidth={1} />}
					<Eye x={14} y={-8} r={6} mode={eyes} />
				</g>
			</g>
		</g>
	);
};

// CRAB: round shell, stalk eyes, two claws. Native height ~110 (eye tips).
export const Crab: React.FC<Common & {peek?: number; snap?: number; eyes?: 'open' | 'lidded' | 'wide'}> = ({x, y, h, facing = 1, t = 0, peek = 1, snap = 0, eyes = 'lidded'}) => {
	const id = useId('cr');
	const s = h / 110;
	return (
		<g transform={`translate(${x},${y}) scale(${s * facing},${s})`}>
			<defs>
				<Vinyl id={`${id}b`} light="#ff8a5c" mid="#e0502e" shade="#8a2230" />
			</defs>
			<Shadow id={id} rx={60} />
			<g transform={`translate(0,${(1 - peek) * 70})`}>
				{[-1, 1].map((sd) => (
					<g key={sd}>
						{[0, 1, 2].map((i) => (
							<path key={i} d={`M${sd * 30},${-24 + i * 6} q${sd * 22},-6 ${sd * 30},${18 + i * 4}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
						))}
						<path d={`M${sd * 12},-48 L${sd * 16},-86`} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
						<Eye x={sd * 16} y={-92} r={8} mode={eyes} look={1} />
						<g transform={`translate(${sd * 50},-48) rotate(${sd * (-20 - snap * 25)})`}>
							<Inked d={`M0,0 C${sd * 6},-26 ${sd * 30},-30 ${sd * 34},-8 L${sd * 14},-8 L${sd * 30},4 C${sd * 22},14 ${sd * 4},12 0,0 Z`} fill={`url(#${id}b)`} thin={1.6} heavy={2.2} />
						</g>
					</g>
				))}
				<Inked d="M-46,-20 C-46,-50 -20,-58 0,-58 C20,-58 46,-50 46,-20 C46,-6 26,0 0,0 C-26,0 -46,-6 -46,-20 Z" fill={`url(#${id}b)`} />
				<path d="M-20,-34 q6,-4 12,0 M8,-34 q6,-4 12,0" stroke="#ffb08a" strokeWidth={3} fill="none" opacity={0.7} />
			</g>
		</g>
	);
};

// sprite helpers
export const Burst: React.FC<{x: number; y: number; o: number; r: number; color?: string}> = ({x, y, o, r, color = '#ffd34d'}) => (
	<g transform={`translate(${x},${y})`} opacity={o} stroke={color} strokeWidth={8} strokeLinecap="round">
		{[-60, -30, 0, 30, 60].map((a) => {
			const rad = ((a - 90) * Math.PI) / 180;
			return <path key={a} d={`M${Math.cos(rad) * r},${Math.sin(rad) * r} l${Math.cos(rad) * r * 0.45},${Math.sin(rad) * r * 0.45}`} />;
		})}
	</g>
);
export const Sparkle: React.FC<{x: number; y: number; s: number; o: number; rot?: number}> = ({x, y, s, o, rot = 0}) => (
	<g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} opacity={o}>
		<path d="M0,-20 C3,-4 4,-3 20,0 C4,3 3,4 0,20 C-3,4 -4,3 -20,0 C-4,-3 -3,-4 0,-20 Z" fill="#fff6c8" stroke="#e8b830" strokeWidth={2} />
	</g>
);
export const Dust: React.FC<{x: number; y: number; s: number; o: number}> = ({x, y, s, o}) => (
	<g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
		{[[-20, 0, 14], [0, -8, 18], [20, 0, 13]].map(([dx, dy, r], i) => <circle key={i} cx={dx} cy={dy} r={r} fill="#e8d2b4" stroke={INK} strokeWidth={2.5} />)}
	</g>
);
export const Question: React.FC<{x: number; y: number; s: number; o: number}> = ({x, y, s, o}) => (
	<g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
		<path d="M-14,-18 C-14,-34 14,-36 14,-18 C14,-6 0,-4 0,8" stroke={INK} strokeWidth={9} fill="none" strokeLinecap="round" />
		<circle cx={0} cy={24} r={6} fill={INK} />
	</g>
);
