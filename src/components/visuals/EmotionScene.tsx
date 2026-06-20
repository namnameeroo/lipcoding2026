"use client";

import {Canvas, useFrame} from "@react-three/fiber";
import {Float} from "@react-three/drei";
import {useMemo, useRef} from "react";
import type {Group, Mesh} from "three";
import {getEmotionProfile} from "@/lib/emotions";
import type {EmotionTag} from "@/types/tasks";

type EmotionSceneProps = {
  emotionTag: EmotionTag;
  progress: number;
  completed: boolean;
};

function MainGeometry({emotionTag}: {emotionTag: EmotionTag}) {
  if (emotionTag === "burden") {
    return <dodecahedronGeometry args={[1.35, 0]} />;
  }

  if (emotionTag === "difficult") {
    return <icosahedronGeometry args={[1.32, 1]} />;
  }

  if (emotionTag === "urgent") {
    return <coneGeometry args={[1.05, 2.2, 5]} />;
  }

  if (emotionTag === "routine") {
    return <sphereGeometry args={[1.35, 32, 16]} />;
  }

  return <sphereGeometry args={[1.25, 48, 32]} />;
}

function EmotionMesh({emotionTag, progress, completed}: EmotionSceneProps) {
  const profile = getEmotionProfile(emotionTag);
  const meshRef = useRef<Mesh>(null);
  const groupRef = useRef<Group>(null);
  const color = useMemo(() => profile.colors[progress > 0.5 ? 2 : 0], [profile.colors, progress]);
  const squash = emotionTag === "routine" ? 0.55 : 1;
  const completionScale = completed ? 1.55 : 1 + progress * 0.18;

  useFrame(({clock}) => {
    const elapsed = clock.getElapsedTime();

    if (meshRef.current) {
      meshRef.current.rotation.x = elapsed * profile.speed * 0.22;
      meshRef.current.rotation.y = elapsed * profile.speed * 0.35;
      meshRef.current.scale.set(
        completionScale,
        squash * completionScale,
        completionScale,
      );
    }

    if (groupRef.current) {
      const vibration = emotionTag === "urgent" || emotionTag === "difficult" ? 0.04 : 0.015;
      groupRef.current.position.y = Math.sin(elapsed * profile.speed * 2) * vibration;
    }
  });

  return (
    <Float
      speed={profile.speed}
      rotationIntensity={0.8 + profile.noise * 0.15}
      floatIntensity={emotionTag === "routine" ? 0.1 : 0.8}
    >
      <group ref={groupRef}>
        <mesh ref={meshRef}>
          <MainGeometry emotionTag={emotionTag} />
          <meshStandardMaterial
            color={color}
            roughness={Math.max(0.12, profile.roughness - progress * 0.45)}
            metalness={0.08}
            transparent
            opacity={completed ? 0.56 : 0.82}
          />
        </mesh>

        {emotionTag === "new" ? (
          <>
            <mesh position={[0, 1.25, 0]} rotation={[0, 0, -0.42]}>
              <sphereGeometry args={[0.34, 24, 16]} />
              <meshStandardMaterial color={profile.colors[1]} roughness={0.35} />
            </mesh>
            <mesh position={[0.34, 1.48, 0]} rotation={[0, 0, 0.75]}>
              <sphereGeometry args={[0.22, 24, 16]} />
              <meshStandardMaterial color={profile.colors[2]} roughness={0.28} />
            </mesh>
          </>
        ) : null}

        {emotionTag === "urgent" ? (
          [-0.62, 0, 0.62].map((x, index) => (
            <mesh key={x} position={[x, -0.9, -0.15]} rotation={[0.25, 0, index - 1]}>
              <coneGeometry args={[0.28, 1.1, 4]} />
              <meshStandardMaterial color={profile.colors[index]} roughness={0.28} />
            </mesh>
          ))
        ) : null}
      </group>
    </Float>
  );
}

export function EmotionScene(props: EmotionSceneProps) {
  return (
    <Canvas camera={{position: [0, 0, 5], fov: 45}}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[4, 5, 5]} intensity={2.3} />
      <pointLight position={[-3, -2, 3]} intensity={1.2} />
      <EmotionMesh {...props} />
    </Canvas>
  );
}
