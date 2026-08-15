import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Float,
  Html,
  OrbitControls,
  RoundedBox,
} from "@react-three/drei";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import type { Participant } from "@/components/ClassroomStage";

const COULEURS = ["#f59e0b", "#14b8a6", "#6366f1", "#ec4899", "#22c55e", "#0ea5e9", "#f43f5e"];

function teinte(id: string) {
  let s = 0;
  for (const c of id) s += c.charCodeAt(0);
  return COULEURS[s % COULEURS.length]!;
}

/** Les 4 faces de la salle (angle azimutal de la caméra). */
const FACES = [
  { cle: "avant", label: "Face", angle: 0 },
  { cle: "droite", label: "Droite", angle: Math.PI / 2 },
  { cle: "arriere", label: "Arrière", angle: Math.PI },
  { cle: "gauche", label: "Gauche", angle: -Math.PI / 2 },
] as const;

/** Un avatar stylisé assis : corps capsule, tête sphérique, étiquette du nom. */
function Avatar3D({
  p,
  position,
  prof = false,
  index = 0,
  rotationY = 0,
}: {
  p: Participant;
  position: [number, number, number];
  prof?: boolean;
  index?: number;
  rotationY?: number;
}) {
  const groupe = useRef<THREE.Group>(null);
  const couleur = prof ? "#1e3a8a" : teinte(p.user_id);

  useFrame((state) => {
    if (!groupe.current) return;
    const t = state.clock.elapsedTime + index * 0.7;
    groupe.current.position.y = position[1] + Math.sin(t * 1.4) * 0.02;
    groupe.current.rotation.y = rotationY + Math.sin(t * 0.5) * 0.08;
  });

  return (
    <group ref={groupe} position={position} rotation={[0, rotationY, 0]}>
      {/* buste */}
      <mesh castShadow position={[0, 0.78, 0]}>
        <capsuleGeometry args={[0.2, 0.3, 8, 20]} />
        <meshStandardMaterial color={couleur} roughness={0.45} metalness={0.05} />
      </mesh>
      {/* jambes repliées (assis) */}
      {!prof && (
        <mesh castShadow position={[0, 0.5, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.13, 0.3, 6, 12]} />
          <meshStandardMaterial color="#334155" roughness={0.7} />
        </mesh>
      )}
      <mesh castShadow position={[0, 1.16, 0]}>
        <sphereGeometry args={[0.19, 32, 32]} />
        <meshStandardMaterial color="#f7d7bb" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.26, 0]}>
        <sphereGeometry args={[0.195, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2.6]} />
        <meshStandardMaterial color={prof ? "#0f172a" : "#3f2a20"} roughness={0.8} />
      </mesh>
      <Html center distanceFactor={8} position={[0, 1.65, 0]} zIndexRange={[10, 0]}>
        <div className="pointer-events-none whitespace-nowrap rounded-full bg-background/90 px-2.5 py-0.5 text-[11px] font-medium text-foreground shadow ring-1 ring-border">
          {prof ? "👩‍🏫 " : ""}
          {p.nom}
        </div>
      </Html>
    </group>
  );
}

