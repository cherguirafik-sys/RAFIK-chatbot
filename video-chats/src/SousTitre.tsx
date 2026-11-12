// Sous-titres style "Secrets de chats" : 2-3 mots à la fois, sur une ligne,
// blanc avec ombre sombre, et le mot important en jaune.
// Dans le texte, on entoure le mot jaune avec des étoiles : "IL *RONRONNE*"
import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

export const SousTitre: React.FC<{ texte: string }> = ({ texte }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Petit "pop" quand le bloc apparaît
  const pop = spring({ frame, fps, config: { damping: 12, stiffness: 220 } });
  // On découpe en mots, et on retient si chaque mot est entre *étoiles*
  // (une zone jaune peut couvrir plusieurs mots : "*NUMÉRO 1*")
  let dansJaune = false;
  const mots = texte.split(" ").map((brut) => {
    const debut = brut.startsWith("*");
    const fin = brut.endsWith("*");
    if (debut) dansJaune = true;
    const jaune = dansJaune;
    if (fin) dansJaune = false;
    return { mot: brut.replace(/\*/g, ""), jaune };
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 1120, // un peu sous le milieu, sur le poitrail du chat
        width: "100%",
        textAlign: "center",
        transform: `scale(${0.85 + pop * 0.15})`,
        opacity: pop,
      }}
    >
      {mots.map(({ mot, jaune }, i) => {
        return (
          <span
            key={i}
            style={{
              fontFamily: "'Arial Black', 'Helvetica Neue', Arial, sans-serif",
              fontWeight: 900,
              fontSize: 76,
              color: jaune ? "#ffc928" : "white",
              WebkitTextStroke: "3px #1a1a1a",
              paintOrder: "stroke fill",
              textShadow: "0 0 18px rgba(0,0,0,0.85), 0 4px 6px rgba(0,0,0,0.7)",
              marginRight: i < mots.length - 1 ? 22 : 0,
            }}
          >
            {mot}
          </span>
        );
      })}
    </div>
  );
};
