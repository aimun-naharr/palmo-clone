import { Canvas, useFrame } from "@react-three/fiber";
import Coconut from "./model/Coconut";
import CameraController from "./CameraController";
import {
  Environment,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { useEffect, useRef } from "react";

const CoconutScene = ({ progress }) => {
  console.log("progress", progress);
  const cameraRef = useRef(null);

  useFrame(() => {
    if (cameraRef.current) {
      // console.log("Camera Position:", cameraRef.current.position);
      cameraRef.current.lookAt(0, 0, 0);
    }
  });

  const rotateCamera = () => {
    //20% progress
    const rotateProg = progress * 0.2;
    const startPosition = [-2.9, 8.3, -3.4];
    const endPosition = [0, 0, 0.3];
    const newPosition = startPosition.map(
      (start, index) => start + (endPosition[index] - start) * progress,
    );
    if (cameraRef.current) {
      // cameraRef.current.position.set(...newPosition);
    }
  };

  // useEffect(() => {
  //   // rotateCamera();
  // }, []);

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
      <axesHelper args={[500]} />
      <Coconut />
      {/* <OrbitControls /> */}
      {/* <CameraController /> */}
    </>
  );
};

export default CoconutScene;
