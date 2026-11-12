import React from "react";
import { AbsoluteFill, Audio, Sequence, Series, staticFile } from "remotion";
import { Parchment, SceneFade } from "./components";
import { AyatKursi, Baqara, Checklist, Dua, DustBed, Intro, Outro, RightSide, Tasbih, ThreeQul, Wudu } from "./scenes";

// ✏️ Modifie ici ton nom et ton appel à l'action
const BRAND = "RAFIK";
const CTA = "ABONNE-TOI POUR LA SUITE";

// Volumes (0 = muet, 1 = volume normal)
const VOLUME_VOIX = 1;
const VOLUME_BRUITAGES = 0.35;

// Liste des scènes dans l'ordre :
// - el     : la scène à afficher
// - frames : sa durée en images (30 images = 1 seconde)
// - voix   : le fichier audio de la voix off (dans public/voix)
// La durée de chaque scène est un peu plus longue que sa voix off.
const SCENES: { el: React.ReactNode; frames: number; voix: string }[] = [
  { el: <Intro />, frames: 135, voix: "vo00.mp3" },
  { el: <Wudu />, frames: 176, voix: "vo01.mp3" },
  { el: <DustBed />, frames: 180, voix: "vo02.mp3" },
  { el: <RightSide />, frames: 150, voix: "vo03.mp3" },
  { el: <AyatKursi />, frames: 226, voix: "vo04.mp3" },
  { el: <Baqara />, frames: 265, voix: "vo05.mp3" },
  { el: <ThreeQul />, frames: 260, voix: "vo06.mp3" },
  { el: <Tasbih />, frames: 288, voix: "vo07.mp3" },
  { el: <Dua />, frames: 228, voix: "vo08.mp3" },
  { el: <Checklist />, frames: 220, voix: "vo09.mp3" },
  { el: <Outro brand={BRAND} cta={CTA} />, frames: 90, voix: "vo10.mp3" },
];

export const TOTAL_FRAMES = SCENES.reduce((sum, s) => sum + s.frames, 0);

// Début (en images) de chaque scène, pour placer les bruitages de transition
const STARTS = SCENES.map((_, i) => SCENES.slice(0, i).reduce((sum, s) => sum + s.frames, 0));

export const SunnasVideo: React.FC = () => (
  <AbsoluteFill>
    <Parchment />

    {/* 1) Les scènes, l'une après l'autre */}
    <Series>
      {SCENES.map((s, i) => (
        <Series.Sequence key={i} durationInFrames={s.frames}>
          <SceneFade duration={s.frames}>{s.el}</SceneFade>
          {/* La voix démarre 6 images (0,2 s) après le début de la scène */}
          <Sequence from={6}>
            <Audio src={staticFile("voix/" + s.voix)} volume={VOLUME_VOIX} />
          </Sequence>
        </Series.Sequence>
      ))}
    </Series>

    {/* 2) Un petit "souffle" à chaque changement de scène */}
    {STARTS.slice(1).map((start, i) => (
      <Sequence key={i} from={start - 10} durationInFrames={25}>
        <Audio src={staticFile("sfx/souffle.mp3")} volume={VOLUME_BRUITAGES} />
      </Sequence>
    ))}

    {/* 3) Un "pop" à chaque case cochée dans la checklist (scène n°10) */}
    {Array.from({ length: 8 }, (_, i) => (
      <Sequence key={"pop" + i} from={STARTS[9] + 52 + i * 14} durationInFrames={10}>
        <Audio src={staticFile("sfx/pop.mp3")} volume={VOLUME_BRUITAGES} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
