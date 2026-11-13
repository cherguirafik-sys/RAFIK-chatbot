import React from 'react';
import {C, SANS, SERIF} from '../theme';
import {useTimeline} from '../anim';
import {center, Heading, Kicker, Rise} from '../components/ui';

const STEPS: [string, string, string][] = [
  ['Médecin', 'prescrit le traitement', C.blue],
  ['Prestataire', 'livre, installe, forme', C.teal],
  ['Suivi', 'visites, astreinte 24h/24', C.teal],
  ['Assurance maladie', 'rembourse un forfait', C.ver],
];

export const Metier: React.FC = () => {
  const {p} = useTimeline();
  return (
    <>
      <Kicker n={1} label="Le métier" />
      <Heading l1="Livrer, installer," l2="suivre" />
      {STEPS.map(([name, desc, color], i) => {
        const k = p(0.9 + i * 0.55, 0.6);
        const line = p(1.3 + i * 0.55, 0.5);
        const y = 700 + i * 190;
        return (
          <div key={name} style={{opacity: k}}>
            <div style={{position: 'absolute', left: 196, top: y - 34, width: 68, height: 68, borderRadius: 34, background: color, color: C.paper, fontFamily: SERIF, fontWeight: 700, fontSize: 44, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</div>
            {i < 3 && <div style={{position: 'absolute', left: 228, top: y + 40, width: 3, height: 110 * line, background: C.rule}} />}
            <div style={{position: 'absolute', left: 300 + 20 * (1 - k), top: y - 52}}>
              <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 60, color: C.ink, lineHeight: 1.1}}>{name}</div>
              <div style={{fontFamily: SANS, fontWeight: 300, fontSize: 32, color: C.muted}}>{desc}</div>
            </div>
          </div>
        );
      })}
      <Rise at={4.2} style={{...center, top: 1510, padding: '0 100px', boxSizing: 'border-box', fontFamily: SERIF, fontStyle: 'italic', fontSize: 50, color: C.ver, lineHeight: 1.25}}>
        oxygène · apnée du sommeil · perfusions · lits médicalisés
      </Rise>
    </>
  );
};
