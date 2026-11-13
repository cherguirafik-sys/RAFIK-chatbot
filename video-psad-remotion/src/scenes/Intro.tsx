import React from 'react';
import {C, SANS, SERIF} from '../theme';
import {useTimeline} from '../anim';
import {center, Cross, Rise, Rule} from '../components/ui';

// Ouverture : dessin au trait d'un patient sous appareil contre l'apnée du sommeil
export const Intro: React.FC = () => {
  const {t, p} = useTimeline();
  const k = p(0.2, 1.2);
  const z = (t * 0.7) % 1;
  return (
    <>
      <svg width={1080} height={800} style={{position: 'absolute', top: 260, opacity: k, transform: `translateY(${30 * (1 - k)}px)`}}>
        <g transform="translate(280 210)" stroke={C.ink} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M20 240 V130 M20 200 H380 V250 M20 170 H380" />
          <circle cx={80} cy={138} r={26} />
          <path d="M100 140 Q122 140 124 152" />
          <path d="M124 150 C200 60 340 60 420 140" stroke={C.teal} />
          <rect x={410} y={130} width={90} height={52} rx={10} />
          <circle cx={440} cy={156} r={9} fill={C.teal} stroke="none" />
        </g>
        <text x={420 + z * 40} y={210 - z * 50} fontFamily={SERIF} fontStyle="italic" fontSize={54} fill={C.teal} opacity={1 - z}>z</text>
        <text x={460 + z * 30} y={180 - z * 40} fontFamily={SERIF} fontStyle="italic" fontSize={40} fill={C.teal} opacity={(1 - z) * 0.7}>z</text>
      </svg>
      <Cross x={830} y={430} size={44} at={0.8} />
      <Rise at={0.7} style={{...center, top: 900}}>
        <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 132, color: C.ink}}>Prestataires</div>
      </Rise>
      <Rise at={1.1} style={{...center, top: 1050}}>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500, fontSize: 104, color: C.ver}}>de santé à domicile</div>
      </Rise>
      <Rule at={1.6} width={420} top={1240} />
      <Rise at={2} style={{...center, top: 1300, fontFamily: SANS, fontWeight: 300, fontSize: 38, color: C.muted}}>Le business de</Rise>
      <Rise at={2.2} style={{...center, top: 1360, fontFamily: SANS, fontWeight: 700, fontSize: 46, color: C.ink}}>Bastide Le Confort Médical</Rise>
    </>
  );
};
