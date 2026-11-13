import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, Series, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FPS, W} from './theme';
import {Paper} from './components/ui';
import {Intro} from './scenes/Intro';
import {Metier} from './scenes/Metier';
import {Modele} from './scenes/Modele';
import {Marche} from './scenes/Marche';
import {Bastide} from './scenes/Bastide';
import {Croissance} from './scenes/Croissance';
import {Roc} from './scenes/Roc';
import {Risque} from './scenes/Risque';
import {Concurrents} from './scenes/Concurrents';
import {Fin} from './scenes/Fin';

// Ordre et durée (en secondes) de chaque scène. Modifie ici pour recaler sur une voix off.
const SCENES: [React.FC, number][] = [
  [Intro, 6],
  [Metier, 10],
  [Modele, 7],
  [Marche, 10],
  [Bastide, 11],
  [Croissance, 7],
  [Roc, 8],
  [Risque, 12],
  [Concurrents, 10],
  [Fin, 8],
];

export const TOTAL_SECONDS = SCENES.reduce((s, [, d]) => s + d, 0);

// Enveloppe de chaque scène : fondu d'entrée/sortie + zoom très lent
const SceneShell: React.FC<{seconds: number; first: boolean; last: boolean; children: React.ReactNode}> = ({seconds, first, last, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const fadeIn = first ? 1 : interpolate(t, [0, 0.45], [0, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const outDur = last ? 1 : 0.45;
  const fadeOut = interpolate(t, [seconds - outDur, seconds], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const zoom = 1 + 0.015 * (t / seconds);
  return <AbsoluteFill style={{opacity: fadeIn * fadeOut, transform: `scale(${zoom})`}}>{children}</AbsoluteFill>;
};

const Progress: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return <div style={{position: 'absolute', left: 0, bottom: 0, height: 6, width: (W * frame) / durationInFrames, background: C.ver}} />;
};

export const PsadHuashu: React.FC = () => (
  <Paper>
    <Series>
      {SCENES.map(([Scene, seconds], i) => (
        <Series.Sequence key={i} durationInFrames={seconds * FPS}>
          <SceneShell seconds={seconds} first={i === 0} last={i === SCENES.length - 1}>
            <Scene />
          </SceneShell>
        </Series.Sequence>
      ))}
    </Series>
    <Progress />
    <Audio src={staticFile('music.wav')} />
  </Paper>
);
