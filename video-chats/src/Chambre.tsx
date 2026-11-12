// Décor 2 : une chambre le soir (lit, couverture, lampe de chevet allumée)
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

export const Chambre: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 600], [1, 1.06]);
  // La lampe "vacille" très légèrement, comme une vraie lumière chaude
  const lampe = 0.85 + Math.sin(frame / 7) * 0.03;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, filter: "blur(9px)" }}>
        {/* Mur sombre et chaud */}
        <AbsoluteFill style={{ background: "linear-gradient(180deg, #3a2a20 0%, #5a4031 50%, #4a3326 100%)" }} />
        {/* Fenêtre de nuit */}
        <div style={{ position: "absolute", right: 80, top: 80, width: 340, height: 480, background: "#2a3346", border: "16px solid #4a3528" }} />
        {/* Tête de lit en bois */}
        <div style={{ position: "absolute", left: -40, top: 420, width: 520, height: 420, background: "#6b4a33", borderRadius: "30px 30px 0 0" }} />
        {/* Lampe de chevet */}
        <div style={{ position: "absolute", left: 560, top: 380, width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, rgba(255,214,140,${lampe}), rgba(255,190,110,0) 65%)` }} />
        <div style={{ position: "absolute", left: 790, top: 560, width: 150, height: 120, background: "#ffe2a8", borderRadius: "30px 30px 6px 6px" }} />
        <div style={{ position: "absolute", left: 750, top: 690, width: 240, height: 200, background: "#5a3d2a", borderRadius: 10 }} />
        {/* Lit : couverture beige */}
        <div style={{ position: "absolute", left: -200, right: -100, top: 820, bottom: -200, background: "linear-gradient(180deg, #c9b29a 0%, #a88d73 100%)", borderRadius: 120 }} />
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ position: "absolute", left: -100 + i * 380, top: 1000 + i * 120, width: 500, height: 160, background: "#d8c2a8", borderRadius: 80, transform: "rotate(-12deg)" }} />
        ))}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 60% 40%, rgba(0,0,0,0) 45%, rgba(20,10,5,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};
