// Le chat en VRAIE 3D (Three.js) : chaque partie est un volume
// (sphères, cônes, tubes) éclairé par des lumières, filmé par une caméra 3D.
import React, { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

type Props = {
  ronronne: boolean;
  clignement: boolean;
  lumiere: string; // couleur de la lumière principale (dépend du décor)
};

// Matière "fourrure noire" : le "sheen" donne un léger reflet velouté sur les bords
const Fourrure: React.FC = () => (
  <meshPhysicalMaterial color="#120e0c" roughness={0.75} sheen={0.7} sheenRoughness={0.5} sheenColor="#7a5c46" />
);

// La caméra tourne doucement autour du chat (c'est ce qui montre la 3D !)
const Camera: React.FC = () => {
  const frame = useCurrentFrame();
  const { camera } = useThree();
  const angle = Math.sin(frame / 70) * 0.35; // environ ±20 degrés
  const distance = 12.5;
  camera.position.set(Math.sin(angle) * distance, 2.9, Math.cos(angle) * distance);
  camera.lookAt(0, 2.45, 0);
  return null;
};

const LeChat: React.FC<Props> = ({ ronronne, clignement }) => {
  const frame = useCurrentFrame();

  const respiration = 1 + Math.sin(frame / 12) * 0.015;
  const teteY = Math.sin(frame / 30) * 0.25; // la tête tourne gauche/droite
  const teteZ = Math.sin(frame / 22) * 0.08; // la tête penche
  const bouche = 0.35 + Math.abs(Math.sin(frame / 4)) * 0.9;

  // Ouverture des yeux (1 = ouverts)
  let yeux = 1;
  if (clignement) {
    yeux = interpolate(frame % 60, [0, 20, 35, 55], [1, 0.08, 0.08, 1], { extrapolateRight: "clamp" });
  } else {
    yeux = frame % 90 < 4 ? 0.1 : 1;
  }

  // La queue : un tube qui suit une courbe, et le bout remue
  const bout = Math.sin(frame / 10) * 0.25;
  const queue = useMemo(() => {
    const courbe = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.2, 0.2, -0.75),
      new THREE.Vector3(1.0, 0.18, -0.35),
      new THREE.Vector3(1.15, 0.16, 0.45),
      new THREE.Vector3(0.6, 0.16, 1.05),
      new THREE.Vector3(-0.15 + bout, 0.2 + Math.abs(bout) * 0.4, 1.15),
    ]);
    return new THREE.TubeGeometry(courbe, 40, 0.17, 16, false);
  }, [bout]);

  return (
    <group>
      {/* ---------- CORPS ---------- */}
      <group scale={[respiration, respiration, respiration]}>
        <mesh position={[0, 1.15, 0]} scale={[0.88, 1.25, 0.85]} castShadow>
          <sphereGeometry args={[1, 64, 64]} />
          <Fourrure />
        </mesh>
        {/* Poitrail bombé */}
        <mesh position={[0, 1.75, 0.38]} scale={[0.62, 0.75, 0.55]} castShadow>
          <sphereGeometry args={[1, 48, 48]} />
          <Fourrure />
        </mesh>
        {/* Petite tache blanche */}
        <mesh position={[0, 1.9, 0.95]} scale={[0.1, 0.13, 0.04]}>
          <sphereGeometry args={[1, 24, 24]} />
          <meshStandardMaterial color="#f2ece4" roughness={0.9} />
        </mesh>
      </group>

      {/* Pattes avant + coussinets */}
      {[-0.33, 0.33].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.65, 0.62]} castShadow>
            <capsuleGeometry args={[0.21, 0.85, 12, 24]} />
            <Fourrure />
          </mesh>
          <mesh position={[x, 0.15, 0.8]} scale={[1, 0.7, 1.25]} castShadow>
            <sphereGeometry args={[0.24, 32, 32]} />
            <Fourrure />
          </mesh>
        </group>
      ))}

      {/* Queue */}
      <mesh geometry={queue} castShadow>
        <Fourrure />
      </mesh>

      {/* ---------- TÊTE ---------- */}
      <group position={[0, 2.95, 0.05]} rotation={[0, teteY, teteZ]}>
        <mesh scale={[1.08, 0.9, 0.95]} castShadow>
          <sphereGeometry args={[0.95, 64, 64]} />
          <Fourrure />
        </mesh>

        {/* Oreilles (cônes) avec intérieur rose */}
        {[-1, 1].map((c) => (
          <group key={c} position={[c * 0.58, 0.78, -0.05]} rotation={[0, 0, -c * 0.3]}>
            <mesh castShadow>
              <coneGeometry args={[0.4, 1.0, 32]} />
              <Fourrure />
            </mesh>
            <mesh position={[0, -0.04, 0.13]} scale={[0.7, 0.8, 0.5]}>
              <coneGeometry args={[0.4, 1.0, 32]} />
              <meshStandardMaterial color="#a85d5a" roughness={0.7} />
            </mesh>
          </group>
        ))}

        {/* Museau (deux joues) */}
        {[-0.14, 0.14].map((x) => (
          <mesh key={x} position={[x, -0.3, 0.72]} scale={[1, 0.75, 0.7]}>
            <sphereGeometry args={[0.2, 32, 32]} />
            <Fourrure />
          </mesh>
        ))}

        {/* Yeux : globe jaune-vert, pupille noire, reflets blancs */}
        {[-0.4, 0.4].map((x) => (
          <group key={x} position={[x, 0.08, 0.75]} scale={[1, yeux, 1]} rotation={[0, x * 0.5, 0]}>
            <mesh scale={[1, 0.95, 0.55]}>
              <sphereGeometry args={[0.26, 48, 48]} />
              <meshPhysicalMaterial color="#d6e04a" emissive="#6b7010" emissiveIntensity={0.4} roughness={0.1} clearcoat={1} />
            </mesh>
            <mesh position={[0, 0, 0.12]} scale={[0.45, 1.3, 0.3]}>
              <sphereGeometry args={[0.13, 32, 32]} />
              <meshStandardMaterial color="#050505" roughness={0.2} />
            </mesh>
            <mesh position={[-0.07, 0.09, 0.15]}>
              <sphereGeometry args={[0.045, 16, 16]} />
              <meshBasicMaterial color="white" />
            </mesh>
          </group>
        ))}

        {/* Nez rose */}
        <mesh position={[0, -0.18, 0.86]} scale={[1.2, 0.8, 0.8]}>
          <sphereGeometry args={[0.08, 24, 24]} />
          <meshStandardMaterial color="#8c5a55" roughness={0.4} />
        </mesh>

        {/* Bouche qui s'ouvre */}
        <mesh position={[0, -0.42, 0.8]} scale={[1.2, bouche, 0.5]}>
          <sphereGeometry args={[0.1, 24, 24]} />
          <meshStandardMaterial color="#5a1a1e" roughness={0.8} />
        </mesh>

        {/* Moustaches : fins cylindres blancs */}
        {[-1, 1].map((c) =>
          [0, 1, 2].map((i) => (
            <mesh key={`${c}${i}`} position={[c * 0.75, -0.3 + i * 0.07, 0.8]} rotation={[0, c * 0.25, Math.PI / 2 + c * (i - 1) * 0.15]}>
              <cylinderGeometry args={[0.008, 0.004, 0.9, 6]} />
              <meshBasicMaterial color="#f4efe8" />
            </mesh>
          ))
        )}
      </group>

      {/* Anneaux dorés du ronronnement (en 3D autour du poitrail) */}
      {ronronne &&
        [0, 1, 2].map((i) => {
          const p = ((frame + i * 12) % 36) / 36;
          const s = 1.1 + p * 1.1;
          return (
            <mesh key={i} position={[0, 1.8, 0]} rotation={[Math.PI / 2 - 0.15, 0, 0]} scale={[s, s, s]}>
              <torusGeometry args={[1, 0.025, 12, 96]} />
              <meshBasicMaterial color="#ffd36b" transparent opacity={1 - p} />
            </mesh>
          );
        })}
    </group>
  );
};

export const Chat3D: React.FC<Props> = (props) => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas
      width={width}
      height={height}
      shadows
      camera={{ fov: 30, near: 0.1, far: 100 }}
      gl={{ alpha: true, antialias: true }}
      style={{ position: "absolute", top: 0, left: 0 }}
    >
      <Camera />
      {/* Lumières : ambiance + lumière principale + lumière de contour derrière */}
      <ambientLight intensity={0.35} color="#ffe9d0" />
      <directionalLight
        position={[3, 6, 6]}
        intensity={1.8}
        color={props.lumiere}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={6}
        shadow-camera-bottom={-2}
      />
      <directionalLight position={[-4, 4, -5]} intensity={3} color="#ffd9a0" />
      <directionalLight position={[4, 3, -5]} intensity={2} color="#fff0d8" />
      <pointLight position={[0, 3, 4]} intensity={3} distance={12} color="#ffe2c0" />

      <LeChat {...props} />

      {/* Sol invisible qui reçoit seulement l'ombre du chat */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <shadowMaterial opacity={0.4} />
      </mesh>
    </ThreeCanvas>
  );
};
