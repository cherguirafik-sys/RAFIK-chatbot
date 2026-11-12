import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONTS } from "./theme";
import { Glow, progress, SourceBadge, Title, usePop, TitlePart } from "./components";

// Chaque scène = un titre + une illustration animée en SVG + une source.
// Toute l'illustration est dessinée dans un SVG de la taille de l'écran (1080 x 1920).

const Canvas: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
    {children}
  </svg>
);

const Ground: React.FC<{ y?: number; delay?: number }> = ({ y = 1300, delay = 0 }) => {
  const frame = useCurrentFrame();
  const p = progress(frame, delay, delay + 20);
  return (
    <line x1={540 - 420 * p} x2={540 + 420 * p} y1={y} y2={y} stroke={COLORS.muted} strokeWidth={4} strokeLinecap="round" />
  );
};

// Un lit simple, réutilisé dans plusieurs scènes
const Bed: React.FC<{ x?: number; y?: number; opacity?: number }> = ({ x = 290, y = 1180, opacity = 1 }) => (
  <g opacity={opacity}>
    <rect x={x} y={y - 120} width={34} height={240} rx={10} fill={COLORS.brownDark} />
    <rect x={x + 34} y={y} width={470} height={60} rx={14} fill={COLORS.paper} stroke={COLORS.muted} strokeWidth={4} />
    <rect x={x + 34} y={y + 60} width={480} height={26} rx={8} fill={COLORS.brown} />
    <rect x={x + 492} y={y + 30} width={22} height={90} rx={8} fill={COLORS.brownDark} />
    <ellipse cx={x + 110} cy={y - 8} rx={62} ry={24} fill="#fff" stroke={COLORS.muted} strokeWidth={4} />
  </g>
);

