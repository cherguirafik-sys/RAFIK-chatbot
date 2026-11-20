import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {linearTiming, TransitionPresentation, TransitionSeries} from '@remotion/transitions';
import {C, FPS} from './theme';
import {Paper} from './components/ui';
import {Grain, SafeZones} from './fx';
import {whip, zoomThrough} from './transitions';
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

// Ordre et durée (en secondes) de chaque scène, et la transition qui mène à la scène SUIVANTE.
// Modifie ici pour recaler sur une voix off.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Tr = TransitionPresentation<any>;
const SCENES: [React.FC, number, Tr | null][] = [
  [Intro, 7, zoomThrough({flash: true})],
  [Metier, 10, whip()],
  [Modele, 7, whip({direction: 'up'})],
  [Marche, 10, zoomThrough()],
  [Bastide, 11, whip()],
  [Croissance, 7, whip({direction: 'up'})],
  [Roc, 8, zoomThrough({flash: true})],
  [Risque, 12, whip()],
  [Concurrents, 9, zoomThrough()],
  [Fin, 8, null],
];

// Durée d'une transition, en images (12 images = 0,4 s : rapide, comme sur TikTok)
const T = 12;

export const TOTAL_SECONDS = SCENES.reduce((s, [, d]) => s + d, 0);

// Début de chaque scène dans la vidéo finale (en images)
const STARTS = SCENES.map((_, i) => SCENES.slice(0, i).reduce((s, [, d]) => s + d * FPS, 0));

// Barre de progression en segments, comme les stories Instagram : un segment par scène
const StoryBar: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'absolute', top: 214, left: 70, right: 70, display: 'flex', gap: 8}}>
      {SCENES.map(([, d], i) => {
        const k = Math.max(0, Math.min(1, (frame - STARTS[i]) / (d * FPS)));
        return (
          <div key={i} style={{flex: d, height: 7, borderRadius: 4, background: C.rule, overflow: 'hidden'}}>
            <div style={{width: `${k * 100}%`, height: '100%', background: C.ink}} />
          </div>
        );
      })}
    </div>
  );
};

export const PsadHuashu: React.FC<{showSafeZones?: boolean}> = ({showSafeZones = false}) => (
  <AbsoluteFill>
    <Paper>
      <TransitionSeries>
        {SCENES.flatMap(([Scene, seconds, tr], i) => {
          // chaque scène dure T images de plus : elle chevauche la suivante pendant la transition,
          // ce qui garde la durée totale identique (et la musique bien calée).
          const els = [
            <TransitionSeries.Sequence key={`s${i}`} durationInFrames={seconds * FPS + (tr ? T : 0)}>
              <Scene />
            </TransitionSeries.Sequence>,
          ];
          if (tr) els.push(<TransitionSeries.Transition key={`t${i}`} presentation={tr} timing={linearTiming({durationInFrames: T})} />);
          return els;
        })}
      </TransitionSeries>
    </Paper>
    <StoryBar />
    <Grain />
    {/* un « whoosh » sur chaque transition */}
    {SCENES.slice(1).map((_, i) => (
      <Sequence key={i} from={STARTS[i + 1] - 3} durationInFrames={20}>
        <Audio src={staticFile('sfx/whoosh.wav')} volume={0.35} />
      </Sequence>
    ))}
    <Audio src={staticFile('music.wav')} volume={0.8} />
    {showSafeZones && <SafeZones />}
  </AbsoluteFill>
);
