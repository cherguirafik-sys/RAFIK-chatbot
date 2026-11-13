import React from 'react';
import {Composition} from 'remotion';
import {PsadHuashu, TOTAL_SECONDS} from './PsadHuashu';
import {FPS, H, W} from './theme';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="PsadHuashu"
    component={PsadHuashu}
    durationInFrames={TOTAL_SECONDS * FPS}
    fps={FPS}
    width={W}
    height={H}
  />
);
