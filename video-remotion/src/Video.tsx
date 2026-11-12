import React from "react";
import { AbsoluteFill, Series } from "remotion";
import { Parchment, SceneFade } from "./components";
import { AyatKursi, Baqara, Checklist, Dua, DustBed, Intro, Outro, RightSide, Tasbih, ThreeQul, Wudu } from "./scenes";

// ✏️ Modifie ici ton nom et ton appel à l'action
const BRAND = "RAFIK";
const CTA = "ABONNE-TOI POUR LA SUITE";

// Liste des scènes dans l'ordre, avec leur durée en images (30 images = 1 seconde)
const SCENES: { el: React.ReactNode; frames: number }[] = [
  { el: <Intro />, frames: 90 },
  { el: <Wudu />, frames: 150 },
  { el: <DustBed />, frames: 150 },
  { el: <RightSide />, frames: 150 },
  { el: <AyatKursi />, frames: 150 },
  { el: <Baqara />, frames: 150 },
  { el: <ThreeQul />, frames: 160 },
  { el: <Tasbih />, frames: 165 },
  { el: <Dua />, frames: 170 },
  { el: <Checklist />, frames: 210 },
  { el: <Outro brand={BRAND} cta={CTA} />, frames: 90 },
];

export const TOTAL_FRAMES = SCENES.reduce((sum, s) => sum + s.frames, 0);

export const SunnasVideo: React.FC = () => (
  <AbsoluteFill>
    <Parchment />
    <Series>
      {SCENES.map((s, i) => (
        <Series.Sequence key={i} durationInFrames={s.frames}>
          <SceneFade duration={s.frames}>{s.el}</SceneFade>
        </Series.Sequence>
      ))}
    </Series>
  </AbsoluteFill>
);
