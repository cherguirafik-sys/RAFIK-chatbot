"""Bande-son : musique + bruitages entièrement synthétisés (aucun fichier externe), puis mixage avec la voix."""
import numpy as np, json, soundfile as sf
from scipy import signal
SR = 48000
tl = json.load(open('../work/timeline.json')); ev = json.load(open('../work/sfx.json'))
DUR = ev['duration']; N = int(DUR * SR); rs = np.random.RandomState(3)
SC = {s['name']: s for s in tl['scenes']}
def buf(): return np.zeros((N, 2), np.float32)
def put(b, x, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N or i < 0: return
    x = x[:N - i]
    if x.ndim == 1: l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4); x = np.stack([x * l, x * r], 1) * 1.414
    b[i:i + len(x)] += (x * gain).astype(np.float32)
def tt(d): return np.arange(int(d * SR)) / SR
def env(d, a=.005, r=.05): n = int(d * SR); e = np.ones(n); na, nr = max(1, int(a * SR)), max(1, int(r * SR)); e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr); return e
def bp(x, lo, hi, o=2): return signal.sosfilt(signal.butter(o, [lo, hi], 'bandpass', fs=SR, output='sos'), x, axis=0)
def lp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, 'lowpass', fs=SR, output='sos'), x, axis=0)
def hp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, 'highpass', fs=SR, output='sos'), x, axis=0)
def noise(d): return rs.uniform(-1, 1, int(d * SR))
def sweep(f0, f1, d, curve=1.0): t = tt(d); f = f0 * (f1 / f0) ** ((t / d) ** curve); return np.sin(2 * np.pi * np.cumsum(f) / SR)
def swept_noise(d, f0, f1, q=1.2):
    # bruit filtré dont la fréquence glisse : traité par petits blocs
    x = noise(d); out = np.zeros_like(x); blk = 512; zi = None
    for k in range(0, len(x), blk):
        f = f0 * (f1 / f0) ** (k / len(x)); sos = signal.butter(1, [f / q, min(f * q, SR / 2 - 100)], 'bandpass', fs=SR, output='sos')
        if zi is None: zi = signal.sosfilt_zi(sos) * 0
        out[k:k + blk], zi = signal.sosfilt(sos, x[k:k + blk], zi=zi)
    return out
PENTA = [440, 523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66]   # la mineur pentatonique

# ---------------- bruitages ----------------
def s_whoosh(): d = .7; x = swept_noise(d, 300, 5000) * np.sin(np.pi * tt(d) / d) ** 2; return x * .9
def s_swish(): d = .32; return swept_noise(d, 2500, 7000) * np.sin(np.pi * tt(d) / d) ** 2 * .5
def s_impact(): d = .9; t = tt(d); return sweep(110, 34, d, .5) * np.exp(-t * 5) * 1.0 + lp(noise(d), 900) * np.exp(-t * 16) * .8 + hp(noise(d), 4000) * np.exp(-t * 40) * .25
def s_thud(): d = .35; t = tt(d); return sweep(140, 50, d, .5) * np.exp(-t * 13) * .9 + lp(noise(d), 600) * np.exp(-t * 30) * .4
def s_stamp(): d = .6; t = tt(d); return sweep(120, 38, d, .4) * np.exp(-t * 8) * 1.1 + bp(noise(d), 900, 3200) * np.exp(-t * 55) * .9 + lp(noise(d), 500) * np.exp(-t * 18) * .6
def s_pop(p=0): f = PENTA[int(p) % len(PENTA)] * 1.0; d = .11; t = tt(d); return sweep(f * .75, f * 1.25, d, .6) * np.exp(-t * 34) * env(d, .002, .02)
def s_ding(low=False):
    f = 659.25 if low else 880.0; d = 1.6; t = tt(d); x = sum(a * np.sin(2 * np.pi * f * m * t) * np.exp(-t * dk) for m, a, dk in [(1, 1, 3.2), (2, .5, 4.5), (3.01, .28, 6), (4.2, .15, 9), (5.43, .08, 12)]); return x * env(d, .002, .2) * .5
