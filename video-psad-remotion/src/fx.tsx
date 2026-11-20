import React from 'react';
import {AbsoluteFill, Audio, interpolate, random, Sequence, spring, SpringConfig, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, DISPLAY, SERIF} from './theme';

// ─────────────────────────────────────────────────────────────────────────────
// Boîte à outils « motion design réseaux sociaux » (TikTok / Reels / Shorts).
// Tous les temps (`at`) sont en SECONDES depuis le début de la scène.
// ─────────────────────────────────────────────────────────────────────────────

// Réglages de ressort prêts à l'emploi
export const SPRINGS = {
  // apparition « pop » : petit dépassement puis stabilisation (le look TikTok)
  pop: {damping: 11, stiffness: 170, mass: 0.7} as Partial<SpringConfig>,
  // mouvement franc sans rebond (barres, glissements)
  snappy: {damping: 22, stiffness: 160, mass: 0.8} as Partial<SpringConfig>,
  // gros impact qui rebondit (chiffre clé, carte d'alerte)
  slam: {damping: 9, stiffness: 220, mass: 0.9} as Partial<SpringConfig>,
};

// Ressort 0 → 1 (peut dépasser 1 brièvement) qui démarre à `at` secondes
export const useSpringAt = (at: number, config: Partial<SpringConfig> = SPRINGS.pop) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - Math.round(at * fps), fps, config});
};

