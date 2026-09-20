import React, { useEffect, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { Center } from "@react-three/drei";
import * as THREE from "three";

export default function Model({ progress, props }) {
  const { nodes, materials } = useGLTF("/coconut.glb");
  const topRef = useRef(null);
  const bottomRef = useRef(null);
  const milk = useRef(null);
  const modelRef = useRef(null);

  const animSequence = () => {
    if (!modelRef.current) return;

    // -------------------------
    // 10% → 30%
    // ROTATION
    // -------------------------

    const rotationProgress = THREE.MathUtils.clamp(
      (progress - 0.1) / 0.2,
      0,
      1,
    );

    modelRef.current.rotation.x = THREE.MathUtils.lerp(
      0,
      Math.PI * 0.6,
      rotationProgress,
    );

    modelRef.current.rotation.y = THREE.MathUtils.lerp(
      0,
      Math.PI * 0.3,
      rotationProgress,
    );

    // -------------------------
    // 30% → 50%
    // SPLIT
    // -------------------------

    const splitProgress = THREE.MathUtils.clamp((progress - 0.3) / 0.2, 0, 1);

    topRef.current.position.x = THREE.MathUtils.lerp(0, -0.05, splitProgress);

    bottomRef.current.position.x = THREE.MathUtils.lerp(0, 0.05, splitProgress);
  };

  useEffect(() => {
    animSequence();
  }, [progress]);

  return (
    <Center>
      <group
        //   rotation={[3, -2.9, -0.2]}
        scale={[22, 22, 22]}
        {...props}
        ref={modelRef}
        dispose={null}
      >
        <mesh
          ref={milk}
          castShadow
          receiveShadow
          geometry={nodes.milk.geometry}
          material={nodes.milk.material}
        />
        <group ref={topRef}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Roundcube001.geometry}
            material={materials["Material.002"]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Roundcube001_1.geometry}
            material={materials["dalam kelapa.001"]}
          />
        </group>
        <group ref={bottomRef}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Roundcube002.geometry}
            material={materials["Material.002"]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Roundcube002_1.geometry}
            material={materials["dalam kelapa.001"]}
          />
        </group>
      </group>
    </Center>
  );
}

useGLTF.preload("/coconut.glb");
