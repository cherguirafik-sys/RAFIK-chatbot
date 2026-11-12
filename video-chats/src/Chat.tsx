// Le chat noir façon "dessin animé 3D", dessiné en SVG et animé image par image
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

type Props = {
  ronronne: boolean; // ondes dorées autour du poitrail
  clignement: boolean; // clignement lent des yeux ("bisou de chat")
  lumiere?: string; // couleur de la lumière de contour (dépend du décor)
};

export const Chat: React.FC<Props> = ({ ronronne, clignement, lumiere = "#ffe2b0" }) => {
  const frame = useCurrentFrame();

  const respiration = 1 + Math.sin(frame / 12) * 0.012; // le corps gonfle doucement
  const queue = Math.sin(frame / 15) * 10; // la queue balance
  const tete = Math.sin(frame / 25) * 4; // la tête penche
  const bouche = 4 + Math.abs(Math.sin(frame / 4)) * 9; // la bouche "parle"
  const regard = Math.sin(frame / 40) * 6; // les pupilles bougent un peu

  // Ouverture des yeux : 1 = ouverts, 0 = fermés
  let yeux = 1;
  if (clignement) {
    const t = frame % 60;
    yeux = interpolate(t, [0, 20, 35, 55], [1, 0.05, 0.05, 1], { extrapolateRight: "clamp" });
  } else {
    yeux = frame % 90 < 4 ? 0.1 : 1;
  }

  const CORPS =
    "M 540 520 C 350 520, 300 780, 300 1020 C 300 1240, 360 1360, 540 1360 C 720 1360, 780 1240, 780 1020 C 780 780, 730 520, 540 520 Z";

  return (
    <svg width={1080} height={1440} viewBox="0 0 1080 1440">
      <defs>
        <radialGradient id="fourrure" cx="45%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#4a3a33" />
          <stop offset="60%" stopColor="#221a17" />
          <stop offset="100%" stopColor="#0e0a09" />
        </radialGradient>
        <radialGradient id="iris" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbff9e" />
          <stop offset="70%" stopColor="#c9d23c" />
          <stop offset="100%" stopColor="#6d7a14" />
        </radialGradient>
        <filter id="flou8">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <filter id="lueur">
          <feGaussianBlur stdDeviation="7" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ombre au sol */}
      <ellipse cx={540} cy={1385} rx={360} ry={45} fill="rgba(0,0,0,0.35)" filter="url(#flou8)" />

      {/* Queue enroulée devant les pattes */}
      <g transform={`rotate(${queue} 380 1340)`}>
        <path d="M 400 1350 C 180 1370, 130 1260, 200 1190" stroke="#1b1412" strokeWidth={70} strokeLinecap="round" fill="none" />
      </g>

      {/* Corps (avec lumière de contour derrière = effet "3D") */}
      <g transform={`translate(540 1360) scale(${respiration}) translate(-540 -1360)`}>
        <path d={CORPS} fill="none" stroke={lumiere} strokeWidth={14} opacity={0.6} filter="url(#flou8)" />
        <path d={CORPS} fill="url(#fourrure)" />
        {/* Tache blanche sur le poitrail */}
        <ellipse cx={540} cy={760} rx={24} ry={32} fill="#f1ebe2" opacity={0.9} filter="url(#lueur)" />
        {/* Pattes avant */}
        <rect x={420} y={1120} width={90} height={250} rx={45} fill="#1a1312" />
        <rect x={570} y={1120} width={90} height={250} rx={45} fill="#1a1312" />
      </g>

      {/* Ondes dorées du ronronnement */}
      {ronronne &&
        [0, 1, 2].map((i) => {
          const p = ((frame + i * 12) % 36) / 36;
          return (
            <ellipse key={i} cx={540} cy={780} rx={190 + p * 230} ry={45 + p * 55} fill="none" stroke="#ffd36b" strokeWidth={8} opacity={1 - p} filter="url(#lueur)" />
          );
        })}

      {/* Tête */}
      <g transform={`rotate(${tete} 540 420)`}>
        {/* Oreilles */}
        <path d="M 320 360 L 345 70 L 500 240 Z" fill="#1d1615" stroke={lumiere} strokeOpacity={0.35} strokeWidth={4} />
        <path d="M 760 360 L 735 70 L 580 240 Z" fill="#1d1615" stroke={lumiere} strokeOpacity={0.35} strokeWidth={4} />
        <path d="M 352 320 L 365 140 L 465 255 Z" fill="#9a5450" />
        <path d="M 728 320 L 715 140 L 615 255 Z" fill="#9a5450" />
        {/* Visage avec contour lumineux */}
        <ellipse cx={540} cy={410} rx={255} ry={220} fill="none" stroke={lumiere} strokeWidth={12} opacity={0.5} filter="url(#flou8)" />
        <ellipse cx={540} cy={410} rx={255} ry={220} fill="url(#fourrure)" />

        {/* Yeux : grands et brillants */}
        {[430, 650].map((x) => (
          <g key={x} transform={`translate(${x} 390) scale(1 ${yeux})`}>
            <ellipse cx={0} cy={0} rx={68} ry={60} fill="#0c0908" />
            <ellipse cx={0} cy={0} rx={62} ry={54} fill="url(#iris)" />
            <ellipse cx={regard} cy={2} rx={24} ry={40} fill="#0b0b0b" />
            <circle cx={-20 + regard} cy={-20} r={13} fill="white" />
            <circle cx={16 + regard} cy={18} r={6} fill="white" opacity={0.7} />
          </g>
        ))}

        {/* Nez rose */}
        <path d="M 518 478 Q 540 470 562 478 Q 552 500 540 504 Q 528 500 518 478 Z" fill="#8a5650" />
        {/* Sourire + bouche ouverte */}
        <path d="M 490 520 Q 515 545 540 520 Q 565 545 590 520" stroke="#0a0706" strokeWidth={5} fill="none" strokeLinecap="round" />
        <ellipse cx={540} cy={535 + bouche / 2} rx={34} ry={bouche} fill="#6a2328" />
        <rect x={520} y={530} width={11} height={11} rx={2} fill="white" />
        <rect x={549} y={530} width={11} height={11} rx={2} fill="white" />

        {/* Moustaches */}
        {[-1, 1].map((cote) =>
          [0, 1, 2].map((i) => (
            <line
              key={`${cote}-${i}`}
              x1={540 + cote * 70}
              y1={500 + i * 12}
              x2={540 + cote * 300}
              y2={460 + i * 38}
              stroke="#f2ece4"
              strokeWidth={2.5}
              opacity={0.85}
            />
          ))
        )}
      </g>
    </svg>
  );
};
