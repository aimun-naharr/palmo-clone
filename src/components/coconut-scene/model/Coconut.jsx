import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";

export default function Model(props) {
  const { nodes, materials } = useGLTF("/coconut.glb");
  return (
    <group
      //   rotation={[3, -2.9, -0.2]}
      scale={[25, 25, 25]}
      {...props}
      dispose={null}
    >
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.milk.geometry}
        material={nodes.milk.material}
      />
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
  );
}

useGLTF.preload("/coconut.glb");
