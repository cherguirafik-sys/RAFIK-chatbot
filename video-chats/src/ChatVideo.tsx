// La vidéo complète, construite comme le modèle "Secrets de chats" :
// sous-titres de 2-3 mots, mot-clé en jaune, coeurs dorés, salon / chambre.
import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import DUREES_VOIX from "./durees-voix.json"; // durée de chaque voix off (secondes)
import { Salon } from "./Salon";
import { Chambre } from "./Chambre";
import { Chat3D } from "./Chat3D";
import { CoeurDore } from "./CoeurDore";
import { SousTitre } from "./SousTitre";

// ---------- LE SCRIPT (c'est ici que tu modifies le texte) ----------
// Chaque "bout" = ce qui s'affiche à l'écran en même temps (2-3 mots).
// Mets *ÉTOILES* autour du mot à afficher en jaune.
type Scene = {
  decor: "salon" | "chambre";
  coeurs: boolean;
  ronronne: boolean;
  clignement: boolean;
  bouts: string[];
};

const SCENES: Scene[] = [
  {
    decor: "salon", coeurs: true, ronronne: false, clignement: false,
    bouts: ["TON CHAT *T'AIME*", "MAIS EST-CE QU'IL", "TE LE *MONTRE*", "*VRAIMENT* ?", "VOICI *3 SIGNES*", "QUI NE *TROMPENT* PAS"],
  },
  {
    decor: "salon", coeurs: false, ronronne: true, clignement: false,
    bouts: ["SIGNE *NUMÉRO 1*", "IL *RONRONNE*", "QUAND TU ES", "*PRÈS* DE LUI", "C'EST SA FAÇON", "DE DIRE", "JE ME SENS *BIEN*"],
  },
  {
    decor: "chambre", coeurs: false, ronronne: false, clignement: true,
    bouts: ["SIGNE *NUMÉRO 2*", "IL TE FAIT", "DES *CLIGNEMENTS*", "*LENTS*", "C'EST UN VRAI", "*BISOU* DE CHAT"],
  },
  {
    decor: "chambre", coeurs: true, ronronne: false, clignement: false,
    bouts: ["SIGNE *NUMÉRO 3*", "IL DORT", "À TES *PIEDS*", "IL TE FAIT", "*CONFIANCE*", "POUR LE *PROTÉGER*"],
  },
  {
    decor: "salon", coeurs: true, ronronne: true, clignement: false,
    bouts: ["ET TOI", "TON CHAT", "FAIT *LEQUEL* ?", "DIS-LE EN", "*COMMENTAIRE*"],
  },
];

const FPS = 30;
const PAUSE = 12; // petite pause (0,4 s) après chaque phrase

// Une scène dure le temps de sa voix off + la pause
const dureeScene = (i: number) => Math.ceil(DUREES_VOIX[i] * FPS) + PAUSE;
export const DUREE_TOTALE = SCENES.reduce((total, _s, i) => total + dureeScene(i), 0);

// Pour caler les sous-titres sur la voix : chaque bout reste à l'écran
// un temps proportionnel à sa longueur (un bout long se dit plus longtemps).
const debutsDesBouts = (bouts: string[], dureeVoix: number) => {
  const longueurs = bouts.map((b) => b.replace(/\*/g, "").length + 4);
  const total = longueurs.reduce((a, b) => a + b, 0);
  let t = 0;
  return longueurs.map((l) => {
    const debut = Math.round((t / total) * dureeVoix);
    t += l;
    return debut;
  });
};

// Fondu au début et à la fin de chaque scène
const Fondu: React.FC<{ duree: number; children: React.ReactNode }> = ({ duree, children }) => {
  const frame = useCurrentFrame();
  const opacite = interpolate(frame, [0, 8, duree - 8, duree], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: opacite }}>{children}</AbsoluteFill>;
};

export const ChatVideo: React.FC = () => {
  let debut = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {SCENES.map((scene, i) => {
        const duree = dureeScene(i);
        const dureeVoix = Math.ceil(DUREES_VOIX[i] * FPS);
        const debuts = debutsDesBouts(scene.bouts, dureeVoix);
        const from = debut;
        debut += duree;
        return (
          <Sequence key={i} from={from} durationInFrames={duree}>
            <Fondu duree={duree}>
              {scene.decor === "salon" ? <Salon /> : <Chambre />}
              <Chat3D
                ronronne={scene.ronronne}
                clignement={scene.clignement}
                lumiere={scene.decor === "salon" ? "#fff0d0" : "#ffc77a"}
              />
              {scene.coeurs && <CoeurDore />}
            </Fondu>
            {/* Les sous-titres : un bout après l'autre */}
            {/* La voix off de la scène */}
            <Audio src={staticFile(`voix/scene${i + 1}.wav`)} />
            {scene.bouts.map((bout, j) => (
              <Sequence key={j} from={debuts[j]} durationInFrames={(debuts[j + 1] ?? duree) - debuts[j]}>
                <SousTitre texte={bout} />
              </Sequence>
            ))}
          </Sequence>
        );
      })}
      {/* Ton pseudo en filigrane (à remplacer par le tien) */}
      <div style={{ position: "absolute", bottom: 230, width: "100%", textAlign: "center", color: "rgba(255,255,255,0.55)", fontFamily: "Arial, sans-serif", fontSize: 30, fontWeight: 700 }}>
        @mes.chats
      </div>
    </AbsoluteFill>
  );
};
