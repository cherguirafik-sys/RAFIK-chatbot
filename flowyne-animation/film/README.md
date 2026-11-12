# Film Flowyne · 30 s · vertical 1080×1920

- `out/flowyne-30s.mp4` : le film final avec musique et bruitages
- `flowyne-30s.html` : l'animation (ouvre-la dans un navigateur pour la voir tourner en boucle)
- `导演稿.md` : le découpage plan par plan

## Modifier un texte
1. Ouvre `flowyne-30s.html` et change le texte voulu (ex. « Votre salon dort. »).
2. Refais la vidéo : `npm i` puis `node render.js flowyne-30s.html out/video-muette.mp4 30`
3. Remets le son : relance l'étape de mixage (commande ffmpeg dans l'historique de la session).
