// Gros coeur doré brillant + petits coeurs roses + étincelles (comme le modèle)
import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

// Forme d'un coeur en SVG (centré sur 0,0, taille ~100)
const COEUR = "M 0 30 C -60 -10, -50 -60, 0 -30 C 50 -60, 60 -10, 0 30 Z";

export const CoeurDore: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const apparition = spring({ frame, fps, config: { damping: 9 } }); // arrivée avec rebond
  const flotte = Math.sin(frame / 12) * 15; // le coeur flotte de haut en bas
  const battement = 1 + Math.max(0, Math.sin(frame / 5)) * 0.06; // petit "boum boum"

  return (
    <svg width={1080} height={900} viewBox="0 0 1080 900" style={{ position: "absolute", top: 0, left: 0 }}>
      <defs>
        <linearGradient id="or" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff6b0" />
          <stop offset="45%" stopColor="#ffcf3f" />
          <stop offset="100%" stopColor="#c98a10" />
        </linearGradient>
        <filter id="halo" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="18" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Petits coeurs roses */}
      {[
        { x: 560, y: 380, s: 0.9, d: 6 },
        { x: 680, y: 330, s: 1.2, d: 10 },
      ].map((c, i) => {
        const a = spring({ frame: frame - c.d, fps, config: { damping: 12 } });
        return (
          <path
            key={i}
            d={COEUR}
            fill="#ffd9e6"
            opacity={0.85 * a}
            filter="url(#halo)"
            transform={`translate(${c.x} ${c.y + Math.sin(frame / 10 + i) * 8}) scale(${c.s * a})`}
          />
        );
      })}

      {/* Gros coeur doré */}
      <path
        d={COEUR}
        fill="url(#or)"
        filter="url(#halo)"
        transform={`translate(860 ${360 + flotte}) scale(${2.6 * apparition * battement})`}
      />
      {/* Reflet blanc sur le coeur */}
      <ellipse cx={820} cy={330 + flotte} rx={22 * apparition} ry={12 * apparition} fill="white" opacity={0.7} transform={`rotate(-30 820 ${330 + flotte})`} />

      {/* Étincelles qui scintillent */}
      {Array.from({ length: 14 }).map((_, i) => {
        const x = 760 + ((i * 53) % 240) - 20;
        const y = 220 + ((i * 97) % 300);
        const brille = Math.max(0, Math.sin(frame / 6 + i * 1.7));
        return <circle key={i} cx={x} cy={y - ((frame + i * 10) % 80)} r={3 + brille * 5} fill="#fff1b8" opacity={brille * apparition} filter="url(#halo)" />;
      })}
    </svg>
  );
};
