import React from 'react';
import {C, DISPLAY, SANS} from '../theme';
import {fr} from '../anim';
import {Heading, Kicker} from '../components/ui';
import {Counter, Impact, Pop, Sfx, Sticker, useSpringAt, SPRINGS} from '../fx';

// Anneau du chiffre d'affaires : 58,2 % santé à domicile, 41,8 % maintien à domicile
export const Bastide: React.FC = () => {
  const k = Math.min(1.02, useSpringAt(1, {damping: 18, stiffness: 40, mass: 1}));
  const ring = useSpringAt(0.8, SPRINGS.pop);
  const r = 235;
  const circ = 2 * Math.PI * r;
  return (
    <Impact hits={[2.6]} strength={0.8}>
      <Kicker n={4} label="L’exemple · 2025-2026" />
      <Heading l1="Bastide" l2="Le Confort Médical" />
      <svg width={1080} height={560} style={{position: 'absolute', top: 610, transform: `scale(${0.7 + 0.3 * ring})`, opacity: Math.min(1, ring)}}>
        <g transform="translate(540 280) rotate(-90)" fill="none" strokeWidth={64} strokeLinecap="round">
          <circle r={r} stroke={C.verSoft} strokeLinecap="butt" />
          <circle r={r} stroke={C.ver} strokeDasharray={`${circ * Math.min(1, k)} ${circ}`} />
          <circle r={r} stroke={C.teal} strokeDasharray={`${circ * 0.582 * Math.min(1, k)} ${circ}`} />
        </g>
      </svg>
      <div style={{position: 'absolute', top: 780, width: '100%', textAlign: 'center'}}>
        <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 140, letterSpacing: -5, color: C.ink, lineHeight: 1}}>
          <Counter at={1} to={482} dur={1.6} format={(v) => fr(v)} />
        </div>
        <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 26, color: C.muted, marginTop: 8}}>M€ de chiffre<br />d’affaires</div>
      </div>
      <Sfx at={2.6} name="impact" volume={0.4} />
      {[
        ['58 %', 'santé à domicile', '280,8 M€', C.teal, 3.6, 300],
        ['42 %', 'maintien à domicile', '201,7 M€', C.ver, 4.4, 780],
      ].map(([pct, label, amount, color, at, x]) => (
        <Pop key={label as string} at={at as number} from={0.5} style={{position: 'absolute', top: 1210, left: (x as number) - 250, width: 500, textAlign: 'center'}}>
          <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 100, letterSpacing: -3, color: color as string, lineHeight: 1}}>{pct}</div>
          <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 32, color: C.ink, marginTop: 12}}>{label}</div>
          <div style={{fontFamily: SANS, fontWeight: 400, fontSize: 30, color: C.muted}}>{amount}</div>
          <Sfx at={at as number} name="pop" volume={0.3} />
        </Pop>
      ))}
      <Sticker at={6} rotate={-3} bg={C.ink} style={{left: 120, top: 1430, fontSize: 32, fontWeight: 600}}>
        respiratoire · perfusion · nutrition · diabète
      </Sticker>
    </Impact>
  );
};
