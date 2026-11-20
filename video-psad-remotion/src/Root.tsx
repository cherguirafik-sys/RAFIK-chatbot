import React from 'react';
import {Composition} from 'remotion';
import {PsadHuashu, TOTAL_SECONDS} from './PsadHuashu';
import {FPS, H, W} from './theme';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="PsadHuashu"
      component={PsadHuashu}
      durationInFrames={TOTAL_SECONDS * FPS}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={{showSafeZones: false}}
    />
    {/* Même vidéo avec les zones cachées par l'interface TikTok/Reels en rouge (pour vérifier la mise en page) */}
    <Composition
      id="ZonesDeSecurite"
      component={PsadHuashu}
      durationInFrames={TOTAL_SECONDS * FPS}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={{showSafeZones: true}}
    />
  </>
);