def s_roll(dur):
    out = np.zeros(int((dur + .1) * SR)); t = 0.0
    while t < dur:
        u = t / dur; c = bp(noise(.012), 1800, 5200) * np.exp(-tt(.012) * 380) + .5 * np.sin(2 * np.pi * (2100 - 500 * u) * tt(.012)) * np.exp(-tt(.012) * 300)
        i = int(t * SR); out[i:i + len(c)] += c * (.55 + .45 * (1 - u)); t += .026 + .11 * u ** 1.8
    return out
def s_ticks(n, step, soft=False):
    out = np.zeros(int((n * step + .2) * SR))
    for k in range(int(n)):
        f = (700 + 45 * k) if not soft else (1400 + rs.uniform(-200, 200)); d = .05; c = np.sin(2 * np.pi * f * tt(d)) * np.exp(-tt(d) * 90) * (.35 if soft else .6); i = int(k * step * SR); out[i:i + len(c)] += c
    return out
def s_riser(dur): t = tt(dur); a = (t / dur) ** 2.4; return (swept_noise(dur, 500, 9000, 1.5) * .8 + sweep(160, 1250, dur, 1.8) * .22) * a * env(dur, .01, .02)
def s_rise(dur, hi): f = 330 if hi else 247; t = tt(dur); return (sweep(f, f * 3, dur, .7) + .3 * sweep(f * 2, f * 6, dur, .7)) * np.sin(np.pi * t / dur) ** .7 * .32
def s_down(): d = .42; t = tt(d); return (sweep(740, 196, d, .8) + .3 * sweep(1480, 392, d, .8)) * np.sin(np.pi * t / d) ** .6 * .3
def s_draw(dur): t = tt(dur); return bp(noise(dur), 2600, 6500) * (.55 + .45 * np.sin(2 * np.pi * 9 * t)) * env(dur, .08, .15) * .16

sfx = buf()
for e in ev['sfx']:
    k, t, v = e['type'], e['t'], e.get('v', 1.0); pan = float(rs.uniform(-.35, .35))
    if k == 'whoosh': put(sfx, s_whoosh(), t, .5, 0)
    elif k == 'swish': put(sfx, s_swish(), t, .5, .2)
    elif k == 'impact': put(sfx, s_impact(), t, .62 * v)
    elif k == 'thud': put(sfx, s_thud(), t, .5 * v)
    elif k == 'stamp': put(sfx, s_stamp(), t, .7 * v)
    elif k == 'pop': put(sfx, s_pop(e.get('p', 0)), t, .3 * v, pan)
    elif k == 'ding': put(sfx, s_ding(bool(e.get('low'))), t, .34 * v, pan * .5)
    elif k == 'roll': put(sfx, s_roll(e['dur']), t, .3)
    elif k == 'ticks': put(sfx, s_ticks(e['n'], e['step'], bool(e.get('soft'))), t, .32)
    elif k == 'riser': put(sfx, s_riser(e['dur']), t, .34 * v)
    elif k == 'rise': put(sfx, s_rise(e['dur'], e.get('hi', 0)), t, .8)
    elif k == 'down': put(sfx, s_down(), t, .8, pan)
    elif k == 'draw': put(sfx, s_draw(e['dur']), t, 1.0)

# ---------------- musique (112 BPM, la mineur) ----------------
BPM = 112; BEAT = 60 / BPM; BAR = 4 * BEAT
DROP = [c for c in SC['hook']['cues']][1]['t']           # la batterie entre quand la voix annonce le prix
G0 = DROP - BAR                                           # origine de la grille
END = SC['outro']['cues'][1]['t']                         # « À suivre » : accord final
CALM = (SC['ventes']['start'], SC['proj']['cues'][1]['t'])  # « les acheteurs temporisent » : la batterie se retire
def hz(m): return 440 * 2 ** ((m - 69) / 12)
CH = [(45, [57, 60, 64, 67, 71]), (41, [57, 60, 64, 65, 69]), (36, [55, 59, 60, 64, 67]), (43, [55, 59, 62, 64, 67])]  # Am9 Fmaj7 Cmaj7 G6
def saw(f, d, det=0.0):
    t = tt(d); x = np.zeros(len(t))
    for k in range(1, 14):
        if f * k > 9000: break
        x += np.sin(2 * np.pi * f * (1 + det) * k * t) / k
    return x
