// Le chat noir dessiné en SVG, animé image par image
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

type Props = {
  ronronne: boolean; // affiche les ondes dorées du ronronnement
  clignement: boolean; // clignement lent des yeux
  coeurs: boolean; // petits coeurs qui montent
};

export const Chat: React.FC<Props> = ({ ronronne, clignement, coeurs }) => {
  const frame = useCurrentFrame();

  // Respiration : le corps gonfle doucement
  const respiration = 1 + Math.sin(frame / 12) * 0.012;
  // La queue balance de gauche à droite
  const queue = Math.sin(frame / 15) * 12;
  // La tête penche un peu
  const tete = Math.sin(frame / 25) * 3;
  // La bouche s'ouvre et se ferme (comme s'il parlait)
  const bouche = 6 + Math.abs(Math.sin(frame / 4)) * 10;

  // Ouverture des yeux : 1 = ouverts, 0 = fermés
  let yeux = 1;
  if (clignement) {
    // Clignement LENT (le "bisou de chat") toutes les 60 images
    const t = frame % 60;
    yeux = interpolate(t, [0, 20, 35, 55], [1, 0.05, 0.05, 1], {
      extrapolateRight: "clamp",
    });
  } else {
    // Clignement normal et rapide de temps en temps
    const t = frame % 90;
    yeux = t < 4 ? 0.1 : 1;
  }

  return (
    <svg width={1080} height={1400} viewBox="0 0 1080 1400">
      <defs>
        <radialGradient id="fourrure" cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#3a2e2a" />
          <stop offset="100%" stopColor="#140f0e" />
        </radialGradient>
        <radialGradient id="oeil" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f4f7a1" />
          <stop offset="100%" stopColor="#b8c43a" />
        </radialGradient>
        <filter id="lueur">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ombre au sol */}
      <ellipse cx={540} cy={1330} rx={330} ry={40} fill="rgba(0,0,0,0.25)" />

      {/* Queue */}
      <g transform={`rotate(${queue} 400 1280)`}>
        <path
          d="M 400 1290 C 220 1300, 160 1200, 230 1130"
          stroke="#1a1312"
          strokeWidth={60}
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* Corps */}
      <g transform={`translate(540 1300) scale(${respiration}) translate(-540 -1300)`}>
        <path
          d="M 540 560 C 360 560, 320 800, 330 1000 C 335 1180, 380 1310, 540 1310 C 700 1310, 745 1180, 750 1000 C 760 800, 720 560, 540 560 Z"
          fill="url(#fourrure)"
        />
        {/* Petite tache blanche sur le poitrail */}
        <ellipse cx={540} cy={800} rx={28} ry={36} fill="#e9e1d6" opacity={0.85} />
        {/* Pattes avant */}
        <rect x={430} y={1080} width={80} height={230} rx={40} fill="#1d1615" />
        <rect x={570} y={1080} width={80} height={230} rx={40} fill="#1d1615" />
      </g>

      {/* Ondes dorées du ronronnement */}
      {ronronne &&
        [0, 1, 2].map((i) => {
          const p = ((frame + i * 12) % 36) / 36; // 0 -> 1 en boucle
          return (
            <ellipse
              key={i}
              cx={540}
              cy={820}
              rx={200 + p * 220}
              ry={50 + p * 60}
              fill="none"
              stroke="#ffd36b"
              strokeWidth={8}
              opacity={1 - p}
              filter="url(#lueur)"
            />
          );
        })}

      {/* Tête */}
      <g transform={`rotate(${tete} 540 450)`}>
        {/* Oreilles */}
        <path d="M 330 380 L 360 120 L 500 280 Z" fill="#1d1615" />
        <path d="M 750 380 L 720 120 L 580 280 Z" fill="#1d1615" />
        <path d="M 360 340 L 375 180 L 470 290 Z" fill="#8a4a44" />
        <path d="M 720 340 L 705 180 L 610 290 Z" fill="#8a4a44" />
        {/* Visage */}
        <ellipse cx={540} cy={440} rx={240} ry={210} fill="url(#fourrure)" />

        {/* Yeux */}
        {[440, 640].map((x) => (
          <g key={x} transform={`translate(${x} 420) scale(1 ${yeux})`}>
            <ellipse cx={0} cy={0} rx={55} ry={48} fill="url(#oeil)" />
            <ellipse cx={0} cy={0} rx={16} ry={40} fill="#0b0b0b" />
            <circle cx={-15} cy={-18} r={10} fill="white" opacity={0.9} />
          </g>
        ))}

        {/* Nez */}
        <path d="M 520 495 L 560 495 L 540 520 Z" fill="#7a4a46" />
        {/* Bouche qui s'ouvre */}
        <ellipse cx={540} cy={545} rx={30} ry={bouche} fill="#5a1f22" />
        <rect x={522} y={538} width={10} height={10} fill="white" />
        <rect x={548} y={538} width={10} height={10} fill="white" />

        {/* Moustaches */}
        {[-1, 1].map((cote) =>
          [0, 1, 2].map((i) => (
            <line
              key={`${cote}-${i}`}
              x1={540 + cote * 60}
              y1={515 + i * 12}
              x2={540 + cote * 280}
              y2={480 + i * 35}
              stroke="#e8e2da"
              strokeWidth={3}
              opacity={0.8}
            />
          ))
        )}
      </g>

      {/* Petits coeurs qui s'envolent */}
      {coeurs &&
        [0, 1, 2, 3].map((i) => {
          const p = ((frame + i * 15) % 60) / 60;
          const x = 300 + i * 160 + Math.sin(frame / 8 + i) * 20;
          const y = 600 - p * 450;
          return (
            <text key={i} x={x} y={y} fontSize={90} opacity={1 - p} textAnchor="middle">
              ❤️
            </text>
          );
        })}
    </svg>
  );
};
