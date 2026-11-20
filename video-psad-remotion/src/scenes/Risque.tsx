import React from 'react';
import {C, DISPLAY, SANS} from '../theme';
import {fr, inOut, useTimeline} from '../anim';
import {Kicker} from '../components/ui';
import {Impact, Pop, Sfx, Title, useSpringAt, SPRINGS} from '../fx';

// Effet ciseaux : coûts qui montent, tarifs qui baissent (schéma de principe)
export const Risque: React.FC = () => {
  const {t, p} = useTimeline();
  const k = p(1.4, 2.6, inOut);
  const x0 = 140, x1 = 900, y0 = 920;
  const curve = (dir: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 60 * k; i++) {
      const q = i / 60;
      pts.push(`${x0 + (x1 - x0) * q},${y0 + dir * 150 * Math.pow(q, 1.5)}`);
    }
    return pts.join(' ');
  };
  const end = (dir: number) => [x0 + (x1 - x0) * k, y0 + dir * 150 * Math.pow(k, 1.5)];
  // la carte d'alerte « s'écrase » à l'écran, puis clignote doucement
  const slam = useSpringAt(6.5, SPRINGS.slam);
  const blink = t > 7.2 ? 0.5 + 0.5 * Math.cos((t - 7.2) * 5) : 1;
  return (
    <Impact hits={[6.5]} strength={1.4}>
      <Kicker n={7} label="Le risque n°1" />
      <Title l1="L’État fixe les prix" l2="… et les baisse" size={92} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <line x1={x0} y1={y0} x2={x1} y2={y0} stroke={C.rule} strokeWidth={2} strokeDasharray="8 10" />
        <polyline points={curve(-1)} fill="none" stroke={C.ver} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={curve(1)} fill="none" stroke={C.blue} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
        {k > 0.02 && [-1, 1].map((d) => <circle key={d} cx={end(d)[0]} cy={end(d)[1]} r={14} fill={d < 0 ? C.ver : C.blue} />)}
      </svg>
      <Pop at={3.6} dy={0} from={0.6} style={{position: 'absolute', left: 140, top: y0 - 230, fontFamily: DISPLAY, fontWeight: 800, fontSize: 44, letterSpacing: -1, color: C.ver}}>↑ coûts : inflation +20 %</Pop>
      <Pop at={4.2} dy={0} from={0.6} style={{position: 'absolute', left: 140, top: y0 + 175, fontFamily: DISPLAY, fontWeight: 800, fontSize: 44, letterSpacing: -1, color: C.blue}}>
        ↓ tarifs : −{fr(722 * p(4.2, 1.6))} M€ en 10 ans
      </Pop>
      <Sfx at={3.6} name="pop" volume={0.3} />
      <Sfx at={4.2} name="pop" volume={0.3} />
      <div style={{position: 'absolute', left: 140, top: 1180, width: 800, height: 300, borderRadius: 28, background: C.ver, opacity: Math.min(1, slam * 2), transform: `scale(${2.2 - 1.2 * slam}) rotate(${-2 * slam}deg)`, boxShadow: `0 20px 60px ${C.ver}66`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff'}}>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: 6, opacity: blink}}>⚠ AVRIL 2026</div>
        <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 150, letterSpacing: -6, lineHeight: 1.05}}>−4 %</div>
        <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 34}}>sur l’apnée du sommeil</div>
      </div>
      <Sfx at={6.5} name="impact" volume={0.7} />
    </Impact>
  );
};
