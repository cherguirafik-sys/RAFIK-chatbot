# Vidéo « 8 sunnas avant de dormir » (Remotion)

Vidéo verticale 1080x1920 (TikTok / Reels / Shorts), environ 55 secondes, style « parchemin ».

## Lancer le projet (sur ton ordinateur)

```bash
cd video-remotion
npm install          # installe les dépendances (une seule fois)
npm run studio       # ouvre l'éditeur dans le navigateur pour prévisualiser
npm run render       # crée le fichier out/video.mp4
```

> Sur ton ordinateur, supprime ou vide `remotion.config.ts` : il pointe vers un
> navigateur qui n'existe que sur le serveur cloud.

## Où modifier quoi ?

| Je veux changer…                       | Fichier                                  |
| -------------------------------------- | ---------------------------------------- |
| Mon nom / le texte de fin              | `src/Video.tsx` (`BRAND`, `CTA`)         |
| L'ordre ou la durée des scènes         | `src/Video.tsx` (liste `SCENES`)         |
| Les textes, illustrations, sources     | `src/scenes.tsx` (une fonction par scène)|
| Les couleurs                           | `src/theme.ts` (`COLORS`)                |
| Le titre surligné, le badge, le fond   | `src/components.tsx`                     |

Durées : 30 images = 1 seconde.

## Notions Remotion utilisées

- `useCurrentFrame()` : le numéro de l'image en cours. Toute l'animation est calculée à partir de ce numéro.
- `interpolate()` : transforme un numéro d'image en valeur (ex. image 0→20 donne opacité 0→1).
- `spring()` : animation avec un effet « ressort » naturel.
- `<Series>` : enchaîne les scènes l'une après l'autre.

## Sources citées (à vérifier avant publication)

Bukhârî 247 (ablutions + côté droit), 6320 (secouer le lit), 2311 (Âyat al-Kursî),
5009 (fin d'al-Baqara), 5017 (les 3 Qul), 3705 (tasbîh de Fâtima), 6324 (invocation).
