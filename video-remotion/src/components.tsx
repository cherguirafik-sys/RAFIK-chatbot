import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { COLORS, FONTS } from "./theme";

// ---------- Petits outils d'animation ----------

// Renvoie une valeur qui passe de 0 à 1 avec un effet "ressort", à partir de `delay` (en images)
export const usePop = (delay = 0, damping = 14) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, mass: 0.6 } });
};

// Passe de 0 à 1 de façon linéaire adoucie entre deux images
export const progress = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

// ---------- Fond parchemin ----------

// Version rapide utilisée dans la vidéo : une simple image (public/fond.png)
export const Parchment: React.FC = () => (
  <AbsoluteFill>
    <Img src={staticFile("fond.png")} style={{ width: "100%", height: "100%" }} />
  </AbsoluteFill>
);

// Version "calculée" (lente) : sert à fabriquer fond.png une seule fois
export const ParchmentSvg: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 40%, rgba(255,245,228,0.7) 0%, rgba(244,223,194,0) 60%), radial-gradient(ellipse at 50% 110%, ${COLORS.bgDark} 0%, rgba(233,203,164,0) 60%)`,
      }}
    />
    {/* Texture de papier générée par un filtre SVG */}
    <svg width="1080" height="1920" style={{ position: "absolute", opacity: 0.22, mixBlendMode: "multiply" }}>
      <filter id="paper">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="4" seed="7" />
        <feColorMatrix
          values="0 0 0 0 0.55  0 0 0 0 0.38  0 0 0 0 0.2  0 0 0 0.6 0"
        />
      </filter>
      <rect width="100%" height="100%" filter="url(#paper)" />
    </svg>
  </AbsoluteFill>
);

// ---------- Titre avec mot surligné + sous-titre italique ----------

export type TitlePart = { t: string; hl?: boolean };

export const Title: React.FC<{ parts: TitlePart[]; subtitle?: string; delay?: number }> = ({
  parts,
  subtitle,
  delay = 4,
}) => {
  const frame = useCurrentFrame();
  const pop = usePop(delay);
  const hl = usePop(delay + 8, 12);
  const sub = progress(frame, delay + 12, delay + 26);

  return (
    <div
      style={{
        position: "absolute",
        top: 250,
        left: 70,
        right: 70,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: FONTS.sans,
          fontWeight: 700,
          fontSize: 68,
          lineHeight: 1.25,
          color: COLORS.ink,
          letterSpacing: -1,
          opacity: pop,
          transform: `translateY(${(1 - pop) * 30}px)`,
        }}
      >
        {parts.map((p, i) =>
          p.hl ? (
            <span
              key={i}
              style={{
                position: "relative",
                display: "inline-block",
                color: COLORS.paper,
                padding: "0 14px",
                margin: "0 4px",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  inset: "4px 0 2px 0",
                  background: COLORS.brown,
                  borderRadius: 12,
                  transform: `scaleX(${hl})`,
                  transformOrigin: "left center",
                }}
              />
              <span style={{ position: "relative", color: hl > 0.5 ? COLORS.paper : COLORS.ink }}>{p.t}</span>
            </span>
          ) : (
            <span key={i}>{p.t}</span>
          )
        )}
      </div>
      {subtitle ? (
        <div
          style={{
            marginTop: 14,
            fontFamily: FONTS.serif,
            fontStyle: "italic",
            fontSize: 58,
            color: COLORS.brownDark,
            opacity: sub,
            transform: `translateY(${(1 - sub) * 16}px)`,
          }}
        >
          {subtitle}
        </div>
      ) : null}
    </div>
  );
};

// ---------- Badge de la source (référence du hadith) ----------

export const SourceBadge: React.FC<{ text: string; delay?: number }> = ({ text, delay = 30 }) => {
  const frame = useCurrentFrame();
  const o = progress(frame, delay, delay + 15);
  return (
    <div
      style={{
        position: "absolute",
        bottom: 330,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        opacity: o,
      }}
    >
      <div
        style={{
          fontFamily: FONTS.sans,
          fontWeight: 700,
          fontSize: 26,
          letterSpacing: 2.5,
          color: COLORS.brown,
          border: `2.5px solid ${COLORS.soft}`,
          borderRadius: 40,
          padding: "12px 30px",
          background: "rgba(251,243,231,0.55)",
          textTransform: "uppercase",
        }}
      >
        {text}
      </div>
    </div>
  );
};

// ---------- Enveloppe de scène : fondu d'entrée et de sortie ----------

export const SceneFade: React.FC<{ duration: number; children: React.ReactNode }> = ({
  duration,
  children,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 8, duration - 8, duration], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

// Petit halo orange doux (comme la "lumière" dans la vidéo d'origine)
export const Glow: React.FC<{ cx: number; cy: number; r: number; opacity?: number }> = ({
  cx,
  cy,
  r,
  opacity = 1,
}) => (
  <div
    style={{
      position: "absolute",
      left: cx - r,
      top: cy - r,
      width: r * 2,
      height: r * 2,
      borderRadius: "50%",
      background: `radial-gradient(circle, rgba(214,110,50,0.55) 0%, rgba(214,110,50,0.18) 45%, rgba(214,110,50,0) 70%)`,
      opacity,
    }}
  />
);
