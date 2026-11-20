import React from 'react';
import {C, DISPLAY, SANS} from '../theme';
import {fr, inOut, useTimeline} from '../anim';
import {Heading, Kicker} from '../components/ui';
import {Counter, Impact, Pop, Sfx} from '../fx';

// Trois gros chiffres qui « roulent » puis frappent l'écran (zoom + tremblement + son)
const ROWS: [number, (v: number) => string, string, string, number][] = [
  [4, (v) => `≈ ${fr(v)} Md€`, 'de chiffre d’affaires', C.ink, 1],
  [4, (v) => `≈ ${fr(v)} M`, 'de patients suivis', C.teal, 2.6],
  [33000, (v) => fr(v), 'emplois', C.ver, 4.2],
];

export const Marche: React.FC = () => {
  const {p} = useTimeline();
  const bar = p(6.2, 1.4, inOut);
  return (
    <Impact hits={ROWS.map(([, , , , at]) => at + 0.9)}>
      <Kicker n={3} label="Le marché en France" />
      <Heading l1="Un marché" l2="de taille" />
      {ROWS.map(([to, format, label, color, at], i) => (
        <Pop key={label} at={at - 0.1} from={0.5} style={{position: 'absolute', top: 640 + i * 235, width: '100%', textAlign: 'center'}}>
          <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 140, letterSpacing: -5, lineHeight: 1.05, color}}>
            <Counter at={at} to={to} format={format} />
          </div>
          <div style={{fontFamily: SANS, fontWeight: 400, fontSize: 34, color: C.muted}}>{label}</div>
          <Sfx at={at + 0.9} name="impact" volume={0.4} />
        </Pop>
      ))}
      <Pop at={6} dy={30} from={0.9} style={{position: 'absolute', left: 140, top: 1365, width: 800}}>
        <div style={{height: 26, borderRadius: 13, background: '#fff', border: `2px solid ${C.rule}`, overflow: 'hidden'}}>
          <div style={{height: '100%', borderRadius: 13, width: `${62.5 * bar}%`, background: `linear-gradient(90deg, ${C.teal}, #2fa58b)`}} />
        </div>
        <div style={{marginTop: 22, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 34, color: C.ink}}>dont 2,5 M pour des maladies respiratoires</div>
      </Pop>
    </Impact>
  );
};
