import React from 'react';
import {INK, Inked, Vinyl, tone} from './Person';

let uid = 0;
const useId = (p: string) => React.useMemo(() => `${p}${uid++}`, []);
type Eyes = 'open' | 'lidded' | 'wide' | 'angry' | 'closed';
const Face: React.FC<{x: number; y: number; look?: number; eyes?: Eyes; mouth?: 'dash' | 'o' | 'smile' | 'frown' | 'wobble'; r?: number}> = ({x, y, look = 0.6, eyes = 'open', mouth = 'dash', r = 5.6}) => {
	const lx = look * 6;
	return (
		<g transform={`translate(${x},${y})`}>
			{eyes === 'lidded' ? (
				<g>
					<path d={`M${-14 + lx},0 l11,0 M${11 + lx},0 l11,0`} stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
					<path d={`M${-13 + lx},1 a5,5 0 0 0 9,0 Z M${12 + lx},1 a5,5 0 0 0 9,0 Z`} fill={INK} />
				</g>
			) : eyes === 'closed' ? (
				<path d={`M${-14 + lx},1 q5,4 10,0 M${11 + lx},1 q5,4 10,0`} stroke={INK} strokeWidth={2.4} fill="none" strokeLinecap="round" />
			) : (
				<g>
					{[-9, 16].map((ex) => (
						<g key={ex}>
							<circle cx={ex + lx} cy={0} r={eyes === 'wide' ? r * 1.35 : r} fill="#fffefc" stroke={INK} strokeWidth={2.1} />
							<circle cx={ex + 1 + lx * 1.25} cy={0.5} r={2.3} fill={INK} />
						</g>
					))}
					{eyes === 'angry' ? <path d={`M${-17 + lx},-10 l14,5 M${24 + lx},-10 l-14,5`} stroke={INK} strokeWidth={3} strokeLinecap="round" /> : null}
				</g>
			)}
			{mouth === 'o' ? (
				<ellipse cx={4 + lx} cy={16} rx={4} ry={5} fill={INK} />
			) : mouth === 'smile' ? (
				<path d={`M${-3 + lx},14 q7,6 14,0`} stroke={INK} strokeWidth={2.2} fill="none" strokeLinecap="round" />
			) : mouth === 'frown' ? (
				<path d={`M${-3 + lx},18 q7,-6 14,0`} stroke={INK} strokeWidth={2.2} fill="none" strokeLinecap="round" />
			) : mouth === 'wobble' ? (
				<path d={`M${-3 + lx},16 q3.5,-3 7,0 q3.5,3 7,0`} stroke={INK} strokeWidth={2.2} fill="none" strokeLinecap="round" />
			) : (
				<path d={`M${-1 + lx},15 l9,0`} stroke={INK} strokeWidth={2.2} strokeLinecap="round" />
			)}
		</g>
	);
};
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
const arm = (side: -1 | 1, sx: number, sy: number, ex: number, ey: number, out = 8) => {
	const mx = (sx + ex) / 2, my = (sy + ey) / 2;
	const dx = ex - sx, dy = ey - sy, L = Math.hypot(dx, dy) || 1;
	let nx = -dy / L, ny = dx / L;
	if (nx * side < 0) {
		nx = -nx;
		ny = -ny;
	}
	return `M${sx},${sy} Q${mx + nx * out},${my + ny * out} ${ex},${ey}`;
};

