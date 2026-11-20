import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, W} from '../theme';
import {prog} from '../anim';
import {Chip, LivingBackground, Title} from '../fx';

// Fond commun : papier, taches de couleur qui dérivent, ligne ECG qui défile
export const Paper: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const pts: string[] = [];
  for (let x = 80; x <= W - 80; x += 4) {
    const p = ((x + t * 180) % 360) / 360;
    let y = 1825;
    if (p > 0.4 && p < 0.44) y -= (p - 0.4) * 700;
    else if (p >= 0.44 && p < 0.48) y += (p - 0.44) * 1500 - 28;
    else if (p >= 0.48 && p < 0.52) y += 32 - (p - 0.48) * 800;
    pts.push(`${x},${y}`);
  }
  return (
    <AbsoluteFill style={{backgroundColor: C.paper}}>
      <LivingBackground />
      <svg width={W} height={1920} style={{position: 'absolute', inset: 0}}>
        <polyline points={pts.join(' ')} fill="none" stroke={C.teal} strokeOpacity={0.35} strokeWidth={2.5} />
      </svg>
      {children}
    </AbsoluteFill>
  );
};

// Apparition : fondu + légère montée
export const Rise: React.FC<{at: number; dur?: number; dy?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({at, dur = 0.8, dy = 24, style, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = prog(frame, fps, at, dur);
  return <div style={{opacity: k, transform: `translateY(${dy * (1 - k)}px)`, ...style}}>{children}</div>;
};

// Rubrique numérotée : capsule « 03 · LE MARCHÉ » (voir Chip dans fx.tsx)
export const Kicker: React.FC<{n: number; label: string}> = ({n, label}) => <Chip n={n} label={label} />;

// Titre : ligne 1 en gras mot par mot, ligne 2 en italique surlignée (voir Title dans fx.tsx)
export const Heading: React.FC<{l1: string; l2?: string; top?: number}> = ({l1, l2, top = 360}) => <Title l1={l1} l2={l2} top={top} />;

// Filet central qui se déploie
export const Rule: React.FC<{at: number; width: number; top: number}> = ({at, width, top}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = prog(frame, fps, at, 0.9);
  return <div style={{position: 'absolute', top, left: (W - width * k) / 2, width: width * k, height: 2, background: C.ink}} />;
};

// Petite croix médicale
export const Cross: React.FC<{x: number; y: number; size: number; at: number}> = ({x, y, size, at}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = prog(frame, fps, at, 0.6);
  const s = size;
  return (
    <svg width={s} height={s} style={{position: 'absolute', left: x - s / 2, top: y - s / 2, opacity: k}}>
      <rect x={s / 3} y={0} width={s / 3} height={s} fill={C.ver} />
      <rect x={0} y={s / 3} width={s} height={s / 3} fill={C.ver} />
    </svg>
  );
};

export const center: React.CSSProperties = {position: 'absolute', width: '100%', textAlign: 'center'};
