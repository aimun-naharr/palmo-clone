import * as THREE from "three";
import { buffer1 } from "./buffer1";
import { buffer2 } from "./buffer2";
import { buffer3 } from "./buffer3";

// Runs the Shadertoy buffers offscreen every frame. Channel wiring
// (Shadertoy renders A -> B -> C, so A sees last frame's C):
//   A  ripples + normals   iChannel0 = C
//   B  fluid (feedback)    iChannel0 = A, iChannel1 = B (prev), iChannel3 = C
//   C  turbulence          iChannel0 = B
// B's output texture is the normal map the milk material samples.

const header = /* glsl */ `
  uniform vec3 iResolution;
  uniform float iTime;
  uniform float iTimeDelta;
  uniform int iFrame;
  uniform vec4 iMouse;
  uniform float iReset;
  uniform sampler2D iChannel0;
  uniform sampler2D iChannel1;
  uniform sampler2D iChannel2;
  uniform sampler2D iChannel3;
`;

const footer = /* glsl */ `
  void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
  }
`;

const quadVertex = /* glsl */ `
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const createMilkSimulation = (size = 512) => {
  const makeTarget = () =>
    new THREE.WebGLRenderTarget(size, size, {
      type: THREE.HalfFloatType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      depthBuffer: false,
    });

  // Shared across passes so time/mouse only need setting once
  const shared = {
    iResolution: { value: new THREE.Vector3(size, size, 1) },
    iTime: { value: 0 },
    iTimeDelta: { value: 0 },
    iFrame: { value: 0 },
    iMouse: { value: new THREE.Vector4() },
    iReset: { value: 0 },
  };

  const makePass = (body) =>
    new THREE.ShaderMaterial({
      vertexShader: quadVertex,
      fragmentShader: header + body + footer,
      uniforms: {
        ...shared,
        iChannel0: { value: null },
        iChannel1: { value: null },
        iChannel2: { value: null },
        iChannel3: { value: null },
      },
      depthTest: false,
      depthWrite: false,
    });

  const passA = makePass(buffer1);
  const passB = makePass(buffer2);
  const passC = makePass(buffer3);

  const targetA = makeTarget();
  const targetC = makeTarget();
  let readB = makeTarget();
  let writeB = makeTarget();

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), passA);
  quad.frustumCulled = false;
  scene.add(quad);

  const render = (renderer, material, target) => {
    quad.material = material;
    renderer.setRenderTarget(target);
    renderer.render(scene, camera);
  };

  return {
    get texture() {
      return readB.texture;
    },

    // uv in 0..1 disc space, or null when the pointer leaves
    setPointer(uv) {
      if (uv) shared.iMouse.value.set(uv.x * size, uv.y * size, 1, 0);
      else shared.iMouse.value.z = 0;
    },

    reset() {
      shared.iReset.value = 1;
    },

    update(renderer, time, delta) {
      shared.iTime.value = time;
      // Clamp so a backgrounded tab doesn't fling the fluid on return
      shared.iTimeDelta.value = Math.min(delta, 1 / 30);

      const prevTarget = renderer.getRenderTarget();

      passA.uniforms.iChannel0.value = targetC.texture;
      render(renderer, passA, targetA);

      passB.uniforms.iChannel0.value = targetA.texture;
      passB.uniforms.iChannel1.value = readB.texture;
      passB.uniforms.iChannel3.value = targetC.texture;
      render(renderer, passB, writeB);
      [readB, writeB] = [writeB, readB];

      passC.uniforms.iChannel0.value = readB.texture;
      render(renderer, passC, targetC);

      renderer.setRenderTarget(prevTarget);

      shared.iFrame.value++;
      shared.iReset.value = 0;
    },

    dispose() {
      [targetA, targetC, readB, writeB].forEach((t) => t.dispose());
      [passA, passB, passC].forEach((m) => m.dispose());
      quad.geometry.dispose();
    },
  };
};