// SOCK: a standing tube sock (cuff at the top, heel bend at the bottom). Native height 240.
export const Sock: React.FC<{x: number; y: number; h: number; color: string; stripe: string; facing?: 1 | -1; t?: number; eyes?: Eyes; mouth?: 'dash' | 'o' | 'smile' | 'frown' | 'wobble'; hop?: number; arms?: [number, number]; squash?: number; spin?: number; look?: number}> = ({x, y, h, color, stripe, facing = 1, t = 0, eyes = 'open', mouth = 'dash', hop = 0, arms = [20, 20], squash = 0, spin = 0, look = 0.6}) => {
	const id = useId('sk');
	const s = h / 240;
	const body = 'M-38,-232 C-40,-150 -40,-90 -38,-40 C-38,-12 -20,0 10,0 L58,0 C76,0 82,-26 66,-36 C52,-44 40,-46 38,-60 C36,-120 38,-180 38,-232 Z';
	const sy = 1 - squash * 0.15, sx = 1 + squash * 0.12;
	const armPath = (side: -1 | 1, a: number) => {
		const sxx = side * 37, syy = -150;
		const rad = (a * Math.PI) / 180;
		return arm(side, sxx, syy, sxx + side * Math.sin(rad) * 70, syy + Math.cos(rad) * 70);
	};
	const endP = (side: -1 | 1, a: number) => {
		const rad = (a * Math.PI) / 180;
		return [side * 37 + side * Math.sin(rad) * 70, -150 + Math.cos(rad) * 70];
	};
	return (
		<g transform={`translate(${x},${y - hop}) rotate(${spin}) scale(${s * facing * sx},${s * sy})`}>
			<defs>
				<Vinyl id={`${id}b`} light={tone(color, 1.35)} mid={color} shade={tone(color, 0.6)} />
				<clipPath id={`${id}c`}>
					<path d={body} />
				</clipPath>
			</defs>
			{hop < 5 ? <Shadow id={id} rx={60} /> : null}
			<Inked d={body} fill={`url(#${id}b)`} />
			<g clipPath={`url(#${id}c)`}>
				{[-200, -176].map((yy) => <rect key={yy} x={-50} y={yy} width={100} height={12} fill={stripe} />)}
				<rect x={-50} y={-240} width={100} height={22} fill={tone(color, 1.25)} />
				<path d="M-40,-232 l8,22 l8,-22 l8,22 l8,-22 l8,22 l8,-22 l8,22 l8,-22 l8,22" stroke={tone(color, 0.75)} strokeWidth={1.5} fill="none" opacity={0.6} />
				<path d="M30,-10 C46,-8 60,-14 64,-28" stroke={tone(color, 0.7)} strokeWidth={10} fill="none" opacity={0.6} />
			</g>
			<path d="M36,-200 C40,-140 40,-80 38,-60" stroke={tone(color, 1.6)} strokeWidth={3} fill="none" opacity={0.5} />
			<Face x={0} y={-168} eyes={eyes} mouth={mouth} look={look} />
			{([-1, 1] as const).map((side, i) => {
				const [ex, ey] = endP(side, arms[i] + Math.sin(t * 0.2 + i) * 2);
				return (
					<g key={side}>
						<path d={armPath(side, arms[i] + Math.sin(t * 0.2 + i) * 2)} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />
						<circle cx={ex} cy={ey} r={7} fill={INK} />
					</g>
				);
			})}
		</g>
	);
};

// SNOWMAN: big snowball base, gumdrop snow torso, wide snow head, stick-branch arms from the torso
// outline, coal-dot eyes, carrot nose, scarf, optional sunglasses. Native height 300.
export const Snowman: React.FC<{x: number; y: number; h: number; facing?: 1 | -1; t?: number; eyes?: Eyes; mouth?: 'dash' | 'o' | 'smile' | 'frown' | 'wobble'; shades?: number; hop?: number; armL?: number; armR?: number; handR?: [number, number]; holdR?: React.ReactNode; tilt?: number; look?: number}> = ({x, y, h, facing = 1, t = 0, eyes = 'open', mouth = 'dash', shades = 0, hop = 0, armL = 40, armR = 40, handR, holdR, tilt = 0, look = 0.6}) => {
	const id = useId('sn');
	const s = h / 300;
	const twig = (side: -1 | 1, a: number, target?: [number, number]) => {
		const sx = side * 44, sy = -170;
		const rad = (a * Math.PI) / 180;
		const [ex, ey] = target ?? [sx + side * Math.sin(rad) * 86, sy + Math.cos(rad) * 86];
		return {d: arm(side, sx, sy, ex, ey, 6), ex, ey, sx, sy};
	};
	const L = twig(-1, armL), R = twig(1, armR, handR);
	return (
		<g transform={`translate(${x},${y - hop}) scale(${s * facing},${s})`}>
			<defs>
				<Vinyl id={`${id}s`} light="#ffffff" mid="#f2f4fb" shade="#b9c2e6" />
				<Vinyl id={`${id}sc`} light="#ff7a6a" mid="#d8323a" shade="#7e1c2a" />
			</defs>
			{hop < 5 ? <Shadow id={id} rx={70} /> : null}
			<g transform={`rotate(${tilt},0,0)`}>
				<Inked d="M-64,-44 C-64,-84 -32,-104 0,-104 C34,-104 66,-84 66,-44 C66,-10 36,2 0,2 C-34,2 -64,-10 -64,-44 Z" fill={`url(#${id}s)`} />
				{[L, R].map((A, i) => (
					<g key={i}>
						<path d={A.d} stroke="#5a3a26" strokeWidth={6} fill="none" strokeLinecap="round" />
						<path d={`M${A.ex},${A.ey} l${(i ? 1 : -1) * 12},-10 M${A.ex},${A.ey} l${(i ? 1 : -1) * 14},4`} stroke="#5a3a26" strokeWidth={4} strokeLinecap="round" />
						{i === 1 && holdR ? <g transform={`translate(${A.ex},${A.ey})`}>{holdR}</g> : null}
					</g>
				))}
				<Inked d="M-48,-150 C-50,-196 -26,-210 0,-210 C26,-210 52,-196 50,-150 L52,-112 C52,-94 30,-90 0,-90 C-30,-90 -52,-94 -50,-112 Z" fill={`url(#${id}s)`} />
				{[-180, -150, -120].map((cy) => <circle key={cy} cx={4} cy={cy} r={4.5} fill={INK} />)}
				{/* scarf */}
				<Inked d="M-50,-212 C-20,-202 26,-202 52,-214 L54,-196 C26,-184 -22,-184 -50,-194 Z" fill={`url(#${id}sc)`} thin={1.6} heavy={2.2} />
				<Inked d={`M30,-200 C40,-180 44,-160 ${40 + Math.sin(t * 0.25) * 4},-140 L56,-142 C58,-166 52,-186 44,-204 Z`} fill={`url(#${id}sc)`} thin={1.6} heavy={2.2} />
				<g transform="translate(2,-250)">
					<Inked d="M0,-46 C30,-47 52,-30 52,-2 C52,24 34,44 2,45 C-32,45 -50,26 -50,-1 C-50,-29 -29,-46 0,-46 Z" fill={`url(#${id}s)`} />
					<Face x={0} y={8} eyes={eyes} mouth={mouth} look={look} />
					<path d={`M${8 + look * 6},20 L46,26 L${8 + look * 6},30 Z`} fill="#f08a2a" stroke={INK} strokeWidth={1.8} strokeLinejoin="round" />
					{shades > 0 ? (
						<g transform={`translate(${look * 6},${8 - (1 - shades) * 60})`} opacity={shades}>
							<path d="M-24,-8 h26 v10 q-2,10 -13,10 q-11,0 -13,-10 Z M8,-8 h26 v10 q-2,10 -13,10 q-11,0 -13,-10 Z" fill="#1c1a24" stroke={INK} strokeWidth={2} />
							<path d="M2,-6 h6" stroke={INK} strokeWidth={3} />
							<path d="M-18,-4 l6,0" stroke="#7fa8ff" strokeWidth={2.5} strokeLinecap="round" />
						</g>
					) : null}
				</g>
			</g>
		</g>
	);
};

