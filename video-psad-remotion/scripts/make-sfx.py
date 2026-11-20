"""Fabrique les effets sonores de la vidéo (libres de droits, générés par calcul).

Lancer :  python3 scripts/make-sfx.py   (il faut numpy)
Résultat : public/sfx/whoosh.wav, pop.wav, impact.wav
"""
import wave
import numpy as np

SR = 44100
rng = np.random.default_rng(7)


def save(name, x):
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.9
    data = (x * 32767).astype(np.int16)
    with wave.open(f"public/sfx/{name}.wav", "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


def lowpass(x, alpha):
    """Filtre passe-bas simple ; alpha peut varier dans le temps (tableau)."""
    y = np.zeros_like(x)
    a = np.broadcast_to(alpha, x.shape)
    acc = 0.0
    for i in range(len(x)):
        acc += a[i] * (x[i] - acc)
        y[i] = acc
    return y


# Whoosh : bruit filtré dont la « brillance » monte puis redescend (0,45 s)
n = int(SR * 0.45)
t = np.linspace(0, 1, n)
env = np.sin(np.pi * t ** 0.8) ** 2
alpha = 0.02 + 0.25 * np.sin(np.pi * t) ** 2
save("whoosh", lowpass(rng.standard_normal(n), alpha) * env)

# Pop : petite note qui descend très vite (0,12 s)
n = int(SR * 0.12)
t = np.arange(n) / SR
freq = 900 * np.exp(-t * 30) + 250
phase = 2 * np.pi * np.cumsum(freq) / SR
save("pop", np.sin(phase) * np.exp(-t * 38))

# Impact : grosse caisse grave + souffle (0,6 s)
n = int(SR * 0.6)
t = np.arange(n) / SR
freq = 120 * np.exp(-t * 18) + 45
phase = 2 * np.pi * np.cumsum(freq) / SR
kick = np.sin(phase) * np.exp(-t * 7)
air = lowpass(rng.standard_normal(n), 0.08) * np.exp(-t * 14) * 0.6
save("impact", kick + air)
print("ok")
