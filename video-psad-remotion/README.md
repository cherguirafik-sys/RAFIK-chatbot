# Vidéo « Prestataires de santé à domicile » (Remotion)

Vidéo motion design verticale (1080×1920, 30 images/s, 1 min 29) qui présente le business des prestataires de santé à domicile, avec l'exemple de Bastide Le Confort Médical.

## Lancer le projet

Il faut [Node.js](https://nodejs.org) installé sur ton ordinateur.

```bash
npm install        # installe Remotion (une seule fois)
npm run studio     # ouvre l'éditeur dans le navigateur pour prévisualiser
npm run render     # fabrique la vidéo dans out/psad_bastide_huashu.mp4
```

## Où modifier quoi

| Je veux changer…                         | Fichier                       |
| ---------------------------------------- | ----------------------------- |
| l'ordre ou la durée des scènes           | `src/PsadHuashu.tsx` (`SCENES`) |
| les couleurs ou les polices              | `src/theme.ts`                |
| le texte ou les chiffres d'une scène     | `src/scenes/<Scene>.tsx`      |
| les éléments communs (fond, titres)      | `src/components/ui.tsx`       |
| la musique                               | remplacer `public/music.wav`  |

Chaque scène utilise `useTimeline()` : `p(début, durée)` renvoie une progression de 0 à 1, en secondes à partir du début de la scène. Par exemple `p(1, 0.8)` fait apparaître un élément à 1 s, en 0,8 s.

## Ajouter une voix off

1. Mets le fichier audio dans `public/` (par exemple `public/voix.mp3`).
2. Dans `src/PsadHuashu.tsx`, ajoute `<Audio src={staticFile('voix.mp3')} />` à côté de la musique, et baisse la musique avec `volume={0.4}`.
3. Ajuste les durées dans `SCENES` pour que chaque phrase tombe sur sa scène.

## Sources des chiffres

Résultats annuels 2025-2026 de Bastide (octobre 2026), Xerfi, Caducée, Le Quotidien du Médecin, question écrite n° 17717 de l'Assemblée nationale (mars 2026).
