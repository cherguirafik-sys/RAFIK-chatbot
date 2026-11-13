import React from 'react';
import {C, SANS, SERIF} from '../theme';
import {useTimeline} from '../anim';
import {center, Heading, Kicker, Rise} from '../components/ui';

// Douze semaines = douze forfaits qui tombent un par un
export const Modele: React.FC = () => {
  const {p} = useTimeline();
  return (
    <>
      <Kicker n={2} label="Le modèle" />
      <Heading l1="Un revenu" l2="récurrent" />
      {Array.from({length: 12}, (_, i) => {
        const k = p(1 + i * 0.18, 0.5);
        const x = 170 + (i % 4) * 190;
        const y = 760 + Math.floor(i / 4) * 230 - 40 * (1 - k);
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, width: 170, height: 200, borderRadius: 20, background: C.tealSoft, border: `2px solid ${C.teal}`, opacity: k, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4}}>
            <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 24, color: C.muted}}>sem. {i + 1}</div>
            <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 90, color: C.teal, lineHeight: 1}}>€</div>
          </div>
        );
      })}
      <Rise at={3.5} style={{...center, top: 1520, fontFamily: SERIF, fontWeight: 700, fontSize: 62, color: C.ink}}>1 patient traité</Rise>
      <Rise at={3.9} style={{...center, top: 1600, fontFamily: SERIF, fontStyle: 'italic', fontSize: 56, color: C.ver}}>= 1 forfait chaque semaine</Rise>
    </>
  );
};
