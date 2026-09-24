import { useEffect, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { Center } from "@react-three/drei";
import * as THREE from "three";
import GUI from "lil-gui";

const easeInOut = (t) => {
  return t * t * (3 - 2 * t);
};

const getProgress = (start, end, progress) => {
  return THREE.MathUtils.clamp(
    (progress - start / 100) / ((end - start) / 100),
    0,
    1,
  );
};

export default function Model({ progress, props }) {
  const { nodes, materials } = useGLTF("/coconut.glb");
  const topRef = useRef(null);
  const bottomRef = useRef(null);
  const milk = useRef(null);
  const modelRef = useRef(null);

  // When manual is on, the scroll-driven rotation is skipped so the
  // lil-gui sliders keep control of the model.
  const settings = useRef({
    manual: false,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    positionX: 0,
    positionY: 0,
    positionZ: 0,
    topRotationX: 0,
    topRotationY: 0,
    topRotationZ: 0,
    bottomRotationX: 0,
    bottomRotationY: 0,
    bottomRotationZ: 0,
  });

  const animSequence = () => {
    if (!modelRef.current) return;
    if (settings.current.manual) return;

    const part1Progress = getProgress(3, 24, progress);

    const part2Progress = getProgress(24, 40, progress);

    // Smooth overall progress
    const p = THREE.MathUtils.smoothstep(part1Progress, 0, 1);

    // -----------------------------
    // Y rotation
    // -----------------------------
    modelRef.current.rotation.y = THREE.MathUtils.lerp(-0.97, -1.4, p);
    modelRef.current.rotation.x = THREE.MathUtils.lerp(-2.36, -1.8, p);

    // -----------------------------
    // Z starts halfway through
    // -----------------------------

    // Keep X fixed
    modelRef.current.rotation.z = -0.363;

    // -------------------------
    // 30% → 50%
    // SPLIT
    // -------------------------

    // const splitProgress = THREE.MathUtils.clamp((progress - 0.3) / 0.2, 0, 1);

    topRef.current.position.x = THREE.MathUtils.lerp(0, -0.05, part2Progress);
    bottomRef.current.rotation.x = THREE.MathUtils.lerp(
      0,
      -2.83,
      part2Progress,
    );
    topRef.current.rotation.x = THREE.MathUtils.lerp(0, 0.9, part2Progress);

    bottomRef.current.position.x = THREE.MathUtils.lerp(0, 0.1, part2Progress);
  };

  useEffect(() => {
    animSequence();
  }, [progress]);

  // -------------------------
  // DEBUG GUI
  // -------------------------

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const s = settings.current;
    const gui = new GUI({ title: "Coconut" });

    // Seed the sliders from whatever the model currently has.
    s.rotationX = modelRef.current.rotation.x;
    s.rotationY = modelRef.current.rotation.y;
    s.rotationZ = modelRef.current.rotation.z;
    s.positionX = modelRef.current.position.x;
    s.positionY = modelRef.current.position.y;
    s.positionZ = modelRef.current.position.z;
    s.topRotationX = topRef.current.rotation.x;
    s.topRotationY = topRef.current.rotation.y;
    s.topRotationZ = topRef.current.rotation.z;
    s.bottomRotationX = bottomRef.current.rotation.x;
    s.bottomRotationY = bottomRef.current.rotation.y;
    s.bottomRotationZ = bottomRef.current.rotation.z;

    gui
      .add(s, "manual")
      .name("manual (ignore scroll)")
      .onChange(() => animSequence());

    const applyRotation = () => {
      modelRef.current.rotation.set(s.rotationX, s.rotationY, s.rotationZ);
    };

    const applyTopRotation = () => {
      topRef.current.rotation.set(
        s.topRotationX,
        s.topRotationY,
        s.topRotationZ,
      );
    };

    const applyBottomRotation = () => {
      bottomRef.current.rotation.set(
        s.bottomRotationX,
        s.bottomRotationY,
        s.bottomRotationZ,
      );
    };

    const applyPosition = () => {
      modelRef.current.position.set(s.positionX, s.positionY, s.positionZ);
    };

    const addRotationFolder = (label, prefix, apply) => {
      const folder = gui.addFolder(label);
      ["X", "Y", "Z"].forEach((axis) => {
        folder
          .add(s, `${prefix}${axis}`, -Math.PI * 2, Math.PI * 2, 0.01)
          .name(axis.toLowerCase())
          .listen()
          .onChange(apply);
      });
    };

    addRotationFolder("Rotation", "rotation", applyRotation);
    addRotationFolder("Rotation Top", "topRotation", applyTopRotation);
    addRotationFolder("Rotation Bottom", "bottomRotation", applyBottomRotation);

    const position = gui.addFolder("Position");
    ["positionX", "positionY", "positionZ"].forEach((key) => {
      position
        .add(s, key, -5, 5, 0.01)
        .name(key.slice(-1).toLowerCase())
        .listen()
        .onChange(applyPosition);
    });

    gui
      .add(
        {
          log: () =>
            console.log(
              `rotation={[${s.rotationX.toFixed(3)}, ${s.rotationY.toFixed(3)}, ${s.rotationZ.toFixed(3)}]}`,
              `position={[${s.positionX.toFixed(3)}, ${s.positionY.toFixed(3)}, ${s.positionZ.toFixed(3)}]}`,
              `topRotation={[${s.topRotationX.toFixed(3)}, ${s.topRotationY.toFixed(3)}, ${s.topRotationZ.toFixed(3)}]}`,
              `bottomRotation={[${s.bottomRotationX.toFixed(3)}, ${s.bottomRotationY.toFixed(3)}, ${s.bottomRotationZ.toFixed(3)}]}`,
            ),
        },
        "log",
      )
      .name("log values");

    return () => gui.destroy();
  }, []);

  //scroll rotation=[-2.36, -1.44, -0.97]
  //scroll rotation=[-1.59, -1.44,-0.363]

  return (
    <Center>
      <group
        rotation={[-2.36, -0.97, -0.363]}
        position={[-4.0, -3.01, 0]}
        scale={[25, 25, 25]}
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
