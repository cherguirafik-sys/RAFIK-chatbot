import {continueRender, delayRender, staticFile} from 'remotion';

// Polices fournies dans public/fonts (fichiers « variables » : tous les poids dans un seul fichier).
// Elles sont chargées localement : le rendu fonctionne même sans connexion.
const FONTS: [string, string, string, string][] = [
  ['Cormorant Garamond', 'fonts/CormorantGaramond.woff2', 'normal', '300 700'],
  ['Cormorant Garamond', 'fonts/CormorantGaramond-Italic.woff2', 'italic', '300 700'],
  ['Inter', 'fonts/Inter.woff2', 'normal', '100 900'],
];

if (typeof document !== 'undefined') {
  const handle = delayRender('Chargement des polices locales');
  Promise.all(
    FONTS.map(([family, file, style, weight]) => {
      const face = new FontFace(family, `url(${staticFile(file)}) format('woff2')`, {style, weight});
      (document.fonts as unknown as {add: (f: FontFace) => void}).add(face);
      return face.load();
    }),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
}

// Palette « papier » du style huashu : encre bleu nuit, vert soin, vermillon d'accent
export const C = {
  paper: '#eef2f1',
  paper2: '#e2e9e7',
  ink: '#14283a',
  muted: '#5d6f7c',
  rule: '#c6d2d0',
  teal: '#1f7a68',
  tealSoft: '#cfe5df',
  ver: '#d4552f',
  verSoft: '#f5d9cf',
  blue: '#2f5f9e',
};

export const SERIF = '"Cormorant Garamond", Georgia, serif';
export const SANS = 'Inter, "Helvetica Neue", Arial, sans-serif';

export const W = 1080;
export const H = 1920;
export const FPS = 30;
