# Vidéo « Prestataires de santé à domicile » (Remotion)

Vidéo motion design verticale (1080×1920, 30 images/s, 1 min 29) qui présente le business des prestataires de santé à domicile, avec l'exemple de Bastide Le Confort Médical.

## Lancer le projet

Il faut [Node.js](https://nodejs.org) installé sur ton ordinateur.

```bash
npm install        # installe Remotion (une seule fois)
npm run studio     # ouvre l'éditeur dans le navigateur pour prévisualiser
npm run render     # fabrique la vidéo dans out/psad_bastide_tendance.mp4
```

## Où modifier quoi

| Je veux changer…                         | Fichier                       |
| ---------------------------------------- | ----------------------------- |
| l'ordre, la durée ou la transition des scènes | `src/PsadHuashu.tsx` (`SCENES`) |
| les effets (pop, surligneur, compteur, sticker, impact…) | `src/fx.tsx` |
| les transitions (zoom à travers, fouetté) | `src/transitions.tsx` |
| les bruitages (whoosh, pop, impact)      | `scripts/make-sfx.py` puis `public/sfx/` |
| les couleurs ou les polices              | `src/theme.ts`                |
| le texte ou les chiffres d'une scène     | `src/scenes/<Scene>.tsx`      |
| les éléments communs (fond, titres)      | `src/components/ui.tsx`       |
| la musique                               | remplacer `public/music.wav`  |

Chaque scène utilise `useTimeline()` : `p(début, durée)` renvoie une progression de 0 à 1, en secondes à partir du début de la scène. Par exemple `p(1, 0.8)` fait apparaître un élément à 1 s, en 0,8 s.

## Les effets « réseaux sociaux » (version tendance)

Ce qui marche sur TikTok / Reels / Shorts, et où le trouver dans le code :

- **Accroche dès la 1re image** (`scenes/Intro.tsx`) : une phrase choc est déjà à l'écran à l'image 0, puis le titre arrive. On décide de rester ou de swiper en 1 à 2 secondes.
- **Texte cinétique mot par mot** (`Words`) : chaque mot « pop » avec un ressort et un flou qui disparaît, comme les sous-titres viraux.
- **Surligneur** (`Marker`) : une bande de couleur balaie derrière les mots importants.
- **Compteurs** (`Counter`) : les chiffres défilent vite puis ralentissent, avec un petit rebond à l'arrivée.
- **Impacts** (`Impact`) : coup de zoom + tremblement + son grave quand un chiffre clé tombe.
- **Stickers** (`Sticker`) : pastilles inclinées qui claquent, comme les autocollants Instagram.
- **Transitions rapides** (0,4 s) : « zoom à travers » et « fouetté » avec flou de mouvement, + un whoosh.
- **Barre en segments façon stories** en haut, **fond vivant** (taches de couleur qui dérivent) et **grain de film**.
- **Fin qui fait réagir** : une question pour les commentaires et « Enregistre pour plus tard » (les enregistrements et commentaires aident l'algorithme).

Les temps (`at`) sont en secondes depuis le début de la scène. Par exemple `<Pop at={1.2}>` fait apparaître un élément à 1,2 s.

### Vérifier les zones cachées par l'appli

Dans le studio, ouvre la composition **ZonesDeSecurite** : les zones rouges sont recouvertes par l'interface TikTok/Reels (barre du haut, légende en bas, boutons à droite). Garde les textes importants hors du rouge.

## Ajouter une voix off

1. Mets le fichier audio dans `public/` (par exemple `public/voix.mp3`).
2. Dans `src/PsadHuashu.tsx`, ajoute `<Audio src={staticFile('voix.mp3')} />` à côté de la musique, et baisse la musique avec `volume={0.4}`.
3. Ajuste les durées dans `SCENES` pour que chaque phrase tombe sur sa scène.

## Sources des chiffres

Résultats annuels 2025-2026 de Bastide (octobre 2026), Xerfi, Caducée, Le Quotidien du Médecin, question écrite n° 17717 de l'Assemblée nationale (mars 2026).
