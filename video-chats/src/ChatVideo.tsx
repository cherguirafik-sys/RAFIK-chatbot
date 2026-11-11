// La vidéo complète : on enchaîne les scènes avec <Sequence>
import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Salon } from "./Salon";
import { Chat } from "./Chat";
import { SousTitre } from "./SousTitre";

// Chaque scène : son texte, ses mots jaunes, et ce que fait le chat
const SCENES = [
  { texte: "TON CHAT T'AIME VRAIMENT ?", jaunes: ["T'AIME"], ronronne: false, clignement: false, coeurs: false },
  { texte: "3 SIGNES QUI NE TROMPENT PAS", jaunes: ["3", "SIGNES"], ronronne: false, clignement: false, coeurs: false },
  { texte: "1. IL RONRONNE QUAND TU LE CARESSES", jaunes: ["RONRONNE"], ronronne: true, clignement: false, coeurs: false },
  { texte: "2. IL CLIGNE LENTEMENT DES YEUX", jaunes: ["CLIGNE", "LENTEMENT"], ronronne: false, clignement: true, coeurs: false },
  { texte: "3. IL TE SUIT PARTOUT", jaunes: ["SUIT", "PARTOUT"], ronronne: false, clignement: false, coeurs: true },
  { texte: "ABONNE-TOI POUR PLUS DE SECRETS", jaunes: ["ABONNE-TOI", "SECRETS"], ronronne: true, clignement: false, coeurs: true },
];

const DUREE_SCENE = 90; // 90 images = 3 secondes à 30 i/s
export const DUREE_TOTALE = SCENES.length * DUREE_SCENE;

export const ChatVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Salon />
      {SCENES.map((scene, i) => (
        <Sequence key={i} from={i * DUREE_SCENE} durationInFrames={DUREE_SCENE}>
          <AbsoluteFill style={{ top: 380 }}>
            <Chat ronronne={scene.ronronne} clignement={scene.clignement} coeurs={scene.coeurs} />
          </AbsoluteFill>
          <SousTitre texte={scene.texte} motsJaunes={scene.jaunes} haut={1050} />
        </Sequence>
      ))}
      {/* Petit filigrane */}
      <div
        style={{
          position: "absolute",
          bottom: 300,
          width: "100%",
          textAlign: "center",
          color: "rgba(255,255,255,0.7)",
          fontFamily: "Arial, sans-serif",
          fontSize: 34,
          fontWeight: 700,
        }}
      >
        @mes.chats
      </div>
    </AbsoluteFill>
  );
};
