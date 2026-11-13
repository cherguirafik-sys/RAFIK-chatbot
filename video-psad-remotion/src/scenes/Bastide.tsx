import React from 'react';
import {C, SANS, SERIF} from '../theme';
import {fr, inOut, useTimeline} from '../anim';
import {center, Heading, Kicker, Rise} from '../components/ui';

// Anneau du chiffre d'affaires : 58,2 % santé à domicile, 41,8 % maintien à domicile
export const Bastide: React.FC = () => {
  const {p} = useTimeline();
  const k = p(1, 2.2, inOut);
  const r = 230;
  const circ = 2 * Math.PI * r;
  return (
    <>
      <Kicker n={4} label="L’exemple · 2025-2026" />
      <Heading l1="Bastide" l2="Le Confort Médical" />
      <svg width={1080} height={600} style={{position: 'absolute', top: 630}}>
        <g transform="translate(540 300) rotate(-90)" fill="none" strokeWidth={70}>
          <circle r={r} stroke={C.verSoft} />
          <circle r={r} stroke={C.ver} strokeDasharray={`${circ * k} ${circ}`} />
          <circle r={r} stroke={C.teal} strokeDasharray={`${circ * 0.582 * k} ${circ}`} />
        </g>
      </svg>
      <div style={{...center, top: 830}}>
        <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 150, color: C.ink, lineHeight: 1}}>{fr(482 * p(1, 2.2))}</div>
        <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 28, color: C.muted, marginTop: 10}}>M€ de chiffre d’affaires</div>
      </div>
      {[
        ['58 %', 'santé à domicile', '280,8 M€', C.teal, 3.6, 300],
        ['42 %', 'maintien à domicile', '201,7 M€', C.ver, 4.6, 780],
      ].map(([pct, label, amount, color, at, x]) => (
        <Rise key={label as string} at={at as number} style={{position: 'absolute', top: 1290, left: (x as number) - 250, width: 500, textAlign: 'center'}}>
          <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 110, color: color as string, lineHeight: 1}}>{pct}</div>
          <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 32, color: C.ink, marginTop: 14}}>{label}</div>
          <div style={{fontFamily: SANS, fontWeight: 300, fontSize: 30, color: C.muted}}>{amount}</div>
        </Rise>
      ))}
      <Rise at={6} style={{...center, top: 1600, padding: '0 110px', boxSizing: 'border-box', fontFamily: SANS, fontWeight: 300, fontSize: 34, color: C.muted, lineHeight: 1.35}}>
        Respiratoire, perfusion, nutrition, diabète d’un côté ; lits, fauteuils et aides techniques de l’autre.
      </Rise>
    </>
  );
};
