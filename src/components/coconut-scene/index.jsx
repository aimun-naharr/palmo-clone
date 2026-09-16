import { Canvas, useFrame } from "@react-three/fiber";
import Coconut from "./model/Coconut";
import CameraController from "./CameraController";
import {
  Environment,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from 'three'

const CoconutScene = ({ progress }) => {
  const cameraRef = useRef(null);

  useFrame(() => {
    if (cameraRef.current) {
      // console.log("Camera Position:", cameraRef.current.position);
      // cameraRef.current.lookAt(0, 0, 0);
    }
  });


const moveCameraHorizontal = () => {
  if (!cameraRef.current) return;

  // Start animation at 20%
  const startProgress = 0.07;

  // Convert 20% → 100% into 0 → 1
  const t = THREE.MathUtils.clamp(
    (progress - startProgress) / (1 - startProgress),
    0,
    1
  );

  const startX = -2.9;
  const endX = 1;

  const x = THREE.MathUtils.lerp(startX, endX, t);

  cameraRef.current.position.x = x;

  cameraRef.current.lookAt(0, 0, 0);
};

  useEffect(() => {
    moveCameraHorizontal()
    // rotateCameraX();
  }, [progress]);

  return (
    <>
      <PerspectiveCamera
        ref={cameraRef}
        fov={45}
        near={0.1}
        far={1000}
        makeDefault
        position={[-2.9, 8.3, -3.4]}
      />
      <ambientLight intensity={1} />
      <Environment preset="night" />
      <directionalLight position={[-15, 5, 5]} intensity={3} />
      {/* <axesHelper args={[500]} /> */}
      <Coconut />
      {/* <OrbitControls /> */}
      {/* <CameraController /> */}
    </>
  );
};

export default CoconutScene;