// ---------------- INTRO ----------------
export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const card = usePop(10, 11);
  const moonGlow = progress(frame, 20, 50);
  return (
    <AbsoluteFill>
      <Title parts={[{ t: "8 sunnas", hl: true }, { t: " avant de dormir" }]} subtitle="que beaucoup oublient" />
      <Glow cx={540} cy={1060} r={330} opacity={moonGlow * 0.9} />
      <div
        style={{
          position: "absolute",
          left: 540 - 150,
          top: 1060 - 190,
          width: 300,
          height: 380,
          borderRadius: 28,
          background: COLORS.brown,
          border: `8px solid ${COLORS.brownDark}`,
          boxShadow: "0 30px 60px rgba(122,52,18,0.35)",
          transform: `scale(${card}) rotate(${(1 - card) * -8}deg)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: COLORS.paper,
          fontFamily: FONTS.sans,
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 40, letterSpacing: 8 }}>NUIT</div>
        <svg width={170} height={170} viewBox="0 0 100 100" style={{ margin: "18px 0" }}>
          <path d="M62 14 A38 38 0 1 0 86 70 A30 30 0 1 1 62 14 Z" fill={COLORS.paper} />
        </svg>
        <div style={{ fontWeight: 700, fontSize: 28, letterSpacing: 6 }}>AL-LAYL</div>
      </div>
      {/* petites étoiles qui scintillent */}
      <Canvas>
        {[
          [250, 820],
          [840, 760],
          [880, 1250],
          [200, 1300],
          [760, 1420],
          [320, 1500],
        ].map(([x, y], i) => {
          const tw = 0.4 + 0.6 * Math.abs(Math.sin((frame + i * 13) / 9));
          const o = progress(frame, 15 + i * 4, 30 + i * 4) * tw;
          return <circle key={i} cx={x} cy={y} r={7} fill={COLORS.brown} opacity={o} />;
        })}
      </Canvas>
    </AbsoluteFill>
  );
};

// ---------------- 1. Ablutions ----------------
export const Wudu: React.FC = () => {
  const frame = useCurrentFrame();
  const bowl = usePop(12);
  return (
    <AbsoluteFill>
      <Title parts={[{ t: "Fais tes " }, { t: "ablutions", hl: true }]} subtitle="avant de te coucher" />
      <Canvas>
        <Ground delay={6} />
        {/* gouttes qui tombent en boucle */}
        {[0, 1, 2].map((i) => {
          const t = ((frame + i * 14 - 20) % 42) / 42;
          if (frame < 20 + i * 6) return null;
          const y = interpolate(t, [0, 1], [760, 1150]);
          const x = 500 + i * 40;
          return (
            <path
              key={i}
              d={`M ${x} ${y - 34} C ${x - 20} ${y - 4}, ${x - 18} ${y + 18}, ${x} ${y + 18} C ${x + 18} ${y + 18}, ${x + 20} ${y - 4}, ${x} ${y - 34} Z`}
              fill={COLORS.brown}
              opacity={1 - t * 0.4}
            />
          );
        })}
        {/* ondes dans le bol */}
        {[0, 1].map((i) => {
          const t = ((frame + i * 21) % 42) / 42;
          return frame > 30 ? (
            <ellipse key={i} cx={540} cy={1180} rx={40 + t * 160} ry={8 + t * 26} fill="none" stroke={COLORS.brown} strokeWidth={4} opacity={1 - t} />
          ) : null;
        })}
        <g transform={`translate(540 1200) scale(${bowl}) translate(-540 -1200)`}>
          <path d="M 330 1180 Q 540 1340 750 1180 Z" fill={COLORS.brownDark} />
          <rect x={470} y={1262} width={140} height={22} rx={8} fill={COLORS.brownDark} />
        </g>
      </Canvas>
      <SourceBadge text="Sahîh al-Bukhârî 247" />
    </AbsoluteFill>
  );
};

// ---------------- 2. Secouer le lit ----------------
export const DustBed: React.FC = () => {
  const frame = useCurrentFrame();
  const bed = usePop(8);
  const shake = frame > 40 && frame < 90 ? Math.sin(frame * 1.4) * 10 : 0;
  // particules de poussière qui s'envolent
  const dust = Array.from({ length: 22 }, (_, i) => {
    const angle = -Math.PI * (0.1 + (i / 22) * 0.8);
    const start = 45 + (i % 6) * 4;
    const t = progress(frame, start, start + 40);
    const dist = 120 + (i * 37) % 200;
    return {
      x: 560 + Math.cos(angle) * dist * t + ((i * 53) % 300) - 150,
      y: 1170 + Math.sin(angle) * dist * t,
      o: t > 0 ? 1 - t : 0,
      r: 6 + (i % 4) * 3,
    };
  });
  return (
    <AbsoluteFill>
      <Title parts={[{ t: "Secoue", hl: true }, { t: " ton lit" }]} subtitle="avec un pan de ton vêtement" />
      <Canvas>
        <Ground delay={4} y={1310} />
        <g transform={`translate(${shake} 0) translate(540 1200) scale(${bed}) translate(-540 -1200)`}>
          <Bed />
        </g>
        {dust.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={COLORS.soft} opacity={d.o} />
        ))}
        {/* pan de tissu qui balaie */}
        {frame > 38 && frame < 100 ? (
          <path
            d={`M ${380 + ((frame - 38) / 62) * 380} 1120 q 40 -60 90 -10 q -30 30 -90 10 Z`}
            fill={COLORS.brown}
            opacity={interpolate(frame, [38, 45, 92, 100], [0, 1, 1, 0])}
          />
        ) : null}
      </Canvas>
      <SourceBadge text="Sahîh al-Bukhârî 6320" />
    </AbsoluteFill>
  );
};

// ---------------- 3. Côté droit ----------------
export const RightSide: React.FC = () => {
  const frame = useCurrentFrame();
  const sleeper = progress(frame, 20, 45);
  const arrow = progress(frame, 50, 85);
  const zz = progress(frame, 90, 110);
  return (
    <AbsoluteFill>
      <Title parts={[{ t: "Allonge-toi sur le " }, { t: "côté droit", hl: true }]} subtitle="pour t'endormir" />
      <Canvas>
        <Ground delay={4} y={1310} />
        <Bed />
        {/* dormeur (tête + corps sous la couverture) */}
        <g opacity={sleeper} transform={`translate(0 ${(1 - sleeper) * -40})`}>
          <circle cx={400} cy={1130} r={38} fill={COLORS.brownDark} />
          <path d="M 440 1180 Q 460 1105 560 1112 L 770 1125 Q 800 1150 780 1180 Z" fill={COLORS.brown} />
        </g>
        {/* flèche courbe vers la droite */}
        <path
          d="M 330 1000 Q 540 880 750 1000"
          fill="none"
          stroke={COLORS.brown}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={520}
          strokeDashoffset={520 * (1 - arrow)}
        />
        <path d="M 728 972 L 756 1004 L 716 1012" fill="none" stroke={COLORS.brown} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" opacity={arrow > 0.95 ? 1 : 0} />
        <text x={540} y={1390} textAnchor="middle" fontFamily={FONTS.sans} fontWeight={800} fontSize={30} letterSpacing={6} fill={COLORS.muted} opacity={arrow}>
          CÔTÉ DROIT
        </text>
        <text x={470} y={1060} fontFamily={FONTS.serif} fontStyle="italic" fontSize={56} fill={COLORS.brownDark} opacity={zz}>
          z<tspan dy={-26} fontSize={44}>z</tspan>
          <tspan dy={-22} fontSize={34}>z</tspan>
        </text>
      </Canvas>
      <SourceBadge text="Sahîh al-Bukhârî 247" />
    </AbsoluteFill>
  );
};

// Un livre ouvert avec texte arabe à droite et latin à gauche
const OpenBook: React.FC<{ arabic: string; latin: string; sub?: string; y?: number; scale?: number }> = ({
  arabic,
  latin,
  sub,
  y = 1100,
  scale = 1,
}) => (
  <g transform={`translate(540 ${y}) scale(${scale}) translate(-540 ${-y})`}>
    <path d={`M 290 ${y - 110} L 540 ${y - 90} L 540 ${y + 120} L 290 ${y + 100} Z`} fill="#fff" stroke={COLORS.muted} strokeWidth={4} />
    <path d={`M 790 ${y - 110} L 540 ${y - 90} L 540 ${y + 120} L 790 ${y + 100} Z`} fill="#fff" stroke={COLORS.muted} strokeWidth={4} />
    <text x={415} y={y - 20} textAnchor="middle" fontFamily={FONTS.serif} fontStyle="italic" fontSize={44} fill={COLORS.ink}>
      {latin}
    </text>
    <text x={665} y={y - 10} textAnchor="middle" fontFamily={FONTS.arabic} fontSize={52} fill={COLORS.ink} direction="rtl">
      {arabic}
    </text>
    {sub ? (
      <text x={415} y={y + 30} textAnchor="middle" fontFamily={FONTS.sans} fontWeight={700} fontSize={20} letterSpacing={3} fill={COLORS.muted}>
        {sub}
      </text>
    ) : null}
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <line x1={330} x2={500} y1={y + 55 + i * 14} y2={y + 55 + i * 14} stroke={COLORS.soft} strokeWidth={3} />
        <line x1={580} x2={750} y1={y + 55 + i * 14} y2={y + 55 + i * 14} stroke={COLORS.soft} strokeWidth={3} />
      </g>
    ))}
  </g>
);

// ---------------- 4. Âyat al-Kursî ----------------
export const AyatKursi: React.FC = () => {
  const frame = useCurrentFrame();
  const book = usePop(10);
  const shield = progress(frame, 50, 95);
  const glow = progress(frame, 80, 110);
  return (
    <AbsoluteFill>
      <Title parts={[{ t: "Récite l'" }, { t: "Âyat al-Kursî", hl: true }]} subtitle="un gardien veille sur toi" />
      <Glow cx={540} cy={1150} r={380} opacity={glow * 0.8} />
      <Canvas>
        {/* dôme de protection qui se dessine */}
        <path
          d="M 220 1310 A 320 320 0 0 1 860 1310"
          fill="none"
          stroke={COLORS.brown}
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={1010}
          strokeDashoffset={1010 * (1 - shield)}
        />
        <path
          d="M 260 1310 A 280 280 0 0 1 820 1310"
          fill="none"
          stroke={COLORS.soft}
          strokeWidth={3}
          strokeDasharray="10 14"
          opacity={shield}
        />
        <Ground y={1310} delay={4} />
        <OpenBook arabic="آية الكرسي" latin="al-Baqara" sub="VERSET 255" y={1170} scale={book * 0.85} />
        <text x={540} y={1390} textAnchor="middle" fontFamily={FONTS.sans} fontWeight={800} fontSize={28} letterSpacing={5} fill={COLORS.muted} opacity={glow}>
          JUSQU'AU MATIN
        </text>
      </Canvas>
      <SourceBadge text="Sahîh al-Bukhârî 2311" />
    </AbsoluteFill>
  );
};

// ---------------- 5. Deux derniers versets d'al-Baqara ----------------
export const Baqara: React.FC = () => {
  const frame = useCurrentFrame();
  const book = usePop(10);
  const check = progress(frame, 70, 95);
  const label = usePop(90);
  return (
    <AbsoluteFill>
      <Title parts={[{ t: "Les " }, { t: "2 derniers versets", hl: true }]} subtitle="d'al-Baqara te suffiront" />
      <Canvas>
        <Ground y={1310} delay={4} />
        <OpenBook arabic="البقرة" latin="al-Baqara" sub="285 · 286" y={1080} scale={book * 0.9} />
        <circle cx={540} cy={1300} r={70 * check} fill={COLORS.brown} />
        <path
          d="M 505 1300 L 532 1328 L 580 1275"
          fill="none"
          stroke={COLORS.paper}
          strokeWidth={12}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={130}
          strokeDashoffset={130 * (1 - progress(frame, 85, 100))}
        />
        <text
          x={540}
          y={1430}
          textAnchor="middle"
          fontFamily={FONTS.serif}
          fontStyle="italic"
          fontSize={52}
          fill={COLORS.brownDark}
          opacity={label}
        >
          « elles lui suffiront »
        </text>
      </Canvas>
      <SourceBadge text="Sahîh al-Bukhârî 5009" />
    </AbsoluteFill>
  );
};

// ---------------- 6. Les 3 Qul ----------------
export const ThreeQul: React.FC = () => {
  const frame = useCurrentFrame();
  const surahs = [
    { ar: "الإخلاص", la: "al-Ikhlâs" },
    { ar: "الفلق", la: "al-Falaq" },
    { ar: "الناس", la: "an-Nâs" },
  ];
  const times = usePop(100, 10);
  return (
    <AbsoluteFill>
      <Title parts={[{ t: "Souffle", hl: true }, { t: " dans tes mains" }]} subtitle="récite les 3 Qul, puis essuie-toi" />
      {surahs.map((s, i) => {
        const p = usePop(18 + i * 18);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 105 + i * 300,
              top: 920,
              width: 270,
              height: 330,
              borderRadius: 26,
              background: i === 1 ? COLORS.brown : COLORS.paper,
              border: `5px solid ${i === 1 ? COLORS.brownDark : COLORS.soft}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 18,
              transform: `translateY(${(1 - p) * 120}px) scale(${0.6 + 0.4 * p})`,
              opacity: p,
              boxShadow: "0 20px 40px rgba(122,52,18,0.18)",
            }}
          >
            <div style={{ fontFamily: FONTS.arabic, fontSize: 64, color: i === 1 ? COLORS.paper : COLORS.ink }}>{s.ar}</div>
            <div style={{ fontFamily: FONTS.serif, fontStyle: "italic", fontSize: 42, color: i === 1 ? COLORS.paper : COLORS.brownDark }}>
              {s.la}
            </div>
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          top: 1300,
          width: "100%",
          textAlign: "center",
          fontFamily: FONTS.sans,
          fontWeight: 800,
          fontSize: 96,
          color: COLORS.brown,
          transform: `scale(${times})`,
          opacity: times,
        }}
      >
        × 3
      </div>
      <SourceBadge text="Sahîh al-Bukhârî 5017" />
    </AbsoluteFill>
  );
};

