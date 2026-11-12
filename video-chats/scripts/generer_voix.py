# Génère la voix off française avec Piper (voix gratuite, hors ligne).
# Utilisation : python generer_voix.py chemin/vers/fr_FR-siwis-medium.onnx
# Résultat : un fichier public/voix/sceneN.wav par scène
#            + src/durees-voix.json (la durée de chaque fichier, en secondes)
import json, subprocess, sys, wave
from pathlib import Path

# ---------- LE TEXTE LU À VOIX HAUTE (une ligne par scène) ----------
TEXTES = [
    "Ton chat t'aime... mais est-ce qu'il te le montre vraiment ? Voici trois signes qui ne trompent pas.",
    "Signe numéro un : il ronronne quand tu es près de lui. C'est sa façon de dire : je me sens bien.",
    "Signe numéro deux : il te fait des clignements lents. C'est un vrai bisou de chat.",
    "Signe numéro trois : il dort à tes pieds. Il te fait confiance pour le protéger.",
    "Et toi, ton chat fait lequel ? Dis-le en commentaire !",
]

modele = sys.argv[1]
racine = Path(__file__).resolve().parent.parent
dossier = racine / "public" / "voix"
dossier.mkdir(parents=True, exist_ok=True)

durees = []
for i, texte in enumerate(TEXTES, start=1):
    fichier = dossier / f"scene{i}.wav"
    # --length-scale 0.92 = on parle un peu plus vite (rythme TikTok)
    subprocess.run(["piper", "-m", modele, "-f", str(fichier), "--length-scale", "0.92"],
                   input=texte.encode("utf-8"), check=True, capture_output=True)
    with wave.open(str(fichier)) as w:
        durees.append(round(w.getnframes() / w.getframerate(), 2))
    print(f"scene{i}.wav : {durees[-1]} s")

(racine / "src" / "durees-voix.json").write_text(json.dumps(durees))
