import React from 'react';
import {C, SANS, SERIF} from '../theme';
import {fr, inOut, useTimeline} from '../anim';
import {center, Heading, Kicker, Rise} from '../components/ui';

// Résultat opérationnel courant : 1 M€ = 10 px de hauteur
export const Roc: React.FC = () => {
  const {p} = useTimeline();
  const base = 1180;
  const bars: [string, number, string, string, number][] = [
    ['2024-25', 41.2, C.paper2, C.ink, 0.8],
    ['2025-26', 44.2, C.teal, C.teal, 1.4],
  ];
  return (
    <>
      <Kicker n={6} label="La rentabilité" />
      <Heading l1="Résultat" l2="opérationnel courant" />
      {bars.map(([label, v, fill, stroke, at], i) => {
        const k = p(at, 1.4, inOut);
        const h = v * 10 * k;
        const x = 230 + i * 360;
        return (
          <div key={label}>
            <div style={{position: 'absolute', left: x, top: base - h, width: 260, height: h, borderRadius: 10, background: fill, border: `2px solid ${stroke}`, boxSizing: 'border-box'}} />
            <div style={{position: 'absolute', left: x, width: 260, top: base - h - 110, textAlign: 'center', fontFamily: SERIF, fontWeight: 700, fontSize: 80, color: i ? C.teal : C.ink}}>{fr(v * k, 1)}</div>
            <div style={{position: 'absolute', left: x, width: 260, top: base + 22, textAlign: 'center', fontFamily: SANS, fontWeight: 500, fontSize: 30, color: C.muted}}>{label}</div>
          </div>
        );
      })}
      <div style={{...center, top: base + 90, fontFamily: SANS, fontWeight: 300, fontSize: 28, color: C.muted}}>M€</div>
      <Rise at={3} style={{...center, top: 1360}}>
        <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 180, color: C.ver, lineHeight: 1}}>{fr(9.2 * p(3, 1.4, inOut), 1)} %</div>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 54, color: C.ink, marginTop: 20}}>de marge opérationnelle</div>
      </Rise>
    </>
  );
};
