# Vidéo « Le marché immobilier à Paris » (fin 2026)

`paris-immobilier-2026.mp4` — 57 secondes, format vertical 1080 × 1920 (Reels / TikTok / Shorts), 30 images/s, avec voix off, musique, bruitages et sous-titres.

## Comment la vidéo est fabriquée

Tout est généré par du code, sans logiciel de montage :

| Étape | Fichier | Ce que ça fait |
|---|---|---|
| 1. Voix off | `build/vo.py` | Transforme le texte en voix (synthèse vocale Kokoro, voix française) et note à quelle seconde chaque phrase commence. |
| 2. Animation | `video/index.html` | Une page web animée (bibliothèque GSAP). Chaque scène se cale sur les horaires de la voix. |
| 3. Images | `video/render.js` | Un navigateur invisible « photographie » la page 30 fois par seconde (1 710 images). |
| 4. Son | `build/audio.py` | Fabrique la musique et les bruitages par calcul, puis les mélange avec la voix (la musique baisse quand la voix parle). |
| 5. Assemblage | `ffmpeg` | Colle les images et le son dans un fichier MP4. |

## Refaire la vidéo

```bash
# dépendances
pip install "sherpa-onnx<2" soundfile numpy scipy
cd video && npm install && cd ..

# modèles de voix (à placer dans models/)
mkdir -p models work && cd models
curl -L https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/kokoro-multi-lang-v1_0.tar.bz2 | tar xj
curl -L https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-small.tar.bz2 | tar xj
cd ..

# 1. voix  →  work/vo.wav + work/timeline.json
cd build && python3 vo.py
python3 -c "import json;open('../video/timeline.js','w').write('window.TIMELINE = '+json.dumps(json.load(open('../work/timeline.json')),ensure_ascii=False)+';')"
# 2-3. images  →  work/frames/ + work/sfx.json
cd ../video && node render.js full 4 ../work/frames
# 4. son  →  work/mix.wav
cd ../build && python3 audio.py
# 5. assemblage
cd ../work && ffmpeg -framerate 30 -i frames/f%05d.jpg -i mix.wav -c:v libx264 -crf 17 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart ../paris-immobilier-2026.mp4
```

Pour changer le texte : modifier les phrases dans `build/vo.py` (liste `SCENES`) et les sous-titres correspondants dans `video/index.html` (objet `CAPS`).

## Chiffres utilisés et sources

| Chiffre | Source |
|---|---|
| 9 590 €/m² à Paris, −0,5 % sur un an (appartements anciens, juin–août 2026) | Notaires du Grand Paris, publication du 29 oct. 2026 |
| Record de 10 860 €/m² en novembre 2020 (soit −11,7 % depuis) | Notaires du Grand Paris (indices Notaires-Insee) |
| 6ᵉ : 13 400 €/m² · 19ᵉ : 7 560 €/m² (rapport 1,77) | Notaires du Grand Paris, dossier de presse T4 2025 |
| Taux moyen 3,49 % en octobre 2026 (3,40 % en septembre), durée moyenne 253 mois | Observatoire Crédit Logement / CSA (moyenne France, hors assurance) |
| Ventes de logements anciens à Paris : −2 % sur un an (juin–août 2026) | Notaires du Grand Paris |
| Projection novembre 2026 : 9 580 €/m² (−0,4 % sur un an) | Notaires du Grand Paris (avant-contrats) |

Deux valeurs sont des calculs, pas des chiffres publiés : « environ 480 000 € » (50 m² × 9 590 €) et le point « fin 2024 ≈ 9 470 € » de la courbe (déduit du +1,4 % annoncé pour fin 2025).
