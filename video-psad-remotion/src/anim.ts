import {Easing, interpolate} from 'remotion';

// Progression 0 → 1 entre deux instants (en secondes), avec un easing doux
export const prog = (frame: number, fps: number, start: number, dur: number, ease = Easing.out(Easing.cubic)) =>
  interpolate(frame / fps, [start, start + dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

export const inOut = Easing.inOut(Easing.cubic);

// Format français : virgule décimale, espace pour les milliers
export const fr = (v: number, dec = 0) =>
  v.toFixed(dec).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

import {useCurrentFrame, useVideoConfig} from 'remotion';

// Raccourci dans une scène : p(début, durée) → 0..1 ; t = temps local en secondes
export const useTimeline = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return {
    t: frame / fps,
    p: (start: number, dur: number, ease?: (x: number) => number) => prog(frame, fps, start, dur, ease),
  };
};