kick_env = np.ones(N)   # « pompe » : la nappe et la basse s'effacent brièvement à chaque coup de grosse caisse
drums, pad, bass, arp = buf(), buf(), buf(), buf()
def k_kick(): d = .28; t = tt(d); return sweep(150, 44, d, .35) * np.exp(-t * 11) + hp(noise(d), 3000) * np.exp(-t * 120) * .15
def k_clap(): d = .2; t = tt(d); return bp(noise(d), 900, 3800) * (np.exp(-t * 34) + .6 * np.exp(-np.abs(t - .012) * 300) + .5 * np.exp(-np.abs(t - .024) * 300)) * .7
def k_hat(open_=False): d = .16 if open_ else .05; t = tt(d); return hp(noise(d), 7500) * np.exp(-t * (22 if open_ else 90)) * .5
nbars = int((DUR - G0) / BAR) + 1
for b in range(-1, nbars):
    t0 = G0 + b * BAR
    if t0 + BAR < 0 or t0 > DUR: continue
    root, notes = CH[b % 4]
    full = t0 >= DROP - 1e-3 and t0 < END - .2
    calm = CALM[0] - .3 <= t0 < CALM[1] - .2
    last = t0 >= END - .2
    # nappe
    d = BAR + .5; x = sum(saw(hz(n), d, det) for n in notes for det in (-.004, .004)); x = lp(x, 900 if not full else 1500) * env(d, .35, .5) * .05
    xs = np.stack([x, np.roll(x, 400)], 1)
    put(pad, xs, max(t0, 0), 1.0 if t0 >= 0 else 1.0)
    if last: continue
    # arpège (doubles croches)
    if t0 >= 0:
        seq = [0, 2, 4, 2, 3, 2, 4, 1, 0, 2, 4, 2, 3, 4, 2, 1]
        for s in range(16):
            ts = t0 + s * BEAT / 4
            if ts < 0 or ts >= END: continue
            f = hz(notes[seq[(s + b) % 16]] + 12); dd = .22; t = tt(dd); p = (np.sin(2 * np.pi * f * t) + .4 * np.sin(4 * np.pi * f * t) + .2 * saw(f, dd)) * np.exp(-t * 16) * env(dd, .003, .03)
            g = (.5 if not full else 1.0) * (.75 if calm else 1) * (1.0 if s % 4 == 0 else .7)
            put(arp, p, ts, .085 * g, -.5 if s % 2 else .5); put(arp, p, ts + BEAT * .75, .035 * g, .5 if s % 2 else -.5)
    if not full: continue
    # basse (croches) + batterie
    for s in range(8):
        ts = t0 + s * BEAT / 2
        if ts >= END: continue
        dd = BEAT / 2 * .92; t = tt(dd); f = hz(root - (12 if root > 40 else 0)); xb = (np.sin(2 * np.pi * f * t) + .35 * lp(saw(f, dd), 500)) * env(dd, .008, .05)
        put(bass, xb, ts, .17 * (.55 if calm else 1) * (1 if s % 2 else .8))
    for s in range(4):
        ts = t0 + s * BEAT
        if ts >= END: continue
        if not calm or s == 0:
            put(drums, k_kick(), ts, .62); i = int(ts * SR); n = int(.22 * SR); kick_env[i:i + n] = np.minimum(kick_env[i:i + n], np.linspace(.35, 1, n)[:max(0, min(n, N - i))])
        if s % 2 == 1 and not calm: put(drums, k_clap(), ts, .3)
    for s in range(16):
        ts = t0 + s * BEAT / 4
        if ts >= END: continue
        if calm and s % 4 != 2: continue
        put(drums, k_hat(s % 4 == 2), ts, .16 if s % 4 == 2 else (.09 if s % 2 == 0 else .06), .25)
