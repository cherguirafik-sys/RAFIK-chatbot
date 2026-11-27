# Vidéo « Survol de la landing page Rafik »

Vidéo verticale (Story / Reel) de 16 s qui survole la **vraie** page `index.html`.
Version **muette** : aucune piste audio n'a été fournie.

## Fichiers

| Fichier | Rôle |
|---|---|
| `config.js` | **Tout ce qui se modifie** : textes, couleurs, durées, cadrages caméra, soulèvements, flou |
| `scene.html` + `scene.js` | Scène et timeline (`timeline.stateAt(t)` renvoie l'état à n'importe quel instant) |
| `render.cjs` | Rendu image par image (Playwright + ffmpeg) |
| `out/rafik-survol-1080x1920.mp4` | Vidéo finale (H.264, 1080×1920, 30 i/s, 480 images, 16,0 s, sans audio) |
| `out/affiche.png` | Image d'affiche (titre final) |
| `out/checks/` | Images de contrôle : première/dernière image, début et milieu de chaque scène, clic, bulle |

## Refaire la vidéo

```bash
node video/render.cjs --stills   # images de contrôle (quelques secondes)
node video/render.cjs            # MP4 + affiche (~35 s)
```

Pour prévisualiser dans un navigateur : lancer un serveur à la racine du dépôt
(`npx serve .` ou `python3 -m http.server`), ouvrir `/video/scene.html`, puis dans la console :
`timeline.setTime(5.5)`.

## Tableau de rythme

| # | Début | Fin | Entrée | Action visible / temps de lecture | Texte à l'écran | Médias | Audio | Transition suivante |
|---|---|---|---|---|---|---|---|---|
| 1 | 0,0 s | 3,6 s | La page, posée comme un plan incliné (52°), apparaît en fondu (0,7 s) | La caméra redresse le plan et s'approche du hero (0–2,0 s). Le bloc titre se soulève. **Lecture 1,6 s** | « Rafik - Agent Immobilier », « Loire & Rhône-Alpes », réseau d'agences (textes de la page) | `index.html` en largeur téléphone (390 px) | Aucun | Panoramique vers le bas, sans changer d'échelle |
| 2 | 3,6 s | 10,0 s | Descente continue vers les boutons | Curseur vers « 📊 Estimation » (4,6–5,4 s), clic à 5,5 s, le bouton passe au rouge, bulle « Estimer mon bien » à 5,75 s, statut « ⏳ Rafik réfléchit... » à 5,85 s. Descente vers le chat (**lecture 1,2 s**), puis vers les commandes et le statut (**lecture 1,3 s**) | Libellés de la page + légende modifiable « Démo : clic simulé, aucune réponse réelle » (4,5–8,0 s) | Idem | Aucun | Recul et montée |
| 3 | 10,0 s | 12,8 s | La caméra monte et recule (zoom 3,2 → 1,9) avec une légère inclinaison | Vue complète de la page. Les blocs se soulèvent l'un après l'autre puis reviennent à leur place. **Lecture 1,6 s** | Aucun texte nouveau | Idem | Aucun | Retour vers le haut, sur le hero |
| 4 | 12,8 s | 16,0 s | Retour au hero (12,8–13,9 s) | Titre final immobile, net, le reste flou. **Lecture 2,1 s** | « Rafik - Agent Immobilier », « Loire & Rhône-Alpes » | Idem | Aucun | Fin |

Règle de mouvement : une seule caméra continue. À chaque scène, seuls le cadrage et l'échelle changent ; couleurs et typographie restent celles de la page.

## Choix et limites (à lire)

- **Vidéo de référence non fournie** (seulement un lien X). Le rythme vient de la consigne ; aucun média du créateur n'est utilisé.
- **Démonstration** : le clic est simulé. Il reproduit exactement ce que fait la page (bulle + statut), mais **aucune requête n'est envoyée** au webhook n8n et aucune réponse de Rafik n'est montrée. La légende « Démo » le signale.
- **Police** : la page demande « Segoe UI », absente du poste de rendu ; une police sans-serif de remplacement est utilisée. Pour un rendu identique, installer Segoe UI (licence Microsoft) ou en choisir une autre dans `index.html`.
- **Logo** : l'avatar 🏠 est un emoji ; il est rendu avec Noto Color Emoji (le dessin varie selon les appareils).
- **Audio** : aucun. Pour ajouter une musique sous licence : `ffmpeg -i out/rafik-survol-1080x1920.mp4 -i musique.mp3 -c:v copy -c:a aac -shortest sortie.mp4`.
- **Écarts avec la consigne** : format 1080×1920 au lieu de 1440×1152 (choix « Reel ») ; durée 16 s au lieu de ~14,5 s, pour laisser le temps de lire.
- Référence d'inspiration : @twoclipping, https://x.com/twoclipping/status/2110329502676951367 (structure étudiée uniquement à partir de la description de la consigne).
