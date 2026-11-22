# PROJECT — Le plombier roi

Skill : `.claude/skills/3d-stickman` (style maison RicksClips : stickmen 2D dans un monde 3D toon)

## Brief
- Idée de l'utilisateur : un homme entre dans une maison, rencontre des animaux domestiques et des enfants, et joue avec eux.
- Format : 9:16, 1080x1920, 30 fps, ~60-65 s, sans sous-titres (valeurs par défaut).
- Langue de narration : français (confirmé par l'utilisateur).

## Distribution
- Marc (le plombier, adulte), 2 enfants, 1 gros chien, 1 chat, la maman (une réplique).

## Décisions
- Script : l'utilisateur veut d'abord une VERSION TEST courte (SCRIPT_TEST.md, ~14 s). Le v1 long (SCRIPT.md) est gardé pour plus tard.
- Voix : ElevenLabs (choix final, remplace Higgsfield). Voix proposée : Lucas Doré - Casual Narrator (ULDw9NhSQODAHXxn70tR), modèle eleven_v4. Devis : 550 crédits pour 2 prises. Compte gratuit : 3 733 crédits restants.
- Voix : **Higgsfield** choisi par l'utilisateur. Higgsfield n'est PAS connecté à la session du 2026-11-22.
  Options : connecter le connecteur Higgsfield puis nouvelle session, OU l'utilisateur génère le MP3 et l'envoie.
- Assets : réutiliser d'abord les 16 GLB + panoramas inclus ; toute génération payante passe par un tableau de coûts approuvé.

## Prochaine action
Recevoir la voix (ou la connexion Higgsfield) → étape 3 (resserrer les silences, -14 LUFS, timing).
En parallèle (gratuit) : plan des plans + fiche des personnages rendue depuis les rigs SVG.

## Avancement (2026-11-22)
- Version test SANS VOIX rendue : livraison/plombier_test_sans_voix.mp4 (1080x1920, 30 fps, 14,3 s, h264).
  Composition `PlombierTest` dans app/ (src/scenes/PlombierTest.tsx). Timing PROVISOIRE (estimation 3,7 mots/s).
- Voix ElevenLabs (Florian, HvO2LE2Dr2f7xw0c4X9X, eleven_v4, 550 crédits approuvés) : tentative échouée (file gratuite saturée), rien facturé.
- Rendu dans le conteneur cloud : CHROME=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell REMOTION_GL=swangle
- Prochaine action : retours de l'utilisateur sur l'image ; réessayer la voix ; recaler le timing sur la vraie voix.

## Voix (mise à jour)
- Prise 2 choisie par l'utilisateur. Kie.ai connecté (626,3 crédits) mais NON utilisé : l'utilisateur garde la voix ElevenLabs actuelle.
- Traitement : pauses ramenées à 0,16 s, atempo 1,06, loudnorm -14 LUFS -> app/public/nar_plombier.wav (13,67 s, -14,5 LUFS mesuré).
- Timing : voice/ALIGNMENT.json, au niveau des phrases (déduit des pauses, PAS aligné mot à mot, non vérifié par transcription).
- Timeline : s2=55, s3=131, s4=221, chien=252, enfants=267, on joue=337, robinet=358, fin=412 (30 fps).