# accord final qui résonne
root, notes = CH[0]; d = DUR - END
x = sum(saw(hz(n), d, det) for n in notes + [57 + 12] for det in (-.004, .004)); x = lp(x, 1800) * np.exp(-tt(d) * 1.1) * env(d, .01, .6) * .09
put(pad, np.stack([x, np.roll(x, 300)], 1), END); put(bass, np.sin(2 * np.pi * hz(33) * tt(d)) * np.exp(-tt(d) * 1.4) * env(d, .01, .5), END, .22); put(drums, k_kick(), END, .6)
pad *= kick_env[:, None]; bass *= kick_env[:, None]

# ---------------- réverbération ----------------
def reverb(x, d=1.7, wet=.25):
    n = int(d * SR); t = np.arange(n) / SR; ir = np.stack([rs.randn(n), rs.randn(n)], 1) * np.exp(-t * 3.6)[:, None]; ir = hp(lp(ir, 6000), 250); ir /= np.sqrt((ir ** 2).sum(0)).max()
    w = np.stack([signal.fftconvolve(x[:, c], ir[:, c])[:N] for c in (0, 1)], 1); return x + wet * w
arp = reverb(arp, wet=.35); sfx = reverb(sfx, 1.4, .16); pad = reverb(pad, 2.0, .3)
music = pad * 1.0 + bass + arp + drums
music *= np.minimum(1, np.arange(N) / (0.4 * SR))[:, None]

# ---------------- voix + mixage ----------------
vo, sr = sf.read('../work/vo.wav', dtype='float32'); assert sr == SR
vo = hp(vo, 85); vo = np.pad(vo, (0, N - len(vo)))[:N]
c = np.abs(vo); win = int(.01 * SR); lvl = np.sqrt(signal.fftconvolve(vo ** 2, np.ones(win) / win, 'same').clip(0)) + 1e-6
thr = .16; gain = np.where(lvl > thr, (thr / lvl) ** .45, 1.0); gain = signal.fftconvolve(gain, np.ones(960) / 960, 'same'); vo = vo * gain * 1.35     # légère compression
voS = np.stack([vo, vo], 1); voS = voS + .05 * (reverb(voS, .9, 1.0) - voS)
# la musique s'efface sous la voix (« ducking »)
e = np.sqrt(signal.fftconvolve(vo ** 2, np.ones(int(.06 * SR)) / int(.06 * SR), 'same').clip(0)); e = np.minimum(1, e / .06)
a = np.zeros(N); cur = 0.0; up, dn = 1 - np.exp(-1 / (.04 * SR)), 1 - np.exp(-1 / (.35 * SR))
for i in range(N): cur += (e[i] - cur) * (up if e[i] > cur else dn); a[i] = cur
duck = 1 - .68 * a
mix = voS * 1.0 + music * duck[:, None] * .40 + sfx * (1 - .25 * a)[:, None] * .85
mix = np.tanh(mix * 1.15) / np.tanh(1.15) * .97
mix[-int(.5 * SR):] *= np.linspace(1, 0, int(.5 * SR))[:, None]
mix = mix / np.abs(mix).max() * .89
sf.write('../work/mix.wav', mix, SR); sf.write('../work/music_only.wav', (music / max(1e-6, np.abs(music).max()) * .8), SR); sf.write('../work/sfx_only.wav', sfx / max(1e-6, np.abs(sfx).max()) * .8, SR)
def db(x): return 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-9)
print(f"durée {N / SR:.2f}s | voix {db(voS):.1f} dB | musique {db(music*.40):.1f} dB (sous la voix {db(music * duck[:, None]*.40):.1f}) | bruitages {db(sfx):.1f} dB | mix {db(mix):.1f} dB, crête {np.abs(mix).max():.2f}")
print(f"grille : origine {G0:.2f}s, entrée batterie {DROP:.2f}s, passage calme {CALM[0]:.1f}–{CALM[1]:.1f}s, accord final {END:.2f}s")
