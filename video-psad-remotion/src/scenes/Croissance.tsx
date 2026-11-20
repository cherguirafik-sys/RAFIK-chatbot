import React from 'react';
import {C, DISPLAY, SANS} from '../theme';
import {fr} from '../anim';
import {Heading, Kicker} from '../components/ui';
import {Pop, Sfx, Sticker, useSpringAt, SPRINGS} from '../fx';

const ROWS: [string, number, string][] = [
  ['Diabète', 24.3, C.ver],
  ['Respiratoire', 11.1, C.teal],
  ['Santé à domicile', 9.9, C.blue],
  ['Maintien à domicile', 5.2, C.muted],
];
const PX = 17; // 1 point de croissance = 17 px

// Barre qui « jaillit » avec un léger rebond
const Row: React.FC<{i: number; name: string; v: number; color: string}> = ({i, name, v, color}) => {
  const at = 0.8 + i * 0.35;
  const s = useSpringAt(at, {damping: 13, stiffness: 90, mass: 1});
  const y = 650 + i * 205;
  const w = Math.max(2, v * PX * s);
  return (
    <>
      <Pop at={at - 0.2} dy={0} from={0.9} style={{position: 'absolute', left: 140, top: y - 10, fontFamily: SANS, fontWeight: 600, fontSize: 36, color: C.ink}}>{name}</Pop>
      <div style={{position: 'absolute', left: 140, top: y + 48, height: 64, borderRadius: 14, width: w, background: color, boxShadow: i === 0 ? `0 0 40px ${C.ver}66` : undefined}} />
      <div style={{position: 'absolute', left: 160 + w, top: y + 30, opacity: Math.min(1, s * 3), fontFamily: DISPLAY, fontWeight: 900, fontSize: 68, letterSpacing: -2, color, fontVariantNumeric: 'tabular-nums'}}>+{fr(v * Math.min(1, s), 1)} %</div>
      <Sfx at={at} name="whoosh" volume={0.15} />
    </>
  );
};

export const Croissance: React.FC = () => (
  <>
    <Kicker n={5} label="La croissance sur un an" />
    <Heading l1="Ça pousse" l2="fort" />
    {ROWS.map(([name, v, color], i) => <Row key={name} i={i} name={name} v={v} color={color} />)}
    <Sticker at={3.4} rotate={5} style={{left: 290, top: 1460, fontSize: 38}}>le diabète en tête ↑</Sticker>
    <Sfx at={3.4} name="pop" volume={0.4} />
  </>
);
