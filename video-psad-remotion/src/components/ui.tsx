import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, SANS, SERIF, W} from '../theme';
import {prog} from '../anim';

// Fond commun : papier, filets haut/bas, en-tête, ligne ECG qui défile
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
      <div style={{position: 'absolute', left: 80, right: 80, top: 90, display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontWeight: 500, fontSize: 20, letterSpacing: 4, color: C.muted}}>
        <span>PRESTATAIRES DE SANTÉ À DOMICILE</span>
        <span>NOV. 2026</span>
      </div>
      <div style={{position: 'absolute', left: 80, right: 80, top: 140, height: 1, background: C.rule}} />
      <div style={{position: 'absolute', left: 80, right: 80, bottom: 140, height: 1, background: C.rule}} />
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

// Rubrique numérotée : « 03 — LE MARCHÉ »
export const Kicker: React.FC<{n: number; label: string}> = ({n, label}) => (
  <Rise at={0} dur={0.6} dy={0} style={{position: 'absolute', top: 230, width: '100%', textAlign: 'center', fontFamily: SANS, fontWeight: 500, fontSize: 28, letterSpacing: 7, color: C.teal}}>
    {`${String(n).padStart(2, '0')} — ${label}`.toUpperCase()}
  </Rise>
);

// Titre sur deux lignes : droite puis italique vermillon
export const Heading: React.FC<{l1: string; l2?: string; top?: number}> = ({l1, l2, top = 320}) => (
  <div style={{position: 'absolute', top, width: '100%', textAlign: 'center'}}>
    <Rise at={0.2}>
      <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 104, lineHeight: 1.05, color: C.ink}}>{l1}</div>
    </Rise>
    {l2 && (
      <Rise at={0.4}>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500, fontSize: 92, lineHeight: 1.15, color: C.ver}}>{l2}</div>
      </Rise>
    )}
  </div>
);

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
