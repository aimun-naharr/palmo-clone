import { useEffect, useMemo, useRef } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import { Center } from "@react-three/drei";
import * as THREE from "three";
import GUI from "lil-gui";
import { useFrame } from "@react-three/fiber";
import {
  getMilkDisc,
  getMilkDiscUv,
  milkFragment,
  milkVertex,
} from "../../../shaders/milk";
import { createMilkSimulation } from "../../../shaders/buffers/milkSimulation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const getProgress = (start, end, progress) => {
  return THREE.MathUtils.clamp(
    (progress - start / 100) / ((end - start) / 100),
    0,
    1,
  );
};

export default function Model({ progress, props }) {
  const { nodes, materials } = useGLTF("/coconut.glb");
  const { scene: canScene } = useGLTF("/can1.glb");
  const topRef = useRef(null);
  const bottomRef = useRef(null);
  const milk = useRef(null);
  const modelRef = useRef(null);
  const milkMaterial = useRef(null);
  const canNodeRef = useRef(null);
  const shakeRef = useRef(null);
  const canTexture = useTexture("/coconutWhite.webp");
  // Scroll drives the intensity; useFrame turns it into a live tremble
  // so the coconut keeps shaking even when the user pauses scrolling.
  const shake = useRef({ intensity: 0, smoothed: 0 });
  const shakeAxes = useMemo(
    () => ({ right: new THREE.Vector3(), up: new THREE.Vector3() }),
    [],
  );
  const tl = useRef(null);

  // Offscreen Shadertoy buffers (ripples -> fluid -> turbulence)
  const milkSim = useMemo(() => createMilkSimulation(512), []);
  useEffect(() => () => milkSim.dispose(), [milkSim]);

  const milkDisc = useMemo(
    () => getMilkDisc(nodes.milk.geometry),
    [nodes.milk.geometry],
  );
  const uniforms = useMemo(
    () => ({
      ...milkDisc,
      uFluid: { value: milkSim.texture },
      uBump: { value: 8.0 }, // strength of the ripple relief
    }),
    [milkDisc, milkSim],
  );

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
    topPositionX: 0,
    topPositionY: 0,
    topPositionZ: 0,
    bottomPositionX: 0,
    bottomPositionY: 0,
    bottomPositionZ: 0,
    milkRotationX: 0,
    milkRotationY: 0,
    milkRotationZ: 0,
    milkPositionX: 0,
    milkPositionY: 0,
    milkPositionZ: 0,
  });

  useGSAP(() => {
    const model = modelRef.current,
      top = topRef.current,
      bottom = bottomRef.current;
    if (!model || !top || !bottom) return;

    model.rotation.set(-2.36, -0.97, -0.363); // start pose

    tl.current = gsap
      .timeline({ paused: true, defaults: { ease: "none" } })

      // 3 → 20: model turn
      .to(
        model.rotation,
        { x: -1.8, y: -1.35, duration: 17, ease: "sine.inOut" },
        3,
      )

      // 20 → 40: top opens, bottom grows & flips
      .to(top.rotation, { x: Math.PI * 2, duration: 20 }, 20)
      .to(top.position, { x: 0.7, duration: 20 }, 20)
      .to(bottom.rotation, { x: Math.PI, y: -0.053, duration: 20 }, 20)
      .to(bottom.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 20 }, 20)

      // 30 → 50: top drifts up
      .to(top.position, { y: 0.083, duration: 20 }, 30)

      // 60 → 70: close — everything returns to rest
      // ONE tween per target object so GSAP doesn't overwrite
      // 60 → 70: close & tilt into final pose
      .to(model.rotation, { x: -3.0, y: -0.45, z: -0.25, duration: 10 }, 60)
      .to(model.scale, { x: 20, y: 20, z: 20, duration: 10 }, 60)

      .to(bottom.rotation, { x: 0, y: 0, z: 0, duration: 10 }, 60)
      .to(bottom.scale, { x: 1, y: 1, z: 1, duration: 10 }, 60)
      .to(top.rotation, { x: 0, y: 0, z: 0, duration: 10 }, 60)
      .to(top.position, { x: 0, y: 0, z: 0, duration: 10 }, 60)
      // 70 → 77: settle into the horizontal pose (seam level, split axis
      // pointing straight up on screen), then hold still until 78

      // 78 → 84: horizontal shake builds up (starts barely noticeable)
      .to(shake.current, { intensity: 1, duration: 6, ease: "power2.in" }, 78)

      // 84 → 87: shake settles before the split
      .to(shake.current, { intensity: 0, duration: 3, ease: "power2.out" }, 84)
      .to(
        model.rotation,
        { x: -2.641, y: 0.511, z: -0.779, duration: 8, ease: "sine.inOut" },
        87,
      )
      // 87 → 95: halves tear apart vertically (top up, bottom down)
      .to(top.position, { x: 0.13, duration: 8, ease: "expo.out" }, 87)
      .to(bottom.position, { x: -0.13, duration: 8, ease: "expo.out" }, 87)
      .to(top.rotation, { z: -0.3, duration: 8, ease: "power3.out" }, 87)
      .to(bottom.rotation, { z: 0.3, duration: 8, ease: "power3.out" }, 87)

      // 87 → 99: upright can grows out of the gap and spins into view
      .fromTo(
        canNodeRef.current.scale,
        { x: 0.0001, y: 0.0001, z: 0.0001 },
        { x: 0.05, y: 0.05, z: 0.05, duration: 10, ease: "back.out(1.6)" },
        87,
      )
      .fromTo(
        canScene.rotation,
        { y: -Math.PI / 2, z: 0 },
        { y: 0, z: Math.PI / 2, duration: 12, ease: "power3.out" },
        87,
      )

      // 92 → 100: halves keep drifting away and shrink to nothing
      .to(top.position, { x: 0.2, duration: 8, ease: "power1.in" }, 92)
      .to(bottom.position, { x: -0.2, duration: 8, ease: "power1.in" }, 92)
      .to(
        top.scale,
        { x: 0.0001, y: 0.0001, z: 0.0001, duration: 8, ease: "back.in(1.4)" },
        92,
      )
      .to(
        bottom.scale,
        { x: 0.0001, y: 0.0001, z: 0.0001, duration: 8, ease: "back.in(1.4)" },
        92,
      );
  }, []);

  // Scrub with progress (0..1)
  useGSAP(() => {
    if (!tl.current || settings.current.manual) return;
    gsap.to(tl.current, {
      time: progress * 100,
      duration: 0.5,
      ease: "power2.out",
      overwrite: true,
    });
  }, [progress]);
  useFrame((state, delta) => {
    // Horizontal shake in screen space: slide along the camera's right axis
    // and twist left/right around its up axis, so nothing moves vertically.
    // Amplitude eases toward the scroll-driven intensity so scrubbing never jumps.
    const sh = shake.current;
    sh.smoothed = THREE.MathUtils.damp(sh.smoothed, sh.intensity, 8, delta);
    if (shakeRef.current) {
      const t = state.clock.elapsedTime;
      const a = sh.smoothed;
      const f = 1 + a * 0.6; // a little faster as it intensifies
      const { right, up } = shakeAxes;
      right.set(1, 0, 0).applyQuaternion(state.camera.quaternion);
      up.set(0, 1, 0).applyQuaternion(state.camera.quaternion);
      const wave = Math.sin(t * 22 * f) + 0.3 * Math.sin(t * 37 * f + 1.3);
      shakeRef.current.position.copy(right).multiplyScalar(a * 0.18 * wave);
      shakeRef.current.quaternion.setFromAxisAngle(up, a * 0.12 * wave);
    }

    milkSim.update(state.gl, state.clock.elapsedTime, delta);
    // The fluid buffer ping-pongs, so rebind the freshly written one
    if (milkMaterial.current)
      milkMaterial.current.uniforms.uFluid.value = milkSim.texture;
  });

  const onMilkPointer = (e) => {
    const local = milk.current.worldToLocal(e.point.clone());
    milkSim.setPointer(getMilkDiscUv(milkDisc, local));
  };
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
    s.topPositionX = topRef.current.position.x;
    s.topPositionY = topRef.current.position.y;
    s.topPositionZ = topRef.current.position.z;
    s.bottomPositionX = bottomRef.current.position.x;
    s.bottomPositionY = bottomRef.current.position.y;
    s.bottomPositionZ = bottomRef.current.position.z;
    s.milkRotationX = milk.current.rotation.x;
    s.milkRotationY = milk.current.rotation.y;
    s.milkRotationZ = milk.current.rotation.z;
    s.milkPositionX = milk.current.position.x;
    s.milkPositionY = milk.current.position.y;
    s.milkPositionZ = milk.current.position.z;

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

    const applyTopPosition = () => {
      topRef.current.position.set(
        s.topPositionX,
        s.topPositionY,
        s.topPositionZ,
      );
    };

    const applyBottomPosition = () => {
      bottomRef.current.position.set(
        s.bottomPositionX,
        s.bottomPositionY,
        s.bottomPositionZ,
      );
    };

    const applyMilkRotation = () => {
      milk.current.rotation.set(
        s.milkRotationX,
        s.milkRotationY,
        s.milkRotationZ,
      );
    };

    const applyMilkPosition = () => {
      milk.current.position.set(
        s.milkPositionX,
        s.milkPositionY,
        s.milkPositionZ,
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

    // Top/bottom sit inside the 25x-scaled group, so small values move them a lot.
    const addPartPositionFolder = (label, prefix, apply) => {
      const folder = gui.addFolder(label);
      ["X", "Y", "Z"].forEach((axis) => {
        folder
          .add(s, `${prefix}${axis}`, -2, 2, 0.001)
          .name(axis.toLowerCase())
          .listen()
          .onChange(apply);
      });
    };

    addPartPositionFolder("Position Top", "topPosition", applyTopPosition);
    addPartPositionFolder(
      "Position Bottom",
      "bottomPosition",
      applyBottomPosition,
    );

    addRotationFolder("Rotation Milk", "milkRotation", applyMilkRotation);

    // Milk sits inside the 25x-scaled group, so small values move it a lot.
    const milkPosition = gui.addFolder("Position Milk");
    ["milkPositionX", "milkPositionY", "milkPositionZ"].forEach((key) => {
      milkPosition
        .add(s, key, -0.5, 0.5, 0.001)
        .name(key.slice(-1).toLowerCase())
        .listen()
        .onChange(applyMilkPosition);
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
              `topPosition={[${s.topPositionX.toFixed(3)}, ${s.topPositionY.toFixed(3)}, ${s.topPositionZ.toFixed(3)}]}`,
              `bottomPosition={[${s.bottomPositionX.toFixed(3)}, ${s.bottomPositionY.toFixed(3)}, ${s.bottomPositionZ.toFixed(3)}]}`,
              `milkRotation={[${s.milkRotationX.toFixed(3)}, ${s.milkRotationY.toFixed(3)}, ${s.milkRotationZ.toFixed(3)}]}`,
              `milkPosition={[${s.milkPositionX.toFixed(3)}, ${s.milkPositionY.toFixed(3)}, ${s.milkPositionZ.toFixed(3)}]}`,
            ),
        },
        "log",
      )
      .name("log values");

    return () => gui.destroy();
  }, []);

  //scroll rotation=[-2.36, -1.44, -0.97]
  //scroll rotation=[-1.59, -1.44,-0.363]

  //milk positionx=0.065
  const canModel = useMemo(() => {
    const clonedScene = canScene.clone();

    clonedScene.traverse((child) => {
      console.log("child", child);
      if (child.isMesh && child.name === "Shell") {
        child.material = new THREE.MeshStandardMaterial({
          map: canTexture,
        });
      }
    });

    return clonedScene;
  }, [canScene, canTexture]);
  return (
    <group ref={shakeRef}>
      <Center>
        <group
          rotation={[-2.36, -0.97, -0.363]}
          position={[-4.71, -3.11, 4.75]}
          scale={[24, 24, 24]}
          {...props}
          ref={modelRef}
          dispose={null}
        >
          {/* can — on the seam, upright along the split axis (local X = screen up) */}
          <group
            position={[-0.046, -0.002, -0.001]}
            rotation={[0, 0, -Math.PI / 2]}
            scale={0.0001}
            ref={canNodeRef}
          >
            <primitive object={canModel} />
          </group>
          <group ref={bottomRef}>
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
              ref={milk}
              castShadow
              receiveShadow
              geometry={nodes.milk.geometry}
              // material={nodes.milk.material}
              onPointerMove={onMilkPointer}
              position={[-0.016, 0, 0]}
              onPointerOut={() => milkSim.setPointer(null)}
            >
              {/* <circleGeometry args={[0.081, 96]} /> */}
              <shaderMaterial
                vertexShader={milkVertex}
                fragmentShader={milkFragment}
                side={THREE.DoubleSide}
                ref={milkMaterial}
                uniforms={uniforms}
              />
            </mesh>
          </group>
          <group ref={topRef}>
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
    </group>
  );
}

useGLTF.preload("/coconut.glb");
