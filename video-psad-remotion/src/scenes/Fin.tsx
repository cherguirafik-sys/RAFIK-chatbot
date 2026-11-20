import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import {C, DISPLAY, SANS, SERIF} from '../theme';
import {useTimeline} from '../anim';
import {Cross} from '../components/ui';
import {Pop, Sfx, Sticker, Words} from '../fx';

const SWITCH = 3.8; // passage du résumé à l'appel à l'action

// Icône « enregistrer » (marque-page), qui pulse pour attirer l'œil
const Bookmark: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{verticalAlign: 'middle'}}>
    <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z" fill={color} />
  </svg>
);

export const Fin: React.FC = () => {
  const {t} = useTimeline();
  const out = interpolate(t, [SWITCH - 0.25, SWITCH + 0.15], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic)});
  const pulse = 1 + 0.06 * Math.max(0, Math.sin((t - SWITCH - 1.6) * 6));
  return (
    <>
      {/* 1) Le résumé */}
      <AbsoluteFill style={{opacity: 1 - out, transform: `scale(${1 - out * 0.15})`, filter: `blur(${out * 12}px)`}}>
        <Pop at={0} from={0.8} dy={0} style={{position: 'absolute', top: 440, width: '100%', textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: 8, color: C.teal}}>EN RÉSUMÉ</Pop>
        <div style={{position: 'absolute', top: 540, width: '100%', padding: '0 60px', boxSizing: 'border-box'}}>
          <Words text="Un business récurrent" at={0.2} stagger={0.14} style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 128, letterSpacing: -5, lineHeight: 1.02, color: C.ink}} />
        </div>
        <Pop at={0.8} style={{position: 'absolute', top: 830, width: '100%', textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 100, color: C.teal}}>et en croissance</Pop>
        <Pop at={1.6} style={{position: 'absolute', top: 1030, width: '100%', padding: '0 110px', boxSizing: 'border-box', textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 62, lineHeight: 1.2, color: C.ver}}>
          … mais sous la pression constante des tarifs publics.
        </Pop>
        <Cross x={540} y={1330} size={44} at={2.2} />
      </AbsoluteFill>

      {/* 2) L'appel à l'action : question pour les commentaires + « enregistre » */}
      {t > SWITCH - 0.1 && (
        <AbsoluteFill>
          <div style={{position: 'absolute', top: 520, width: '100%', padding: '0 70px', boxSizing: 'border-box'}}>
            <Words text="Tu connaissais ce business ?" at={SWITCH} stagger={0.12} highlight={['business']} accent={C.ver} style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 120, letterSpacing: -4, lineHeight: 1.05, color: C.ink}} />
          </div>
          <Sticker at={SWITCH + 0.9} rotate={-4} bg="#fff" color={C.ink} style={{left: 150, top: 1000, fontSize: 42, border: `3px solid ${C.ink}`}}>
            Dis-le en commentaire 💬
          </Sticker>
          <div style={{position: 'absolute', top: 1190, width: '100%', display: 'flex', justifyContent: 'center'}}>
            <Pop at={SWITCH + 1.4} from={0.5}>
              <div style={{transform: `scale(${pulse})`, display: 'flex', alignItems: 'center', gap: 18, background: C.ink, color: '#fff', padding: '22px 40px', borderRadius: 999, fontFamily: DISPLAY, fontWeight: 800, fontSize: 44}}>
                <Bookmark size={46} color="#fff" /> Enregistre pour plus tard
              </div>
            </Pop>
          </div>
          <Sfx at={SWITCH} name="whoosh" volume={0.35} />
          <Sfx at={SWITCH + 0.9} name="pop" volume={0.4} />
          <Sfx at={SWITCH + 1.4} name="pop" volume={0.4} />
        </AbsoluteFill>
      )}
    </>
  );
};
