---
name: ffmpeg
description: Construire et exécuter des commandes FFmpeg pour convertir, compresser, couper, fusionner, redimensionner des vidéos ou extraire / convertir de l'audio, des images et des sous-titres. À utiliser dès que l'utilisateur parle de vidéo, audio, MP4, MP3, GIF, compression, conversion de format ou FFmpeg.
---

# FFmpeg — guide pour Claude

L'utilisateur est **débutant** : explique chaque commande en français, option par option, avant ou après l'avoir lancée.

## Méthode

1. **Inspecter d'abord** le fichier source :
   `ffprobe -v error -show_format -show_streams "entree.mp4"`
   (durée, codecs, résolution, nombre de pistes audio).
2. **Ne jamais écraser l'original** : toujours écrire dans un nouveau fichier. N'utilise `-y` que pour un fichier de sortie que tu viens toi-même de créer.
3. Mettre les noms de fichiers entre **guillemets** (espaces, accents).
4. Tester sur un court extrait si le fichier est long : ajouter `-t 10` (10 premières secondes).
5. Après l'exécution, vérifier le résultat avec `ffprobe` et comparer les tailles (`ls -lh`).

## Recettes courantes

| Besoin | Commande |
|---|---|
| Convertir en MP4 (compatible partout) | `ffmpeg -i "in.mov" -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k -movflags +faststart "out.mp4"` |
| Compresser une vidéo | `ffmpeg -i "in.mp4" -c:v libx264 -crf 28 -preset slow -c:a aac -b:a 96k "out.mp4"` (CRF : 18 = très bonne qualité, 28 = plus léger) |
| Couper sans réencoder (rapide) | `ffmpeg -ss 00:00:05 -to 00:00:20 -i "in.mp4" -c copy "extrait.mp4"` |
| Couper précisément (réencode) | `ffmpeg -i "in.mp4" -ss 00:00:05 -to 00:00:20 -c:v libx264 -c:a aac "extrait.mp4"` |
| Extraire l'audio en MP3 | `ffmpeg -i "in.mp4" -vn -c:a libmp3lame -q:a 2 "audio.mp3"` |
| Enlever le son | `ffmpeg -i "in.mp4" -c:v copy -an "muet.mp4"` |
| Redimensionner (largeur 1280) | `ffmpeg -i "in.mp4" -vf "scale=1280:-2" -c:a copy "out.mp4"` |
| Format vertical 1080×1920 (Reels/TikTok) | `ffmpeg -i "in.mp4" -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" -c:a copy "vertical.mp4"` |
| Créer un GIF de qualité | `ffmpeg -i "in.mp4" -vf "fps=12,scale=480:-1:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse" "out.gif"` |
| Capture d'une image | `ffmpeg -ss 00:00:03 -i "in.mp4" -frames:v 1 "image.jpg"` |
| Fusionner des vidéos identiques | créer `liste.txt` avec des lignes `file 'a.mp4'`, puis `ffmpeg -f concat -safe 0 -i liste.txt -c copy "fusion.mp4"` |
| Ajouter des sous-titres incrustés | `ffmpeg -i "in.mp4" -vf "subtitles=sous-titres.srt" -c:a copy "out.mp4"` |
| Normaliser le volume | `ffmpeg -i "in.mp4" -af loudnorm=I=-16:TP=-1.5:LRA=11 -c:v copy "out.mp4"` |
| Accélérer ×2 | `ffmpeg -i "in.mp4" -vf "setpts=0.5*PTS" -af "atempo=2.0" "rapide.mp4"` |

## Lexique à expliquer au débutant

- `-i` : fichier d'entrée.
- `-c:v` / `-c:a` : codec vidéo / audio ; `copy` = garder tel quel (rapide, sans perte).
- `-crf` : qualité (plus le chiffre est bas, meilleure est la qualité et plus le fichier est gros).
- `-preset` : vitesse d'encodage (`slow` = plus lent mais fichier plus petit).
- `-vf` / `-af` : filtres vidéo / audio.
- `-ss` / `-to` / `-t` : début / fin / durée.
- `-vn` / `-an` : supprimer la vidéo / l'audio.

## Erreurs fréquentes

- `No such file or directory` : mauvais chemin ou guillemets manquants.
- `height not divisible by 2` : utiliser `-2` au lieu de `-1` dans `scale`.
- Coupe imprécise avec `-c copy` : normal (coupe sur images clés) ; réencoder pour être précis.
- Fusion qui échoue : les vidéos n'ont pas les mêmes codecs/résolution ; les réencoder d'abord.
