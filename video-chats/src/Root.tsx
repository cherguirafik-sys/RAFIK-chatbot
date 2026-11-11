// On déclare ici nos "compositions" (= nos vidéos)
import React from "react";
import { Composition } from "remotion";
import { ChatVideo, DUREE_TOTALE } from "./ChatVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ChatVideo"
      component={ChatVideo}
      durationInFrames={DUREE_TOTALE}
      fps={30}
      width={1080} // format vertical TikTok / Reels
      height={1920}
    />
  );
};
