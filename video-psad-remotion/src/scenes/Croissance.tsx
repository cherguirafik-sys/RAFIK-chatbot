import React from 'react';
import {C, SANS, SERIF} from '../theme';
import {fr, inOut, useTimeline} from '../anim';
import {Heading, Kicker, Rise} from '../components/ui';

const ROWS: [string, number, string][] = [
  ['Diabète', 24.3, C.ver],
  ['Respiratoire', 11.1, C.teal],
  ['Santé à domicile', 9.9, C.blue],
  ['Maintien à domicile', 5.2, C.muted],
];

// Barres à l'échelle : 1 point de croissance = 24 px
export const Croissance: React.FC = () => {
  const {p} = useTimeline();
  return (
    <>
      <Kicker n={5} label="La croissance sur un an" />
      <Heading l1="Ça pousse" l2="fort" />
      {ROWS.map(([name, v, color], i) => {
        const k = p(0.8 + i * 0.35, 1.4, inOut);
        const y = 690 + i * 240;
        return (
          <div key={name}>
            <Rise at={0.6 + i * 0.35} dur={0.5} dy={0} style={{position: 'absolute', left: 140, top: y - 10, fontFamily: SANS, fontWeight: 500, fontSize: 36, color: C.ink}}>{name}</Rise>
            <div style={{position: 'absolute', left: 140, top: y + 50, height: 60, borderRadius: 10, width: Math.max(2, v * 24 * k), background: color}} />
            <div style={{position: 'absolute', left: 160 + v * 24 * k, top: y + 28, opacity: Math.min(1, k * 3), fontFamily: SERIF, fontWeight: 700, fontSize: 70, color}}>+{fr(v * k, 1)} %</div>
          </div>
        );
      })}
    </>
  );
};
