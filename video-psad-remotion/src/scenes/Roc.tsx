import React from 'react';
import {C, DISPLAY, SANS, SERIF} from '../theme';
import {fr} from '../anim';
import {Heading, Kicker} from '../components/ui';
import {Counter, Impact, Pop, Sfx, Sticker, useSpringAt} from '../fx';

// Résultat opérationnel courant : 1 M€ = 8 px de hauteur
const BASE = 1080;
const Bar: React.FC<{i: number; label: string; v: number; fill: string; stroke: string; at: number}> = ({i, label, v, fill, stroke, at}) => {
  const s = useSpringAt(at, {damping: 14, stiffness: 80, mass: 1});
  const h = v * 8 * s;
  const x = 230 + i * 360;
  return (
    <>
      <div style={{position: 'absolute', left: x, top: BASE - h, width: 260, height: h, borderRadius: 16, background: fill, border: `3px solid ${stroke}`, boxSizing: 'border-box'}} />
      <div style={{position: 'absolute', left: x, width: 260, top: BASE - h - 100, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 900, fontSize: 76, letterSpacing: -3, color: i ? C.teal : C.ink, opacity: Math.min(1, s * 2), fontVariantNumeric: 'tabular-nums'}}>{fr(v * Math.min(1, s), 1)}</div>
      <div style={{position: 'absolute', left: x, width: 260, top: BASE + 20, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 30, color: C.muted}}>{label}</div>
    </>
  );
};

export const Roc: React.FC = () => (
  <Impact hits={[4.1]}>
    <Kicker n={6} label="La rentabilité" />
    <Heading l1="Résultat" l2="opérationnel courant" />
    <Bar i={0} label="2024-25" v={41.2} fill={C.paper2} stroke={C.ink} at={0.8} />
    <Bar i={1} label="2025-26" v={44.2} fill={C.teal} stroke={C.teal} at={1.4} />
    <Sticker at={2.3} rotate={-5} style={{left: 190, top: 860, fontSize: 34}}>+3 M€ en un an</Sticker>
    <Sfx at={2.3} name="pop" volume={0.35} />
    <div style={{position: 'absolute', top: BASE + 70, width: '100%', textAlign: 'center', fontFamily: SANS, fontWeight: 400, fontSize: 28, color: C.muted}}>en M€</div>
    <Pop at={3} from={0.4} style={{position: 'absolute', top: 1210, width: '100%', textAlign: 'center'}}>
      <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 170, letterSpacing: -6, color: C.ver, lineHeight: 1}}>
        <Counter at={3} to={9.2} dur={1.1} format={(v) => `${fr(v, 1)} %`} />
      </div>
      <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 54, color: C.ink, marginTop: 14}}>de marge opérationnelle</div>
    </Pop>
    <Sfx at={4.1} name="impact" volume={0.5} />
  </Impact>
);
