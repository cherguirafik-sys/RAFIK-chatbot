import React from 'react';
import {C, DISPLAY, SANS} from '../theme';
import {useTimeline} from '../anim';
import {Heading, Kicker} from '../components/ui';
import {Pop, Sfx, Sticker, useSpringAt, SPRINGS} from '../fx';

const STEPS: [string, string, string][] = [
  ['Médecin', 'prescrit le traitement', C.blue],
  ['Prestataire', 'livre, installe, forme', C.teal],
  ['Suivi', 'visites, astreinte 24h/24', C.teal],
  ['Assurance maladie', 'rembourse un forfait', C.ver],
];
const TAGS = ['oxygène', 'apnée du sommeil', 'perfusions', 'lits médicalisés'];

// Une étape : la pastille « claque », le texte glisse depuis la droite
const Step: React.FC<{i: number; name: string; desc: string; color: string}> = ({i, name, desc, color}) => {
  const {p} = useTimeline();
  const at = 0.9 + i * 0.55;
  const s = useSpringAt(at, SPRINGS.slam);
  const slide = useSpringAt(at + 0.08, SPRINGS.snappy);
  const line = p(at + 0.35, 0.4);
  const y = 680 + i * 170;
  return (
    <>
      {i < 3 && <div style={{position: 'absolute', left: 168, top: y + 40, width: 4, borderRadius: 2, height: 95 * line, background: C.rule}} />}
      <div style={{position: 'absolute', left: 136, top: y - 34, width: 68, height: 68, borderRadius: 34, background: color, color: '#fff', fontFamily: DISPLAY, fontWeight: 900, fontSize: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${s})`}}>{i + 1}</div>
      <div style={{position: 'absolute', left: 240 + 300 * (1 - slide), top: y - 50, opacity: Math.min(1, slide * 1.5)}}>
        <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 58, letterSpacing: -2, color: C.ink, lineHeight: 1.1}}>{name}</div>
        <div style={{fontFamily: SANS, fontWeight: 400, fontSize: 32, color: C.muted}}>{desc}</div>
      </div>
      <Sfx at={at} name="pop" volume={0.3} />
    </>
  );
};

export const Metier: React.FC = () => (
  <>
    <Kicker n={1} label="Le métier" />
    <Heading l1="Livrer, installer," l2="suivre" />
    {STEPS.map(([name, desc, color], i) => <Step key={name} i={i} name={name} desc={desc} color={color} />)}
    <Pop at={4.0} dy={0} from={0.9} style={{position: 'absolute', top: 1340, width: '100%', textAlign: 'center', fontFamily: SANS, fontWeight: 500, fontSize: 28, letterSpacing: 4, color: C.muted}}>
      EXEMPLES
    </Pop>
    <div style={{position: 'absolute', top: 1390, left: 70, right: 70, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 18}}>
      {TAGS.map((tag, i) => (
        <div key={tag} style={{position: 'relative', height: 76, width: tag.length * 22 + 60}}>
          <Sticker at={4.2 + i * 0.22} bg={i % 2 ? C.teal : '#fff'} color={i % 2 ? '#fff' : C.ink} rotate={i % 2 ? 3 : -3} style={{fontSize: 34, padding: '12px 26px', left: 0, top: 0}}>
            {tag}
          </Sticker>
        </div>
      ))}
    </div>
  </>
);
