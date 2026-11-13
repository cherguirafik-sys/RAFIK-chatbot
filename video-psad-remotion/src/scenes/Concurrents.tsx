import React from 'react';
import {C, SANS, SERIF} from '../theme';
import {useTimeline} from '../anim';
import {center, Heading, Kicker, Rise, Rule} from '../components/ui';

const NAMES = ['Air Liquide', 'Isis', 'Santé Cie', 'SOS Oxygène', 'Bastide'];
const LEVERS: [string, string][] = [
  ['Achats moins chers', 'grâce à la taille'],
  ['Activités techniques', 'perfusion, diabète'],
  ['Rachats', 'de petits concurrents'],
];

export const Concurrents: React.FC = () => {
  const {p} = useTimeline();
  return (
    <>
      <Kicker n={8} label="La concurrence" />
      <Heading l1="Grossir" l2="pour résister" />
      {NAMES.map((n, i) => {
        const me = n === 'Bastide';
        return (
          <Rise key={n} at={0.8 + i * 0.3} dur={0.5} dy={15} style={{...center, top: 655 + i * 80, fontFamily: SERIF, fontWeight: 700, fontStyle: me ? 'italic' : 'normal', fontSize: me ? 64 : 52, color: me ? C.teal : C.ink}}>
            {n}
          </Rise>
        );
      })}
      <Rule at={2.6} width={300} top={1130} />
      {LEVERS.map(([name, desc], i) => {
        const k = p(3 + i * 0.8, 0.7);
        const y = 1250 + i * 150;
        return (
          <div key={name} style={{opacity: k}}>
            <div style={{position: 'absolute', left: 150, top: y - 55, width: 60, textAlign: 'center', fontFamily: SERIF, fontWeight: 700, fontSize: 80, color: C.ver}}>{i + 1}</div>
            <div style={{position: 'absolute', left: 260 + 20 * (1 - k), top: y - 52}}>
              <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 56, color: C.ink, lineHeight: 1.1}}>{name}</div>
              <div style={{fontFamily: SANS, fontWeight: 300, fontSize: 30, color: C.muted}}>{desc}</div>
            </div>
          </div>
        );
      })}
    </>
  );
};