// ── Pop : grossit avec rebond + flou qui disparaît (« blur-in ») ─────────────
export const Pop: React.FC<{
  at: number;
  from?: number; // échelle de départ
  dy?: number; // décalage vertical de départ (px)
  rotate?: number; // rotation de départ (degrés)
  blur?: number;
  config?: Partial<SpringConfig>;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({at, from = 0.6, dy = 40, rotate = 0, blur = 14, config = SPRINGS.pop, style, children}) => {
  const s = useSpringAt(at, config);
  const k = Math.min(1, s); // pour l'opacité et le flou (pas de dépassement)
  return (
    <div
      style={{
        opacity: k,
        filter: k < 0.999 ? `blur(${blur * (1 - k)}px)` : undefined,
        transform: `translateY(${dy * (1 - s)}px) scale(${from + (1 - from) * s}) rotate(${rotate * (1 - s)}deg)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ── Surligneur : bande de couleur qui « balaie » derrière un mot ─────────────
export const Marker: React.FC<{at: number; color?: string; children: React.ReactNode; tilt?: number}> = ({
  at,
  color = C.verSoft,
  tilt = -1.5,
  children,
}) => {
  const s = useSpringAt(at, SPRINGS.snappy);
  return (
    <span style={{position: 'relative', display: 'inline-block', padding: '0 0.12em'}}>
      <span
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '18%',
          bottom: '8%',
          background: color,
          borderRadius: 10,
          transformOrigin: 'left center',
          transform: `rotate(${tilt}deg) scaleX(${Math.max(0, Math.min(1, s))})`,
        }}
      />
      <span style={{position: 'relative'}}>{children}</span>
    </span>
  );
};

// ── Texte cinétique : les mots apparaissent un par un (style sous-titres viraux)
// `highlight` : liste de mots à surligner (comparaison sans ponctuation, insensible à la casse)
export const Words: React.FC<{
  text: string;
  at: number;
  stagger?: number; // délai entre deux mots (s)
  style?: React.CSSProperties;
  highlight?: string[];
  highlightColor?: string;
  accent?: string; // couleur des mots surlignés
}> = ({text, at, stagger = 0.09, style, highlight = [], highlightColor = C.verSoft, accent}) => {
  const norm = (w: string) => w.toLowerCase().replace(/[.,!?…:;«»"]/g, '');
  const hl = new Set(highlight.map(norm));
  const words = text.split(' ');
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: '0.24em', ...style}}>
      {words.map((w, i) => {
        const wAt = at + i * stagger;
        const isHl = hl.has(norm(w));
        return (
          <Pop key={i} at={wAt} from={0.4} dy={30} blur={10} style={{display: 'inline-block'}}>
            {isHl ? (
              <Marker at={wAt + 0.15} color={highlightColor}>
                <span style={{color: accent}}>{w}</span>
              </Marker>
            ) : (
              w
            )}
          </Pop>
        );
      })}
    </div>
  );
};

// ── Compteur : le chiffre « roule » avec un ressort, puis rebondit à l'arrivée
export const Counter: React.FC<{
  at: number;
  to: number;
  format: (v: number) => string;
  dur?: number; // durée approximative du comptage (s)
  style?: React.CSSProperties;
}> = ({at, to, format, dur = 1.2, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps - at;
  // comptage rapide au début, qui ralentit à la fin (ease-out exponentiel)
  const k = interpolate(t, [0, dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => (1 - Math.pow(2, -10 * x)) / (1 - Math.pow(2, -10))});
  // petit « tac » d'échelle quand le compteur atteint sa valeur
  const bump = spring({frame: frame - Math.round((at + dur * 0.75) * fps), fps, config: {damping: 8, stiffness: 260, mass: 0.5}});
  const scale = 1 + 0.08 * Math.sin(Math.min(1, bump) * Math.PI);
  return (
    <span style={{display: 'inline-block', fontVariantNumeric: 'tabular-nums', transform: `scale(${scale})`, ...style}}>
      {format(to * k)}
    </span>
  );
};

// ── Impact : « coup de zoom » + tremblement à un instant donné ───────────────
// Enveloppe une scène entière ou un bloc. `hits` = instants (s) des impacts.
export const Impact: React.FC<{hits: number[]; strength?: number; children: React.ReactNode}> = ({hits, strength = 1, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  let scale = 1;
  let x = 0;
  let y = 0;
  for (const h of hits) {
    const d = t - h;
    if (d < 0 || d > 0.45) continue;
    const decay = Math.exp(-d * 9);
    scale += 0.045 * strength * decay;
    x += (random(`x${h}-${frame}`) - 0.5) * 22 * strength * decay;
    y += (random(`y${h}-${frame}`) - 0.5) * 22 * strength * decay;
  }
  return <AbsoluteFill style={{transform: `translate(${x}px, ${y}px) scale(${scale})`}}>{children}</AbsoluteFill>;
};

// ── Sticker : pastille inclinée qui « claque » (comme un autocollant Instagram)
export const Sticker: React.FC<{
  at: number;
  bg?: string;
  color?: string;
  rotate?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({at, bg = C.ver, color = '#fff', rotate = -4, style, children}) => {
  const s = useSpringAt(at, SPRINGS.slam);
  const wobble = Math.sin((useCurrentFrame() / 30) * 2.2) * 1.2; // léger balancement continu
  return (
    <div
      style={{
        position: 'absolute',
        opacity: Math.min(1, s * 2),
        transform: `scale(${s}) rotate(${rotate + wobble * Math.min(1, s)}deg)`,
        background: bg,
        color,
        fontFamily: DISPLAY,
        fontWeight: 800,
        fontSize: 40,
        letterSpacing: -0.5,
        padding: '16px 30px',
        borderRadius: 999,
        boxShadow: '0 14px 30px rgba(20,40,58,.22)',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ── Pastille de chapitre : « 03 · LE MARCHÉ » dans une capsule ─────────────
export const Chip: React.FC<{n: number; label: string; at?: number; top?: number}> = ({n, label, at = 0, top = 270}) => (
  <div style={{position: 'absolute', top, width: '100%', display: 'flex', justifyContent: 'center'}}>
    <Pop at={at} from={0.7} dy={0} blur={6}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '12px 28px 12px 12px',
          borderRadius: 999,
          background: '#ffffffcc',
          border: `2px solid ${C.rule}`,
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: 26,
          letterSpacing: 4,
          color: C.ink,
        }}
      >
        <span style={{background: C.teal, color: '#fff', borderRadius: 999, padding: '6px 14px', letterSpacing: 1}}>{String(n).padStart(2, '0')}</span>
        {label.toUpperCase()}
      </div>
    </Pop>
  </div>
);

// ── Titre en deux temps : ligne 1 en gras « grotesque », ligne 2 serif italique
export const Title: React.FC<{l1: string; l2?: string; top?: number; at?: number; size?: number}> = ({l1, l2, top = 360, at = 0.15, size = 108}) => (
  <div style={{position: 'absolute', top, width: '100%', padding: '0 70px', boxSizing: 'border-box'}}>
    <Words text={l1} at={at} style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: size, lineHeight: 1.02, letterSpacing: -3, color: C.ink}} />
    {l2 && (
      <Pop at={at + 0.12 * l1.split(' ').length + 0.1} from={0.8} dy={20}>
        <div style={{textAlign: 'center', marginTop: 6}}>
          <Marker at={at + 0.12 * l1.split(' ').length + 0.3}>
            <span style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: size * 0.9, lineHeight: 1.12, color: C.ver}}>{l2}</span>
          </Marker>
        </div>
      </Pop>
    )}
  </div>
);

// ── Fond vivant : taches de couleur floues qui dérivent + grain de film ─────
export const LivingBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const blobs = [
    {c: C.tealSoft, x: 200, y: 400, r: 520, sx: 0.21, sy: 0.17},
    {c: C.verSoft, x: 900, y: 1300, r: 560, sx: 0.15, sy: 0.23},
    {c: '#dbe6f5', x: 500, y: 1750, r: 480, sx: 0.19, sy: 0.13},
  ];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      {blobs.map((b, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: b.x + Math.sin(t * b.sx * 2 + i) * 120 - b.r,
            top: b.y + Math.cos(t * b.sy * 2 + i) * 120 - b.r,
            width: b.r * 2,
            height: b.r * 2,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${b.c} 0%, ${b.c}00 70%)`,
            opacity: 0.85,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

// Grain de film : une texture de bruit dont la « graine » change toutes les 2 images
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.07}) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2) % 50;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'multiply', opacity}}>
      <svg width="100%" height="100%">
        <filter id={`g${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#g${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

// ── Zones de sécurité TikTok / Reels (à activer seulement pour vérifier) ────
// Ce qui est sous les zones rouges risque d'être caché par l'interface de l'appli.
export const SafeZones: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 200, background: 'rgba(255,0,0,.25)'}} />
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 370, background: 'rgba(255,0,0,.25)'}} />
    <div style={{position: 'absolute', right: 0, top: 820, bottom: 370, width: 150, background: 'rgba(255,0,0,.25)'}} />
  </AbsoluteFill>
);

// ── Effet sonore calé sur l'animation : <Sfx at={2.1} name="pop" /> ─────────
export const Sfx: React.FC<{at: number; name: 'pop' | 'impact' | 'whoosh'; volume?: number}> = ({at, name, volume = 0.5}) => {
  const {fps} = useVideoConfig();
  return (
    <Sequence from={Math.round(at * fps)} durationInFrames={Math.round(0.7 * fps)} layout="none">
      <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
    </Sequence>
  );
};
