import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import {C, DISPLAY, SANS, SERIF} from '../theme';
import {useTimeline} from '../anim';
import {Cross} from '../components/ui';
import {Impact, Pop, Sfx, Sticker, Words} from '../fx';

// Moment où l'accroche laisse la place au titre
const SWITCH = 2.9;

// 1) L'ACCROCHE : du texte est déjà à l'écran dès la 1re image (indispensable sur TikTok,
//    où l'on décide de rester ou de « swiper » en moins de 2 secondes).
const Hook: React.FC = () => {
  const {t} = useTimeline();
  // sortie : l'accroche grossit et devient floue, comme si on passait à travers
  const out = interpolate(t, [SWITCH - 0.2, SWITCH + 0.2], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic)});
  return (
    <AbsoluteFill style={{opacity: 1 - out, transform: `scale(${1 + out * 0.5})`, filter: `blur(${out * 16}px)`}}>
      <Impact hits={[1.35]}>
        <div style={{position: 'absolute', top: 560, width: '100%', padding: '0 70px', boxSizing: 'border-box'}}>
          <Words
            text="Ce business encaisse de l’argent chaque semaine."
            at={-0.3}
            stagger={0.13}
            highlight={['chaque', 'semaine.']}
            accent={C.ver}
            style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 132, lineHeight: 1.02, letterSpacing: -4, color: C.ink}}
          />
        </div>
        <Sticker at={1.35} rotate={-6} style={{left: 140, top: 1270, fontSize: 52}}>
          un marché de 4 Md€
        </Sticker>
      </Impact>
      <Sfx at={1.35} name="impact" volume={0.6} />
    </AbsoluteFill>
  );
};

// 2) LE TITRE : dessin du patient sous appareil contre l'apnée du sommeil + nom du sujet
const TitleCard: React.FC = () => {
  const {t, p} = useTimeline();
  const local = t - SWITCH;
  const k = p(SWITCH, 0.9);
  const z = (t * 0.7) % 1;
  return (
    <AbsoluteFill style={{opacity: local < 0 ? 0 : 1}}>
      <svg width={1080} height={700} style={{position: 'absolute', top: 300, opacity: k, transform: `translateY(${40 * (1 - k)}px) scale(${0.9 + 0.1 * k})`}}>
        <g transform="translate(280 180)" stroke={C.ink} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M20 240 V130 M20 200 H380 V250 M20 170 H380" />
          <circle cx={80} cy={138} r={26} />
          <path d="M100 140 Q122 140 124 152" />
          {/* le tuyau se dessine au trait */}
          <path d="M124 150 C200 60 340 60 420 140" stroke={C.teal} strokeDasharray={420} strokeDashoffset={420 * (1 - p(SWITCH + 0.2, 0.9))} />
          <rect x={410} y={130} width={90} height={52} rx={10} />
          <circle cx={440} cy={156} r={9} fill={C.teal} stroke="none" />
        </g>
        <text x={420 + z * 40} y={180 - z * 50} fontFamily={SERIF} fontStyle="italic" fontSize={54} fill={C.teal} opacity={1 - z}>z</text>
        <text x={460 + z * 30} y={150 - z * 40} fontFamily={SERIF} fontStyle="italic" fontSize={40} fill={C.teal} opacity={(1 - z) * 0.7}>z</text>
      </svg>
      <Cross x={830} y={440} size={44} at={SWITCH + 0.6} />
      <div style={{position: 'absolute', top: 860, width: '100%', padding: '0 60px', boxSizing: 'border-box'}}>
        <Words text="Prestataires" at={SWITCH + 0.15} style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 128, letterSpacing: -4, color: C.ink}} />
        <Pop at={SWITCH + 0.45} from={0.8} dy={20}>
          <div style={{textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 104, color: C.ver, lineHeight: 1.1}}>de santé à domicile</div>
        </Pop>
      </div>
      <Pop at={SWITCH + 0.9} from={0.85} dy={20} style={{position: 'absolute', top: 1190, width: '100%', textAlign: 'center'}}>
        <div style={{fontFamily: SANS, fontWeight: 400, fontSize: 38, color: C.muted}}>Le business de</div>
        <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 50, color: C.ink, letterSpacing: -1}}>Bastide Le Confort Médical</div>
      </Pop>
      <Sfx at={SWITCH + 0.15} name="pop" volume={0.4} />
    </AbsoluteFill>
  );
};

export const Intro: React.FC = () => (
  <>
    <Hook />
    <TitleCard />
  </>
);
