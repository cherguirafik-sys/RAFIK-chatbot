// =====================================================================
//  RÉGLAGES DE LA VIDÉO « Survol de la landing page Rafik »
//  Tout ce qui se modifie (textes, couleurs, durées, cadrages) est ICI.
//  Les temps sont en secondes depuis le début de la vidéo.
//  Après modification : `node video/render.cjs --stills` (images de contrôle)
//  puis `node video/render.cjs` (MP4 complet).
// =====================================================================
window.VIDEO_CONFIG = {
  // --- Sortie --------------------------------------------------------
  width: 1080,          // format Story / Reel vertical
  height: 1920,
  fps: 30,
  duration: 16.0,       // secondes -> 480 images

  // --- Site filmé ------------------------------------------------------
  // La vraie page du dépôt, affichée en largeur téléphone (390 px).
  site: { src: "../index.html", width: 390, height: 844 },

  // --- Couleurs (reprises de index.html) -------------------------------
  colors: {
    navy: "#1a1a2e",
    blue: "#0f3460",
    red: "#e63946",
    stageGlow: "rgba(230,57,70,0.18)",
    liftShadow: "rgba(15,52,96,0.40)",
  },

  // --- Blocs réels de la page (sélecteurs CSS de index.html) -----------
  blocks: {
    header: ".header",
    tags: ".tags",
    chat: ".chat",
    controls: ".controls",
    status: ".status",
    card: ".box",
  },

  // --- Scènes (pour le tableau de rythme et les images de contrôle) ----
  scenes: [
    { id: 1, name: "Installer le site comme une scène plane", start: 0.0, end: 3.6 },
    { id: 2, name: "Descendre le long des sections", start: 3.6, end: 10.0 },
    { id: 3, name: "Monter vers une vue complète", start: 10.0, end: 12.8 },
    { id: 4, name: "Revenir au hero pour le titre final", start: 12.8, end: 16.0 },
  ],

  // --- Caméra continue --------------------------------------------------
  // target : bloc(s) visé(s) ; zoom : grossissement ; tiltX / tiltZ : inclinaison
  // en degrés ; offsetY : décalage vertical à l'écran (px). Deux clés identiques
  // consécutives = un temps de lecture immobile.
  fadeIn: 0.7,        // fondu d'entrée (s)
  fadeFrom: 0.35,     // opacité de la toute première image
  perspective: 2200,
  camera: [
    { t: 0.0,  target: ["card"],               zoom: 1.35, tiltX: 52, tiltZ: -14, offsetY: 120 },
    { t: 2.0,  target: ["header"],             zoom: 3.2,  tiltX: 0,  tiltZ: 0,   offsetY: 0 },
    { t: 3.6,  target: ["header"],             zoom: 3.2,  tiltX: 0,  tiltZ: 0,   offsetY: 0 },   // lecture du titre
    { t: 4.4,  target: ["tags"],               zoom: 3.2,  tiltX: 0,  tiltZ: 0,   offsetY: 0 },
    { t: 6.0,  target: ["tags"],               zoom: 3.2,  tiltX: 0,  tiltZ: 0,   offsetY: 0 },   // clic
    { t: 6.8,  target: ["chat"],               zoom: 3.2,  tiltX: 0,  tiltZ: 0,   offsetY: 0 },
    { t: 8.0,  target: ["chat"],               zoom: 3.2,  tiltX: 0,  tiltZ: 0,   offsetY: 0 },   // lecture de la bulle
    { t: 8.7,  target: ["controls", "status"], zoom: 3.2,  tiltX: 0,  tiltZ: 0,   offsetY: 0 },
    { t: 10.0, target: ["controls", "status"], zoom: 3.2,  tiltX: 0,  tiltZ: 0,   offsetY: 0 },
    { t: 11.2, target: ["card"],               zoom: 1.9,  tiltX: 14, tiltZ: -5,  offsetY: 0 },
    { t: 12.8, target: ["card"],               zoom: 1.9,  tiltX: 14, tiltZ: -5,  offsetY: 0 },   // vue complète
    { t: 13.9, target: ["header"],             zoom: 3.2,  tiltX: 0,  tiltZ: 0,   offsetY: 0 },
    { t: 16.0, target: ["header"],             zoom: 3.2,  tiltX: 0,  tiltZ: 0,   offsetY: 0 },   // titre final
  ],

  // --- Cartes soulevées (reviennent toujours à leur place) --------------
  liftRamp: 0.35,
  lifts: [
    { block: "header",   from: 1.5,  to: 4.2 },
    { block: "tags",     from: 3.7,  to: 6.2 },
    { block: "chat",     from: 5.5,  to: 8.6 },   // net dès l'apparition de la bulle
    { block: "controls", from: 8.1,  to: 10.2 },
    { block: "status",   from: 8.1,  to: 10.2 },
    // vue complète : chaque bloc se soulève brièvement, l'un après l'autre
    { block: "header",   from: 11.2, to: 11.9 },
    { block: "tags",     from: 11.45, to: 12.15 },
    { block: "chat",     from: 11.7, to: 12.4 },
    { block: "controls", from: 11.95, to: 12.65 },
    { block: "header",   from: 13.4, to: 16.5 },
  ],

  // --- Profondeur de champ (flou des blocs NON soulevés) ----------------
  maxBlur: 3.5, // px dans la page
  dof: [
    { t: 0.0, v: 0 }, { t: 1.5, v: 0 }, { t: 2.1, v: 1 },
    { t: 10.0, v: 1 }, { t: 10.8, v: 0 }, { t: 13.4, v: 0 }, { t: 14.0, v: 1 }, { t: 16.0, v: 1 },
  ],

  // --- Démonstration du clic (reproduit ce que fait vraiment la page) ---
  // Le texte de la bulle est lu directement sur le bouton (data-q).
  demo: {
    target: '.tag[data-q="Estimer mon bien"]',
    appear: 4.5,
    moveFrom: 4.6,
    arrive: 5.4,
    click: 5.5,
    bubble: 5.75,        // bulle « Estimer mon bien » ajoutée au chat
    status: 5.85,
    statusText: "⏳ Rafik réfléchit...", // texte réel affiché par la page
    hide: 6.6,
  },

  // --- Texte modifiable en surimpression --------------------------------
  captions: [
    { text: "Démo : clic simulé, aucune réponse réelle", from: 4.5, to: 8.0 },
  ],
  captionStyle: { fontSize: 40, top: 270 },
};
