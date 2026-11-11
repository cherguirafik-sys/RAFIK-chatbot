// Sous-titres style TikTok : mots en gras qui "popent" un par un,
// avec certains mots surlignés en jaune.
import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

type Props = {
  texte: string;
  motsJaunes: string[]; // mots à afficher en jaune
  haut?: number; // position verticale en pixels
};

export const SousTitre: React.FC<Props> = ({ texte, motsJaunes, haut = 1000 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const mots = texte.split(" ");

  return (
    <div
      style={{
        position: "absolute",
        top: haut,
        left: 60,
        right: 60,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0 34px",
      }}
    >
      {mots.map((mot, i) => {
        // Chaque mot apparaît 5 images après le précédent
        const pop = spring({ frame: frame - i * 5, fps, config: { damping: 14, stiffness: 160 } });
        const jaune = motsJaunes.includes(mot);
        return (
          <span
            key={i}
            style={{
              fontFamily: "'Arial Black', 'Helvetica Neue', Arial, sans-serif",
              fontWeight: 900,
              fontSize: 88,
              lineHeight: 1.15,
              color: jaune ? "#ffcf2e" : "white",
              WebkitTextStroke: "4px black",
              paintOrder: "stroke fill",
              textShadow: "0 6px 0 rgba(0,0,0,0.6)",
              transform: `scale(${pop})`,
              opacity: pop,
              display: "inline-block",
            }}
          >
            {mot}
          </span>
        );
      })}
    </div>
  );
};
