// Le décor : un salon chaleureux un peu flou (comme dans le modèle)
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

export const Salon: React.FC = () => {
  const frame = useCurrentFrame();
  // Léger zoom lent pour donner de la vie au fond
  const zoom = interpolate(frame, [0, 900], [1, 1.08]);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `scale(${zoom})`,
          filter: "blur(10px)", // effet "arrière-plan flou"
        }}
      >
        {/* Mur : dégradé chaud */}
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(180deg, #8a6a52 0%, #b48d6c 35%, #d9b894 60%, #c9a27c 100%)",
          }}
        />
        {/* Lumière de fenêtre à droite */}
        <div
          style={{
            position: "absolute",
            right: -200,
            top: 100,
            width: 700,
            height: 900,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,236,190,0.9), rgba(255,220,160,0) 70%)",
          }}
        />
        {/* Étagère à gauche */}
        <div style={{ position: "absolute", left: 40, top: 80, width: 260, height: 600, background: "#6b4e3a", borderRadius: 12 }} />
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ position: "absolute", left: 60, top: 140 + i * 180, width: 220, height: 120, background: "#4a3427", borderRadius: 6 }} />
        ))}
        {/* Plante verte */}
        {[-40, -10, 20, 45].map((angle, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 120,
              top: 560,
              width: 90,
              height: 300,
              background: "#4f7a45",
              borderRadius: "50% 50% 50% 50% / 80% 80% 20% 20%",
              transformOrigin: "bottom center",
              transform: `rotate(${angle}deg)`,
            }}
          />
        ))}
        {/* Canapé */}
        <div style={{ position: "absolute", left: -80, right: -80, top: 820, height: 420, background: "#b9a48c", borderRadius: 80 }} />
        <div style={{ position: "absolute", left: -40, right: -40, top: 980, height: 300, background: "#a8927a", borderRadius: 60 }} />
        {/* Tapis moelleux */}
        <div
          style={{
            position: "absolute",
            left: -200,
            right: -200,
            top: 1200,
            bottom: -200,
            background: "radial-gradient(ellipse at 50% 30%, #f7eadb 0%, #e8d6c2 50%, #cdb59b 100%)",
          }}
        />
      </AbsoluteFill>
      {/* Vignette sombre sur les bords */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