// ---------------- 7. Tasbîh 33 / 33 / 34 ----------------
export const Tasbih: React.FC = () => {
  const frame = useCurrentFrame();
  const phases = [
    { label: "SubhânAllâh", n: 33, start: 39, end: 95 },
    { label: "Alhamdulillâh", n: 33, start: 106, end: 170 },
    { label: "Allâhu akbar", n: 34, start: 182, end: 250 },
  ];
  let idx = 0;
  phases.forEach((p, i) => {
    if (frame >= p.start) idx = i;
  });
  const ph = phases[idx];
  const t = progress(frame, ph.start, ph.end);
  const count = Math.round(t * ph.n);
  const R = 170;
  const C = 2 * Math.PI * R;
  const ring = usePop(8);
  return (
    <AbsoluteFill>
      <Title parts={[{ t: "Le " }, { t: "tasbîh", hl: true }, { t: " de Fâtima" }]} subtitle="meilleur qu'un serviteur" />
      <Canvas>
        <g transform={`translate(540 1110) scale(${ring})`}>
          <circle r={R} fill="none" stroke={COLORS.soft} strokeWidth={14} opacity={0.6} />
          <circle
            r={R}
            fill="none"
            stroke={COLORS.brown}
            strokeWidth={14}
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - t)}
            transform="rotate(-90)"
          />
          <text y={30} textAnchor="middle" fontFamily={FONTS.sans} fontWeight={800} fontSize={130} fill={COLORS.ink}>
            {count}
          </text>
          <text y={95} textAnchor="middle" fontFamily={FONTS.sans} fontWeight={700} fontSize={24} letterSpacing={4} fill={COLORS.muted}>
            / {ph.n}
          </text>
        </g>
        <text x={540} y={1380} textAnchor="middle" fontFamily={FONTS.serif} fontStyle="italic" fontSize={60} fill={COLORS.brownDark}>
          {ph.label}
        </text>
        {/* trois petits points d'étape */}
        {phases.map((p, i) => (
          <circle key={i} cx={500 + i * 40} cy={1430} r={10} fill={i <= idx ? COLORS.brown : COLORS.soft} />
        ))}
      </Canvas>
      <SourceBadge text="Sahîh al-Bukhârî 3705" />
    </AbsoluteFill>
  );
};

