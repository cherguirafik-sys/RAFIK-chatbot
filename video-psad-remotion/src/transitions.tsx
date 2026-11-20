import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import type {TransitionPresentation, TransitionPresentationComponentProps} from '@remotion/transitions';

// Transitions « réseaux sociaux » faites en CSS (rendu fiable partout).
// progress va de 0 à 1 pendant la transition ; la scène qui sort et celle qui entre
// reçoivent chacune leur `presentationDirection`.

const ease = Easing.inOut(Easing.cubic);

// ── Zoom à travers : on « plonge » dans la scène suivante, avec flou et flash
type ZoomProps = {flash?: boolean};
const ZoomThrough: React.FC<TransitionPresentationComponentProps<ZoomProps>> = ({children, presentationDirection, presentationProgress, passedProps}) => {
  const p = ease(presentationProgress);
  const exiting = presentationDirection === 'exiting';
  const scale = exiting ? interpolate(p, [0, 1], [1, 1.6]) : interpolate(p, [0, 1], [0.7, 1]);
  const blur = exiting ? 24 * p : 24 * (1 - p);
  const opacity = exiting ? interpolate(p, [0.4, 0.7], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : interpolate(p, [0.3, 0.6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  // flash blanc très bref au milieu de la transition
  const flash = passedProps.flash && !exiting ? Math.max(0, 1 - Math.abs(p - 0.5) * 5) * 0.7 : 0;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${scale})`, filter: `blur(${blur}px)`, opacity}}>{children}</AbsoluteFill>
      {flash > 0 && <AbsoluteFill style={{background: '#fff', opacity: flash}} />}
    </AbsoluteFill>
  );
};
export const zoomThrough = (props: ZoomProps = {}): TransitionPresentation<ZoomProps> => ({component: ZoomThrough, props});

// ── Fouetté (« whip pan ») : glissement très rapide avec flou de mouvement
type WhipProps = {direction?: 'left' | 'up'};
const Whip: React.FC<TransitionPresentationComponentProps<WhipProps>> = ({children, presentationDirection, presentationProgress, passedProps}) => {
  const p = Easing.inOut(Easing.quad)(presentationProgress);
  const exiting = presentationDirection === 'exiting';
  const vertical = passedProps.direction === 'up';
  const dist = vertical ? 1920 : 1080;
  const offset = exiting ? -p * dist : (1 - p) * dist;
  // le flou est maximal au milieu, quand la vitesse est maximale
  const speed = Math.sin(presentationProgress * Math.PI);
  const blur = 30 * speed;
  const transform = vertical ? `translateY(${offset}px) scaleY(${1 + 0.08 * speed})` : `translateX(${offset}px) scaleX(${1 + 0.08 * speed})`;
  return <AbsoluteFill style={{transform, filter: `blur(${blur}px)`}}>{children}</AbsoluteFill>;
};
export const whip = (props: WhipProps = {}): TransitionPresentation<WhipProps> => ({component: Whip, props});
