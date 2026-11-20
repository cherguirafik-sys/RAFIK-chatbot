import React from 'react';
import {C, DISPLAY, SANS} from '../theme';
import {Heading, Kicker} from '../components/ui';
import {Marker, Pop, Sfx, useSpringAt, SPRINGS} from '../fx';

const NAMES = ['Air Liquide', 'Isis', 'Santé Cie', 'SOS Oxygène', 'Bastide'];
const LEVERS: [string, string][] = [
  ['Achats moins chers', 'grâce à la taille'],
  ['Activités techniques', 'perfusion, diabète'],
  ['Rachats', 'de petits concurrents'],
];

const Lever: React.FC<{i: number; name: string; desc: string}> = ({i, name, desc}) => {
  const at = 3 + i * 0.7;
  const s = useSpringAt(at, SPRINGS.snappy);
  const n = useSpringAt(at, SPRINGS.slam);
  const y = 1080 + i * 145;
  return (
    <>
      <div style={{position: 'absolute', left: 140, top: y - 40, width: 84, height: 84, borderRadius: 22, background: C.ver, color: '#fff', fontFamily: DISPLAY, fontWeight: 900, fontSize: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${n}) rotate(${-8 * (1 - n)}deg)`}}>{i + 1}</div>
      <div style={{position: 'absolute', left: 260 + 260 * (1 - s), top: y - 50, opacity: Math.min(1, s * 1.5)}}>
        <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 52, letterSpacing: -2, color: C.ink, lineHeight: 1.1}}>{name}</div>
        <div style={{fontFamily: SANS, fontWeight: 400, fontSize: 30, color: C.muted}}>{desc}</div>
      </div>
      <Sfx at={at} name="pop" volume={0.3} />
    </>
  );
};

export const Concurrents: React.FC = () => (
  <>
    <Kicker n={8} label="La concurrence" />
    <Heading l1="Grossir" l2="pour résister" />
    {/* les concurrents tombent comme des étiquettes ; Bastide est surligné */}
    <div style={{position: 'absolute', top: 650, left: 90, right: 90, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 18}}>
      {NAMES.map((n, i) => {
        const me = n === 'Bastide';
        return (
          <Pop key={n} at={0.8 + i * 0.22} from={0.3} dy={-60} rotate={i % 2 ? 8 : -8}>
            <div style={{padding: '14px 30px', borderRadius: 999, background: me ? C.teal : '#fff', border: `2px solid ${me ? C.teal : C.rule}`, fontFamily: DISPLAY, fontWeight: 800, fontSize: 44, letterSpacing: -1, color: me ? '#fff' : C.ink}}>{n}</div>
          </Pop>
        );
      })}
    </div>
    {NAMES.map((n, i) => <Sfx key={n} at={0.8 + i * 0.22} name="pop" volume={0.2} />)}
    <Pop at={2.3} from={0.9} dy={0} style={{position: 'absolute', top: 930, width: '100%', textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 34, color: C.ink}}>
      Les <Marker at={2.5}>3 leviers</Marker> pour tenir :
    </Pop>
    {LEVERS.map(([name, desc], i) => <Lever key={name} i={i} name={name} desc={desc} />)}
  </>
);