/** Table + chaise d'élève (style scandinave, bois clair et métal). */
function TableEtChaise({ position }: { position: [number, number, number] }) {
  const pieds: [number, number][] = [
    [-0.42, -0.22],
    [0.42, -0.22],
    [-0.42, 0.22],
    [0.42, 0.22],
  ];
  return (
    <group position={position}>
      {/* table devant l'élève */}
      <group position={[0, 0, -0.75]}>
        <RoundedBox args={[1.15, 0.06, 0.62]} radius={0.025} smoothness={4} position={[0, 0.72, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#d9b979" roughness={0.5} metalness={0.05} />
        </RoundedBox>
        {/* casier sous le plateau */}
        <RoundedBox args={[0.95, 0.16, 0.5]} radius={0.03} position={[0, 0.58, 0]} castShadow>
          <meshStandardMaterial color="#b48b4e" roughness={0.7} />
        </RoundedBox>
        {pieds.map(([x, z], i) => (
          <mesh key={i} position={[x, 0.35, z]} castShadow>
            <cylinderGeometry args={[0.028, 0.028, 0.7, 12]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.3} metalness={0.7} />
          </mesh>
        ))}
        {/* cahier posé */}
        <mesh position={[0.18, 0.76, 0.05]} rotation={[-Math.PI / 2, 0, 0.2]} castShadow>
          <planeGeometry args={[0.3, 0.22]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
      </group>
      {/* chaise */}
      <group position={[0, 0, 0.05]}>
        <RoundedBox args={[0.5, 0.06, 0.5]} radius={0.02} position={[0, 0.45, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#0ea5e9" roughness={0.55} />
        </RoundedBox>
        <RoundedBox args={[0.5, 0.42, 0.06]} radius={0.03} position={[0, 0.7, 0.24]} castShadow>
          <meshStandardMaterial color="#0284c7" roughness={0.55} />
        </RoundedBox>
        {[
          [-0.2, -0.2],
          [0.2, -0.2],
          [-0.2, 0.2],
          [0.2, 0.2],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x!, 0.22, z!]} castShadow>
            <cylinderGeometry args={[0.022, 0.022, 0.45, 10]} />
            <meshStandardMaterial color="#64748b" roughness={0.3} metalness={0.7} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Salle({ titre }: { titre: string }) {
  const L = 16; // largeur
  const P = 14; // profondeur
  const H = 4.2; // hauteur
  return (
    <group>
      {/* Sol */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[L, P]} />
        <meshStandardMaterial color="#e8e2d6" roughness={0.9} />
      </mesh>
      {/* Tapis central */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 1]} receiveShadow>
        <planeGeometry args={[9, 7]} />
        <meshStandardMaterial color="#dfe7ee" roughness={1} />
      </mesh>
      {/* Plafond */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, 0]}>
        <planeGeometry args={[L, P]} />
        <meshStandardMaterial color="#ffffff" roughness={1} />
      </mesh>
      {/* Néons */}
      {[-2.5, 2.5].map((z) => (
        <mesh key={z} position={[0, H - 0.08, z]}>
          <boxGeometry args={[5, 0.08, 0.3]} />
          <meshStandardMaterial color="#ffffff" emissive="#fff8e1" emissiveIntensity={1.4} />
        </mesh>
      ))}
      {/* 4 murs */}
      <mesh position={[0, H / 2, -P / 2]} receiveShadow>
        <planeGeometry args={[L, H]} />
        <meshStandardMaterial color="#f4efe4" roughness={1} />
      </mesh>
      <mesh position={[0, H / 2, P / 2]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[L, H]} />
        <meshStandardMaterial color="#eee8dc" roughness={1} />
      </mesh>
      <mesh position={[-L / 2, H / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[P, H]} />
        <meshStandardMaterial color="#efe9dd" roughness={1} />
      </mesh>
      <mesh position={[L / 2, H / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[P, H]} />
        <meshStandardMaterial color="#efe9dd" roughness={1} />
      </mesh>
      {/* Fenêtres sur le mur latéral droit */}
      {[-2.5, 1.5].map((z) => (
        <group key={z} position={[L / 2 - 0.05, 2.3, z]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh>
            <planeGeometry args={[2.8, 1.9]} />
            <meshStandardMaterial color="#bfe3f5" emissive="#9fd6f2" emissiveIntensity={0.4} />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <boxGeometry args={[0.06, 1.9, 0.02]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
        </group>
      ))}
      {/* Tableau */}
      <group position={[0, 2.1, -P / 2 + 0.12]}>
        <RoundedBox args={[7.2, 3, 0.14]} radius={0.06} castShadow>
          <meshStandardMaterial color="#7c5c3b" roughness={0.7} />
        </RoundedBox>
        <mesh position={[0, 0, 0.09]}>
          <planeGeometry args={[6.8, 2.65]} />
          <meshStandardMaterial color="#14352a" roughness={0.95} />
        </mesh>
        <Html center distanceFactor={9} position={[0, 0, 0.12]} zIndexRange={[5, 0]}>
          <div className="pointer-events-none w-[420px] text-center font-display text-2xl leading-snug text-emerald-50/95 drop-shadow">
            {titre}
          </div>
        </Html>
      </group>
      {/* Bureau du professeur */}
      <group position={[-2.9, 0, -P / 2 + 2.4]}>
        <RoundedBox args={[2.3, 0.08, 1]} radius={0.03} position={[0, 0.78, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#a97c50" roughness={0.55} />
        </RoundedBox>
        <RoundedBox args={[2.1, 0.6, 0.8]} radius={0.04} position={[0, 0.44, -0.05]} castShadow>
          <meshStandardMaterial color="#8a6a45" roughness={0.7} />
        </RoundedBox>
      </group>
      {/* Bibliothèque au fond à droite */}
      <group position={[5.6, 0, -P / 2 + 0.6]}>
        <RoundedBox args={[2.4, 2.2, 0.5]} radius={0.04} position={[0, 1.1, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#b7834c" roughness={0.7} />
        </RoundedBox>
        {[0.6, 1.3, 1.9].map((y, r) =>
          [-0.8, -0.2, 0.4, 0.9].map((x, c) => (
            <mesh key={`${r}-${c}`} position={[x, y, 0.28]} castShadow>
              <boxGeometry args={[0.16, 0.42, 0.12]} />
              <meshStandardMaterial color={COULEURS[(r * 4 + c) % COULEURS.length]!} roughness={0.6} />
            </mesh>
          )),
        )}
      </group>
      {/* Plante déco */}
      <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.3}>
        <group position={[-6, 0, -3.2]}>
          <mesh position={[0, 0.25, 0]} castShadow>
            <cylinderGeometry args={[0.32, 0.24, 0.5, 12]} />
            <meshStandardMaterial color="#c2703d" roughness={0.8} />
          </mesh>
          <mesh position={[0, 1.15, 0]} castShadow>
            <coneGeometry args={[0.55, 1.5, 10]} />
            <meshStandardMaterial color="#2f7d54" roughness={0.8} />
          </mesh>
        </group>
      </Float>
    </group>
  );
}

/** Caméra : orbite manuelle permanente + transition douce vers une face + rotation auto (cinéma). */
function CameraRig({
  controlsRef,
  angleCible,
  cinema,
  animation,
  finAnimation,
}: {
  controlsRef: React.MutableRefObject<any>;
  angleCible: number;
  cinema: boolean;
  animation: boolean;
  finAnimation: () => void;
}) {
  useFrame((_, delta) => {
    const c = controlsRef.current;
    if (!c || !animation) return;
    const actuel = c.getAzimuthalAngle();
    let ecart = angleCible - actuel;
    while (ecart > Math.PI) ecart -= Math.PI * 2;
    while (ecart < -Math.PI) ecart += Math.PI * 2;
    if (Math.abs(ecart) < 0.01) {
      c.setAzimuthalAngle(angleCible);
      c.update();
      finAnimation();
      return;
    }
    c.setAzimuthalAngle(actuel + ecart * Math.min(1, delta * 4));
    c.update();
  });
  void cinema;
  return null;
}



export default function Classroom3D({
  prof,
  eleves,
  titreTableau,
  cinematique = true,
}: {
  prof?: Participant | undefined;
  eleves: Participant[];
  titreTableau: string;
  cinematique?: boolean;
}) {
  const controlsRef = useRef<any>(null);
  const [face, setFace] = useState(0);
  const [animation, setAnimation] = useState(false);
  const [cinema, setCinema] = useState(cinematique);

  useEffect(() => {
    setCinema(cinematique);
  }, [cinematique]);


  const places = useMemo(() => {
    const parRangee = 4;
    return eleves.map((e, i) => {
      const rangee = Math.floor(i / parRangee);
      const col = i % parRangee;
      const total = Math.min(eleves.length - rangee * parRangee, parRangee);
      const x = (col - (total - 1) / 2) * 2.3;
      const z = -1.4 + rangee * 2.4;
      return { e, pos: [x, 0, z] as [number, number, number] };
    });
  }, [eleves]);

  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-sky-100 to-background">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 3.4, 6.5], fov: 55 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.55} />
          <hemisphereLight args={["#ffffff", "#cbb99a", 0.6]} />
          <directionalLight
            position={[6, 9, 6]}
            intensity={1.3}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          <spotLight position={[0, 4, -3]} angle={0.8} penumbra={0.9} intensity={1.2} castShadow />
          <Salle titre={titreTableau} />
          {prof && <Avatar3D p={prof} position={[-2.9, 0, -3.6]} prof rotationY={Math.PI} />}
          {places.map(({ e, pos }, i) => (
            <group key={e.user_id}>
              <TableEtChaise position={pos} />
              <Avatar3D p={e} position={pos} index={i} rotationY={Math.PI} />
            </group>
          ))}
          <ContactShadows position={[0, 0.02, 0]} opacity={0.35} scale={24} blur={2.5} far={6} />
          <CameraRig
            controlsRef={controlsRef}
            angleCible={FACES[face]!.angle}
            cinema={cinema}
            animation={animation}
            finAnimation={() => setAnimation(false)}
          />
          <OrbitControls
            ref={controlsRef}
            enablePan={false}
            enableDamping
            dampingFactor={0.08}
            rotateSpeed={0.7}
            minDistance={3}
            maxDistance={13}
            maxPolarAngle={Math.PI / 2.05}
            target={[0, 1.3, -1]}
            autoRotate={cinema && !animation}
            autoRotateSpeed={0.6}
            onStart={() => {
              setAnimation(false);
              setCinema(false);
            }}
          />
        </Suspense>
      </Canvas>

      {/* Rotation sur les 4 faces */}
      <div className="pointer-events-auto absolute left-1/2 top-3 flex -translate-x-1/2 flex-wrap items-center justify-center gap-1 rounded-full bg-background/85 p-1 shadow ring-1 ring-border backdrop-blur">
        {FACES.map((f, i) => (
          <Button
            key={f.cle}
            size="sm"
            variant={!cinema && face === i ? "default" : "ghost"}
            className="h-7 rounded-full px-3 text-xs"
            onClick={() => {
              setCinema(false);
              setFace(i);
              setAnimation(true);
            }}
          >
            {f.label}
          </Button>
        ))}
        <Button
          size="sm"
          variant={cinema ? "default" : "ghost"}
          className="h-7 rounded-full px-3 text-xs"
          onClick={() => {
            setAnimation(false);
            setCinema((v) => !v);
          }}
        >
          {cinema ? "Stop 360°" : "Rotation 360°"}
        </Button>
      </div>

      <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-background/85 px-3 py-1 text-[11px] text-muted-foreground shadow">
        {cinema
          ? "Rotation automatique — glissez pour reprendre la main"
          : `Vue ${FACES[face]!.label.toLowerCase()} · glissez pour tourner, molette pour zoomer`}
      </div>


      {eleves.length === 0 && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-background/85 px-3 py-1 text-xs text-muted-foreground shadow">
          Aucun élève présent pour l'instant.
        </div>
      )}
    </div>
  );
}