// CAT: sitting cat, side-ish view, deadpan glowing eyes. Native height 200.
export const Cat: React.FC<{x: number; y: number; h: number; facing?: 1 | -1; t?: number; eyes?: Eyes; glow?: number; color?: string}> = ({x, y, h, facing = 1, t = 0, eyes = 'lidded', glow = 0, color = '#3a3448'}) => {
	const id = useId('cat');
	const s = h / 200;
	return (
		<g transform={`translate(${x},${y}) scale(${s * facing},${s})`}>
			<defs>
				<Vinyl id={`${id}b`} light={tone(color, 1.6)} mid={color} shade={tone(color, 0.55)} />
			</defs>
			<Shadow id={id} rx={56} />
			<path d={`M-44,-12 C-80,-20 -86,-60 -70,${-80 + Math.sin(t * 0.15) * 8}`} stroke={INK} strokeWidth={16} fill="none" strokeLinecap="round" />
			<path d={`M-44,-12 C-80,-20 -86,-60 -70,${-80 + Math.sin(t * 0.15) * 8}`} stroke={color} strokeWidth={9} fill="none" strokeLinecap="round" />
			<Inked d="M-48,-4 C-56,-60 -36,-110 0,-112 C36,-110 54,-60 46,-4 C30,4 -32,4 -48,-4 Z" fill={`url(#${id}b)`} />
			<g transform="translate(4,-140)">
				<Inked d="M-44,-20 L-40,-62 L-14,-40 C-6,-42 6,-42 14,-40 L40,-62 L44,-20 C48,12 26,30 0,30 C-26,30 -48,12 -44,-20 Z" fill={`url(#${id}b)`} />
				
				{eyes === 'lidded' ? (
					<g>
						<path d="M-26,-8 h18 M8,-8 h18" stroke={INK} strokeWidth={3} strokeLinecap="round" />
						<path d="M-24,-7 a8,6 0 0 0 14,0 Z M10,-7 a8,6 0 0 0 14,0 Z" fill={glow > 0 ? '#ffe14d' : INK} stroke={INK} strokeWidth={1.4} />
					</g>
				) : (
					<g>
						<ellipse cx={-16} cy={-6} rx={11} ry={12} fill={glow > 0 ? '#ffe14d' : '#fffefc'} stroke={INK} strokeWidth={2.4} />
						<ellipse cx={16} cy={-6} rx={11} ry={12} fill={glow > 0 ? '#ffe14d' : '#fffefc'} stroke={INK} strokeWidth={2.4} />
						<ellipse cx={-16} cy={-6} rx={2.6} ry={9} fill={INK} />
						<ellipse cx={16} cy={-6} rx={2.6} ry={9} fill={INK} />
					</g>
				)}
				<path d="M-4,8 l4,4 l4,-4 Z" fill="#e88a9a" />
				<path d="M-22,10 l-26,-4 M-22,14 l-26,4 M22,10 l26,-4 M22,14 l26,4" stroke={INK} strokeWidth={1.6} />
			</g>
		</g>
	);
};
