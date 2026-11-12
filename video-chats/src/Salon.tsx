// Décor 1 : un salon clair et chaleureux (canapé crème, tableaux, plante)
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

export const Salon: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 600], [1, 1.06]); // zoom très lent

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, filter: "blur(9px)" }}>
        {/* Mur crème */}
        <AbsoluteFill style={{ background: "linear-gradient(180deg, #d8c6ae 0%, #e6d6c0 45%, #cdb79c 100%)" }} />
        {/* Lumière de fenêtre (à droite) */}
        <div style={{ position: "absolute", right: -250, top: 0, width: 800, height: 1300, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,240,205,1), rgba(255,230,180,0) 70%)" }} />
        {/* Tableaux au mur */}
        <div style={{ position: "absolute", left: 30, top: 60, width: 170, height: 250, border: "12px solid #6e5644", background: "#cfc2ad" }} />
        <div style={{ position: "absolute", left: 620, top: 80, width: 220, height: 170, border: "12px solid #6e5644", background: "#d9cdb8" }} />
        {/* Applique murale */}
        <div style={{ position: "absolute", left: 240, top: 120, width: 120, height: 90, borderRadius: "50% 50% 10px 10px", background: "#fff3dc", boxShadow: "0 0 120px 60px rgba(255,230,180,0.6)" }} />
        {/* Plante sur un meuble */}
        <div style={{ position: "absolute", left: 160, top: 380, width: 130, height: 150, background: "#bfae96", borderRadius: 20 }} />
        {[-35, -10, 15, 40].map((a, i) => (
          <div key={i} style={{ position: "absolute", left: 190, top: 220, width: 70, height: 180, background: "#7d9a6c", borderRadius: "50%", transformOrigin: "bottom center", transform: `rotate(${a}deg)` }} />
        ))}
        {/* Canapé crème */}
        <div style={{ position: "absolute", left: -120, right: -120, top: 480, height: 520, background: "#e9dcc8", borderRadius: 90 }} />
        <div style={{ position: "absolute", left: 140, top: 560, width: 260, height: 240, background: "#d6b98f", borderRadius: 50 }} />
        <div style={{ position: "absolute", right: 60, top: 600, width: 300, height: 230, background: "#c9cdd3", borderRadius: 50 }} />
        <div style={{ position: "absolute", left: -120, right: -120, top: 880, height: 420, background: "#ddcdb6", borderRadius: 70 }} />
        {/* Sol + tapis */}
        <div style={{ position: "absolute", left: -200, right: -200, top: 1300, bottom: -200, background: "linear-gradient(180deg, #b7916c 0%, #a07a58 100%)" }} />
        <div style={{ position: "absolute", left: -100, right: -100, top: 1450, bottom: -200, borderRadius: "50% 50% 0 0", background: "radial-gradient(ellipse at 50% 20%, #f3e8da 0%, #e2d2bf 70%)" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 60%, rgba(60,35,15,0.35) 100%)" }} />
    </AbsoluteFill>
  );
};
