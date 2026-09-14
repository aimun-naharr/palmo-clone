import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Coconut from './model/Coconut';

const CoconutScene = () => {
    return (
        
   <Canvas camera={{ position: [0, 1, 5], fov: 45 }}>
        <ambientLight intensity={2} />

        <directionalLight
          position={[5, 5, 5]}
          intensity={3}
        />

        <Coconut />

        <OrbitControls />
      </Canvas>
        
    );
};

export default CoconutScene;