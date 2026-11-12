import { continueRender, delayRender, staticFile } from "remotion";

// Polices stockées dans public/fonts (pas besoin d'internet au rendu)
// Inter (titres), EB Garamond italique (sous-titres), Amiri (arabe)
const FONT_FILES: { family: string; file: string; weight: string; style?: string }[] = [
  { family: "Inter", file: "inter-600.woff2", weight: "600" },
  { family: "Inter", file: "inter-700.woff2", weight: "700" },
  { family: "Inter", file: "inter-800.woff2", weight: "800" },
  { family: "EB Garamond", file: "garamond-italic.woff2", weight: "400", style: "italic" },
  { family: "Amiri", file: "amiri.woff2", weight: "400" },
];

// On "met en pause" le rendu tant que les polices ne sont pas chargées
const handle = delayRender("Chargement des polices");
Promise.all(
  FONT_FILES.map((f) => {
    const face = new FontFace(f.family, `url(${staticFile("fonts/" + f.file)}) format("woff2")`, {
      weight: f.weight,
      style: f.style ?? "normal",
    });
    return face.load().then((loaded) => document.fonts.add(loaded));
  })
)
  .then(() => continueRender(handle))
  .catch((err) => {
    console.error(err);
    continueRender(handle);
  });

export const FONTS = {
  sans: `Inter, Amiri, sans-serif`,
  serif: `"EB Garamond", Amiri, serif`,
  arabic: `Amiri, serif`,
};

// Palette "parchemin"
export const COLORS = {
  bg: "#F4DFC2",
  bgDark: "#E9CBA4",
  brown: "#B4521E",
  brownDark: "#7A3412",
  ink: "#2A1C12",
  muted: "#8A6649",
  soft: "#C9A783",
  paper: "#FBF3E7",
};
