import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Float,
  Html,
  OrbitControls,
  RoundedBox,
} from "@react-three/drei";
import type * as THREE from "three";
import type { Participant } from "@/components/ClassroomStage";

const COULEURS = ["#f59e0b", "#14b8a6", "#6366f1", "#ec4899", "#22c55e", "#0ea5e9", "#f43f5e"];

function teinte(id: string) {
  let s = 0;
  for (const c of id) s += c.charCodeAt(0);
  return COULEURS[s % COULEURS.length]!;
}

/** Un avatar stylisé : corps capsule, tête sphérique, étiquette du nom. */
function Avatar3D({
  p,
  position,
  prof = false,
  index = 0,
}: {
  p: Participant;
  position: [number, number, number];
  prof?: boolean;
  index?: number;
}) {
  const groupe = useRef<THREE.Group>(null);
  const couleur = prof ? "#1e3a8a" : teinte(p.user_id);

  useFrame((state) => {
    if (!groupe.current) return;
    const t = state.clock.elapsedTime + index * 0.7;
    groupe.current.position.y = position[1] + Math.sin(t * 1.4) * 0.03;
    groupe.current.rotation.y = Math.sin(t * 0.5) * 0.12;
  });

  return (
    <group ref={groupe} position={position}>
      <mesh castShadow position={[0, 0.42, 0]}>
        <capsuleGeometry args={[0.22, 0.34, 8, 20]} />
        <meshStandardMaterial color={couleur} roughness={0.45} metalness={0.05} />
      </mesh>
      <mesh castShadow position={[0, 0.92, 0]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color="#f7d7bb" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.03, 0]}>
        <sphereGeometry args={[0.205, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2.6]} />
        <meshStandardMaterial color={prof ? "#0f172a" : "#3f2a20"} roughness={0.8} />
      </mesh>
      <Html center distanceFactor={7} position={[0, 1.45, 0]} zIndexRange={[10, 0]}>
        <div className="pointer-events-none whitespace-nowrap rounded-full bg-background/90 px-2.5 py-0.5 text-[11px] font-medium text-foreground shadow ring-1 ring-border">
          {prof ? "👩‍🏫 " : ""}
          {p.nom}
        </div>
      </Html>
    </group>
  );
}

function Pupitre({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <RoundedBox args={[0.95, 0.06, 0.55]} radius={0.02} position={[0, 0.55, 0.45]} castShadow receiveShadow>
        <meshStandardMaterial color="#c9a227" roughness={0.6} />
      </RoundedBox>
      {[
        [-0.4, 0.2],
        [0.4, 0.2],
        [-0.4, 0.68],
        [0.4, 0.68],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x!, 0.27, 0.45 + (z! - 0.44)]}>
          <cylinderGeometry args={[0.025, 0.025, 0.55, 8]} />
          <meshStandardMaterial color="#5b4636" />
        </mesh>
      ))}
    </group>
  );
}

function Salle({ titre }: { titre: string }) {
  return (
    <group>
      {/* Sol */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[24, 20]} />
        <meshStandardMaterial color="#e8e2d6" roughness={0.9} />
      </mesh>
      {/* Mur du fond */}
      <mesh position={[0, 3, -5]} receiveShadow>
        <planeGeometry args={[24, 6]} />
        <meshStandardMaterial color="#f4efe4" roughness={1} />
      </mesh>
      {/* Tableau */}
      <group position={[0, 2.1, -4.9]}>
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
      <RoundedBox args={[2.2, 0.75, 0.9]} radius={0.05} position={[-2.6, 0.38, -3.2]} castShadow receiveShadow>
        <meshStandardMaterial color="#8a6a45" roughness={0.6} />
      </RoundedBox>
      {/* Fenêtres */}
      {[-7.5, -4.2].map((x) => (
        <mesh key={x} position={[x, 2.6, -4.94]}>
          <planeGeometry args={[2.4, 1.8]} />
          <meshStandardMaterial color="#bfe3f5" emissive="#9fd6f2" emissiveIntensity={0.35} />
        </mesh>
      ))}
      {/* Plante déco */}
      <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.3}>
        <mesh position={[5.6, 0.5, -3.6]} castShadow>
          <coneGeometry args={[0.55, 1.5, 10]} />
          <meshStandardMaterial color="#2f7d54" roughness={0.8} />
        </mesh>
      </Float>
    </group>
  );
}

/** Caméra cinématique : lent travelling autour de la salle. */
function CameraCinema({ actif }: { actif: boolean }) {
  useFrame((state) => {
    if (!actif) return;
    const t = state.clock.elapsedTime * 0.12;
    state.camera.position.x = Math.sin(t) * 3.2;
    state.camera.position.y = 3.4 + Math.sin(t * 0.7) * 0.35;
    state.camera.position.z = 8.4 + Math.cos(t) * 1.1;
    state.camera.lookAt(0, 1.4, -3);
  });
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
  const places = useMemo(() => {
    const parRangee = 4;
    return eleves.map((e, i) => {
      const rangee = Math.floor(i / parRangee);
      const col = i % parRangee;
      const total = Math.min(eleves.length - rangee * parRangee, parRangee);
      const x = (col - (total - 1) / 2) * 2.1;
      const z = -0.6 + rangee * 2.2;
      return { e, pos: [x, 0, z] as [number, number, number] };
    });
  }, [eleves]);

  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-sky-100 to-background">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 3.4, 9], fov: 45 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.65} />
          <directionalLight
            position={[5, 8, 5]}
            intensity={1.4}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <spotLight position={[0, 6, -1]} angle={0.7} penumbra={0.8} intensity={1.1} castShadow />
          <Salle titre={titreTableau} />
          {prof && <Avatar3D p={prof} position={[-2.6, 0, -2.3]} prof />}
          {places.map(({ e, pos }, i) => (
            <Avatar3D key={e.user_id} p={e} position={pos} index={i} />
          ))}
          <ContactShadows position={[0, 0.01, 0]} opacity={0.35} scale={22} blur={2.5} far={6} />
          <Environment preset="city" />
          <CameraCinema actif={cinematique} />
          {!cinematique && (
            <OrbitControls
              enablePan={false}
              minDistance={5}
              maxDistance={14}
              maxPolarAngle={Math.PI / 2.15}
              target={[0, 1.2, -2]}
            />
          )}
        </Suspense>
      </Canvas>
      {eleves.length === 0 && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-background/85 px-3 py-1 text-xs text-muted-foreground shadow">
          Aucun élève présent pour l'instant.
        </div>
      )}
    </div>
  );
}