// ---------------- 8. L'invocation ----------------
export const Dua: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = progress(frame, 10, 60);
  const ar = progress(frame, 45, 75);
  const tr = progress(frame, 70, 95);
  const fr = progress(frame, 95, 120);
  return (
    <AbsoluteFill>
      <Title parts={[{ t: "Tes " }, { t: "derniers mots", hl: true }]} subtitle="avant de fermer les yeux" />
      <Glow cx={540} cy={1000 + (1 - rise) * 150} r={260} opacity={rise * 0.9} />
      <Canvas>
        <path
          transform={`translate(${540 - 60} ${940 + (1 - rise) * 150})`}
          d="M74 0 A60 60 0 1 0 120 88 A48 48 0 1 1 74 0 Z"
          fill={COLORS.brown}
          opacity={rise}
        />
        <Ground y={1120} delay={0} />
      </Canvas>
      <div style={{ position: "absolute", top: 1190, width: "100%", textAlign: "center" }}>
        <div style={{ fontFamily: FONTS.arabic, fontSize: 74, color: COLORS.ink, direction: "rtl", opacity: ar, transform: `translateY(${(1 - ar) * 20}px)` }}>
          بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا
        </div>
        <div style={{ marginTop: 18, fontFamily: FONTS.serif, fontStyle: "italic", fontSize: 46, color: COLORS.brownDark, opacity: tr }}>
          Bismika Allâhumma amûtu wa ahyâ
        </div>
        <div style={{ marginTop: 10, fontFamily: FONTS.sans, fontWeight: 600, fontSize: 32, color: COLORS.muted, opacity: fr }}>
          « C'est en Ton nom, ô Allah, que je meurs et je vis »
        </div>
      </div>
      <SourceBadge text="Sahîh al-Bukhârî 6324" />
    </AbsoluteFill>
  );
};

