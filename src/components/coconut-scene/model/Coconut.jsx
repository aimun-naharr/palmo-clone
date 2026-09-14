import React from 'react';
import { useGLTF } from "@react-three/drei";

const Coconut = () => {
     const { scene } = useGLTF("/coconut.glb");
    return (
        <>
            <primitive object={scene} />
        </>
    );
};

export default Coconut;