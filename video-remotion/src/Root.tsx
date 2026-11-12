import React from "react";
import { Composition } from "remotion";
import { SunnasVideo, TOTAL_FRAMES } from "./Video";

// Le "Root" liste toutes les vidéos du projet.
// Format vertical 1080x1920 (TikTok / Reels / Shorts), 30 images par seconde.
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="SunnasAvantDeDormir"
      component={SunnasVideo}
      durationInFrames={TOTAL_FRAMES}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
