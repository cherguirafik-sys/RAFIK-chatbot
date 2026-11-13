import React from 'react';
import {C, SANS, SERIF} from '../theme';
import {fr, inOut, useTimeline} from '../anim';
import {Heading, Kicker, Rise} from '../components/ui';

// Effet ciseaux : coûts qui montent, tarifs qui baissent (schéma de principe)
export const Risque: React.FC = () => {
  const {p} = useTimeline();
  const k = p(1.2, 3, inOut);
  const x0 = 140, x1 = 940, y0 = 900;
  const curve = (dir: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 60 * k; i++) {
      const q = i / 60;
      pts.push(`${x0 + (x1 - x0) * q},${y0 + dir * 190 * Math.pow(q, 1.5)}`);
    }
    return pts.join(' ');
  };
  const card = p(6.5, 0.8);
  return (
    <>
      <Kicker n={7} label="Le risque n°1" />
      <Heading l1="L’État fixe les prix" l2="… et les baisse" />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <line x1={x0} y1={y0} x2={x1} y2={y0} stroke={C.rule} strokeWidth={2} strokeDasharray="8 10" />
        <polyline points={curve(-1)} fill="none" stroke={C.ver} strokeWidth={7} strokeLinecap="round" />
        <polyline points={curve(1)} fill="none" stroke={C.blue} strokeWidth={7} strokeLinecap="round" />
      </svg>
      <Rise at={3.6} dy={0} style={{position: 'absolute', right: 140, top: y0 - 270, fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 50, color: C.ver}}>coûts : inflation +20 %</Rise>
      <Rise at={3.6} dy={0} style={{position: 'absolute', right: 140, top: y0 + 205, fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 50, color: C.blue}}>
        tarifs : −{fr(722 * p(3.6, 2))} M€ en 10 ans
      </Rise>
      <div style={{position: 'absolute', left: 140, top: 1300 + 30 * (1 - card), width: 800, height: 320, borderRadius: 24, background: C.verSoft, opacity: card, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 26, letterSpacing: 6, color: C.ver}}>AVRIL 2026</div>
        <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 150, color: C.ver, lineHeight: 1.05}}>−4 %</div>
        <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 34, color: C.ink}}>sur l’apnée du sommeil</div>
      </div>
    </>
  );
};
