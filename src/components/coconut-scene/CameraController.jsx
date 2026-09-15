import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

gsap.registerPlugin(ScrollTrigger);

const TARGET = new THREE.Vector3(0, 0, 0);

export default function CameraController() {
  const { camera } = useThree();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Direction from target → camera
      const direction = camera.position.clone().sub(TARGET).normalize();

      // Starting distance from target
      const startDistance = camera.position.distanceTo(TARGET);

      // How close we want to get
      const endDistance = 0.3;

      const progress = { value: 0 };

      gsap.to(progress, {
        value: 1,
        ease: "none",

        scrollTrigger: {
          trigger: ".model-section",
          start: "top top",
          end: "+=50000",
          scrub: true,
          pin: true,
        },

        onUpdate: () => {
          // Calculate current distance
          const distance =
            startDistance + (endDistance - startDistance) * progress.value;

          // Move camera along the same direction
          camera.position.copy(direction).multiplyScalar(distance).add(TARGET);

          // Always look at the OrbitControls target
          camera.lookAt(TARGET);
        },
      });
    });

    return () => ctx.revert();
  }, [camera]);

  return null;
}
