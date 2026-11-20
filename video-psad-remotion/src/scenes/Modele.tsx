import React from 'react';
import {C, DISPLAY, SERIF} from '../theme';
import {Heading, Kicker} from '../components/ui';
import {Counter, Impact, Pop, Sfx, Sticker, useSpringAt, SPRINGS} from '../fx';

// Douze semaines = douze forfaits qui « tombent » un par un, avec un petit tic sonore
const Card: React.FC<{i: number}> = ({i}) => {
  const at = 1 + i * 0.16;
  const s = useSpringAt(at, SPRINGS.slam);
  const x = 150 + (i % 4) * 200;
  const y = 650 + Math.floor(i / 4) * 215;
  const rot = ((i * 37) % 9) - 4; // petite inclinaison différente pour chaque carte
  return (
    <div style={{position: 'absolute', left: x, top: y - 120 * (1 - s), width: 180, height: 195, borderRadius: 24, background: '#fff', border: `3px solid ${C.teal}`, boxShadow: '0 10px 24px rgba(31,122,104,.18)', opacity: Math.min(1, s * 2), transform: `rotate(${rot * (1 - Math.min(1, s)) + rot * 0.15}deg) scale(${0.6 + 0.4 * s})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2}}>
      <div style={{fontFamily: DISPLAY, fontWeight: 600, fontSize: 24, color: C.muted}}>sem. {i + 1}</div>
      <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 84, color: C.teal, lineHeight: 1}}>€</div>
    </div>
  );
};

export const Modele: React.FC = () => (
  <Impact hits={[3.2]} strength={0.7}>
    <Kicker n={2} label="Le modèle" />
    <Heading l1="Un revenu" l2="récurrent" />
    {Array.from({length: 12}, (_, i) => <Card key={i} i={i} />)}
    {Array.from({length: 12}, (_, i) => <Sfx key={i} at={1 + i * 0.16} name="pop" volume={0.18} />)}
    <Sticker at={3.2} rotate={6} style={{right: 120, top: 595, fontSize: 40}}>
      × <Counter at={3.2} to={52} dur={0.9} format={(v) => String(Math.round(v))} /> par an
    </Sticker>
    <Sfx at={3.2} name="impact" volume={0.45} />
    <Pop at={3.6} style={{position: 'absolute', top: 1340, width: '100%', textAlign: 'center', fontFamily: DISPLAY, fontWeight: 900, fontSize: 64, letterSpacing: -2, color: C.ink}}>1 patient traité</Pop>
    <Pop at={3.9} style={{position: 'absolute', top: 1425, width: '100%', textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 60, color: C.ver}}>= 1 forfait chaque semaine</Pop>
  </Impact>
);
