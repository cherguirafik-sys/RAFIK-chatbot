import tts_lib, numpy as np, soundfile as sf, json, sys
SR = 48000
SCENES = [
 ("hook",   ["Acheter à Paris, fin deux mille vingt-six ?",
             "Comptez neuf mille cinq cent quatre-vingt-dix euros, le mètre carré."]),
 ("trend",  ["C'est un demi pour cent de moins qu'il y a un an.",
             "Et près de douze pour cent sous le record de deux mille vingt."]),
 ("budget", ["Concrètement, un deux-pièces de cinquante mètres carrés, c'est environ quatre cent quatre-vingt mille euros."]),
 ("arr",    ["Mais tout dépend de l'adresse.",
             "Dans le sixième arrondissement, plus de treize mille euros le mètre carré.",
             "Dans le dix-neuvième, environ sept mille cinq cents.",
             "Presque le double."]),
 ("credit", ["Côté crédit, les taux remontent : trois virgule quarante-neuf pour cent en moyenne en octobre.",
             "Et on emprunte désormais sur vingt et un ans."]),
 ("ventes", ["Résultat ? Les acheteurs temporisent.",
             "À Paris, les ventes baissent de deux pour cent."]),
 ("proj",   ["Et la suite ?",
             "Les notaires prévoient neuf mille cinq cent quatre-vingts euros le mètre carré.",
             "Autrement dit, des prix stables."]),
 ("outro",  ["Paris reste chère, mais le marché marque une pause.",
             "À suivre."]),
]
SPEED = 1.06
GAP = 0.28          # silence entre deux phrases d'une même scène
LEAD, TAIL = 0.55, 0.55   # respiration avant / après la voix dans chaque scène
def resample(x, sr):
    n = int(round(len(x) * SR / sr)); return np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x).astype(np.float32)
def trim(x, sr, thr=0.012):
    idx = np.where(np.abs(x) > thr)[0]
    if len(idx) == 0: return x
    a = max(0, idx[0] - int(0.02 * sr)); b = min(len(x), idx[-1] + int(0.08 * sr)); return x[a:b]
tts, sid = tts_lib.make('kokoro')
t = 0.0; chunks = []; timeline = []; ok = True
for name, sents in SCENES:
    start = t; t += LEAD; chunks.append(np.zeros(int(LEAD * SR), np.float32)); cues = []
    for i, s in enumerate(sents):
        a = tts.generate(s, sid=sid, speed=SPEED); x = trim(np.array(a.samples, np.float32), a.sample_rate)
        heard = tts_lib.asr(np.concatenate([np.zeros(a.sample_rate//2,np.float32), x, np.zeros(2*a.sample_rate,np.float32)]), a.sample_rate).strip()
        x = resample(x, a.sample_rate); d = len(x) / SR
        cues.append({"t": round(t, 3), "d": round(d, 3), "text": s, "heard": heard})
        chunks.append(x); t += d
        if i < len(sents) - 1: chunks.append(np.zeros(int(GAP * SR), np.float32)); t += GAP
    chunks.append(np.zeros(int(TAIL * SR), np.float32)); t += TAIL
    timeline.append({"name": name, "start": round(start, 3), "end": round(t, 3), "cues": cues})
vo = np.concatenate(chunks); vo = vo / np.abs(vo).max() * 0.89
sf.write('../work/vo.wav', vo, SR)
json.dump({"duration": round(len(vo) / SR, 3), "scenes": timeline}, open('../work/timeline.json', 'w'), ensure_ascii=False, indent=1)
print('TOTAL', round(len(vo) / SR, 2), 's')
for sc in timeline:
    print(f"\n[{sc['name']}] {sc['start']:.2f} -> {sc['end']:.2f}")
    for c in sc['cues']: print(f"  {c['t']:6.2f} +{c['d']:.2f}  {c['text']}\n           >> {c['heard']}")