// ---------------- Checklist finale ----------------
export const Checklist: React.FC = () => {
  const frame = useCurrentFrame();
  const items = [
    "Faire ses ablutions",
    "Secouer son lit",
    "S'allonger sur le côté droit",
    "Réciter l'Âyat al-Kursî",
    "Les 2 derniers versets d'al-Baqara",
    "Souffler + les 3 Qul (× 3)",
    "33 · 33 · 34",
    "Bismika Allâhumma amûtu wa ahyâ",
  ];
  const card = usePop(10, 15);
  return (
    <AbsoluteFill>
      <Title parts={[{ t: "Laquelle vas-tu" }]} subtitle="faire revivre ce soir ?" />
      <div
        style={{
          position: "absolute",
          left: 110,
          right: 110,
          top: 560,
          background: COLORS.paper,
          borderRadius: 30,
          padding: "44px 50px",
          boxShadow: "0 30px 70px rgba(122,52,18,0.22)",
          transform: `translateY(${(1 - card) * 200}px)`,
          opacity: card,
        }}
      >
        <div style={{ textAlign: "center", fontFamily: FONTS.sans, fontWeight: 800, fontSize: 26, letterSpacing: 6, color: COLORS.brown, marginBottom: 30 }}>
          CE SOIR
        </div>
        {items.map((it, i) => {
          const ticked = progress(frame, 50 + i * 14, 58 + i * 14);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 22, padding: "15px 0", borderBottom: i < 7 ? `2px solid ${COLORS.bg}` : "none" }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: COLORS.brown,
                  color: COLORS.paper,
                  fontFamily: FONTS.sans,
                  fontWeight: 800,
                  fontSize: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <div style={{ flex: 1, fontFamily: FONTS.sans, fontWeight: 600, fontSize: 33, color: COLORS.ink }}>{it}</div>
              <svg width={48} height={48} viewBox="0 0 48 48">
                <circle cx={24} cy={24} r={20} fill={ticked > 0 ? COLORS.brown : "none"} stroke={COLORS.soft} strokeWidth={ticked > 0 ? 0 : 3} opacity={ticked > 0 ? ticked : 1} />
                <path d="M15 24 L21 30 L33 17" fill="none" stroke={COLORS.paper} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={30} strokeDashoffset={30 * (1 - ticked)} />
              </svg>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------------- Outro / signature ----------------
export const Outro: React.FC<{ brand: string; cta: string }> = ({ brand, cta }) => {
  const frame = useCurrentFrame();
  const star = progress(frame, 5, 45);
  const txt = usePop(35);
  const rot = interpolate(frame, [0, 90], [-20, 0]);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <svg width={360} height={360} viewBox="-100 -100 200 200" style={{ transform: `rotate(${rot}deg)`, marginTop: -160 }}>
        {[0, 45].map((a) => (
          <rect
            key={a}
            x={-62}
            y={-62}
            width={124}
            height={124}
            transform={`rotate(${a})`}
            fill="none"
            stroke={COLORS.ink}
            strokeWidth={9}
            strokeDasharray={496}
            strokeDashoffset={496 * (1 - star)}
          />
        ))}
        <circle r={30 * star} fill={COLORS.brown} />
      </svg>
      <div style={{ marginTop: 40, fontFamily: FONTS.serif, fontSize: 84, letterSpacing: 10, color: COLORS.ink, opacity: txt, transform: `translateY(${(1 - txt) * 20}px)` }}>
        {brand}
      </div>
      <div style={{ marginTop: 16, fontFamily: FONTS.sans, fontWeight: 700, fontSize: 32, letterSpacing: 4, color: COLORS.brown, opacity: progress(frame, 50, 65) }}>
        {cta}
      </div>
    </AbsoluteFill>
  );
};

export type { TitlePart };
