import React from 'react';
import {C, SANS, SERIF} from '../theme';
import {fr, inOut, useTimeline} from '../anim';
import {center, Heading, Kicker, Rise} from '../components/ui';

export const Marche: React.FC = () => {
  const {p} = useTimeline();
  const rows: [string, string, string, number][] = [
    ['≈ ' + fr(4 * p(1, 1.4, inOut)) + ' Md€', 'de chiffre d’affaires', C.ink, 1],
    ['≈ ' + fr(4 * p(2.6, 1.4, inOut)) + ' M', 'de patients suivis', C.teal, 2.6],
    [fr(33000 * p(4.2, 1.4, inOut)), 'emplois', C.ver, 4.2],
  ];
  const bar = p(6.2, 1.4, inOut);
  return (
    <>
      <Kicker n={3} label="Le marché en France" />
      <Heading l1="Un marché" l2="de taille" />
      {rows.map(([value, label, color, at], i) => (
        <Rise key={label} at={at - 0.2} dur={0.6} style={{...center, top: 670 + i * 270}}>
          <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 150, lineHeight: 1.1, color}}>{value}</div>
          <div style={{fontFamily: SANS, fontWeight: 300, fontSize: 34, color: C.muted}}>{label}</div>
        </Rise>
      ))}
      <Rise at={6} dy={0} style={{position: 'absolute', left: 140, top: 1560, width: 800}}>
        <div style={{height: 22, borderRadius: 11, background: C.paper2}}>
          <div style={{height: 22, borderRadius: 11, width: `${62.5 * bar}%`, background: C.teal}} />
        </div>
        <div style={{marginTop: 30, textAlign: 'center', fontFamily: SANS, fontWeight: 500, fontSize: 32, color: C.ink}}>dont 2,5 M pour des maladies respiratoires</div>
      </Rise>
    </>
  );
};
