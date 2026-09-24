import * as THREE from "three";

export const milkVertex = `
  // Disc frame in the mesh's local space (see getMilkDisc). The GLB's own
  // UVs sit in a corner of a texture atlas, so we derive a centered 0..1
  // disc UV from the position instead.
  uniform vec3 uDiscCenter;
  uniform vec3 uDiscU;
  uniform vec3 uDiscV;
  uniform float uDiscRadius;

  varying vec2 vUv;
  varying vec3 vViewPos;
  varying vec3 vT;
  varying vec3 vB;
  varying vec3 vN;

  void main() {
    vec3 rel = position - uDiscCenter;
    vUv = vec2(dot(rel, uDiscU), dot(rel, uDiscV)) / uDiscRadius * 0.5 + 0.5;

    vT = normalize(normalMatrix * uDiscU);
    vB = normalize(normalMatrix * uDiscV);
    vN = normalize(normalMatrix * cross(uDiscU, uDiscV));

    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewPos = mvPos.xyz;
    gl_Position = projectionMatrix * mvPos;
  }
`


// Finds the flat disc in a geometry: the thinnest bounding-box axis is the
// surface normal, the other two span the disc.
export const getMilkDisc = (geometry) => {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  const size = box.getSize(new THREE.Vector3()).toArray();
  const n = size.indexOf(Math.min(...size));
  const axis = (i) => new THREE.Vector3().setComponent(i, 1);

  return {
    uDiscCenter: { value: box.getCenter(new THREE.Vector3()) },
    uDiscU: { value: axis((n + 1) % 3) },
    uDiscV: { value: axis((n + 2) % 3) },
    uDiscRadius: {
      value: Math.max(size[(n + 1) % 3], size[(n + 2) % 3]) / 2,
    },
  };
};

// Same projection as milkVertex, on the CPU: local-space point -> 0..1 disc UV.
// Used to feed pointer hits into the ripple simulation.
export const getMilkDiscUv = (disc, localPoint) => {
  const rel = localPoint.clone().sub(disc.uDiscCenter.value);
  const r = disc.uDiscRadius.value;
  return new THREE.Vector2(
    rel.dot(disc.uDiscU.value) / r * 0.5 + 0.5,
    rel.dot(disc.uDiscV.value) / r * 0.5 + 0.5,
  );
};

export const milkFragment = `
  // Normal map from the Shadertoy fluid simulation (buffers/milkSimulation)
  uniform sampler2D uFluid;
  uniform float uBump;

  varying vec2 vUv;
  varying vec3 vViewPos;
  varying vec3 vT;
  varying vec3 vB;
  varying vec3 vN;

  void main() {
    // Radial distance: 0 at center, 1 at the edge of the disc
    float d = length(vUv - 0.5) * 2.0;
    if (d > 1.0) discard; // lets you use a PlaneGeometry too

    // --- Normal: same reconstruction as the Shadertoy image pass ----------
    vec4 buff = texture2D(uFluid, vUv) * 2.0 - 1.0;
    vec2 nxy = buff.xy * uBump;
    float nz = sqrt(1.0 - clamp(dot(nxy, nxy), 0.0, 1.0));
    vec3 nLocal = normalize(vec3(nxy, nz));

    // Flatten the ripples toward the rim (liquid settles at the wall)
    nLocal = normalize(mix(nLocal, vec3(0.0, 0.0, 1.0), smoothstep(0.75, 1.0, d)));

    vec3 N = normalize(vT * nLocal.x + vB * nLocal.y + vN * nLocal.z);
    vec3 V = normalize(-vViewPos);

    // Light in view space (upper-left, toward camera) -> stable highlights
    vec3 L = normalize(vec3(-0.35, 0.75, 0.55));
    vec3 H = normalize(L + V);

    vec3 albedo = vec3(1.0);

    // --- Lighting ---------------------------------------------------------
    float ndl  = dot(N, L);
    float diff = ndl * 0.5 + 0.5;          // wrapped diffuse (fake SSS)
    diff = diff * diff;

    float ndh  = max(dot(N, H), 0.0);
    float spec = pow(ndh, 90.0) * 0.55 + pow(ndh, 14.0) * 0.18;

    float ndv = max(dot(N, V), 0.0);
    float fresnel = pow(1.0 - ndv, 3.0);

    vec3 col = albedo * (0.62 + 0.42 * diff);
    col += spec;
    col += fresnel * vec3(0.10, 0.11, 0.12);

    // --- Rim: cool shadow from the shell wall + bright meniscus ring ------
    float rimShade = smoothstep(0.62, 0.97, d);
    col = mix(col, col * vec3(0.80, 0.82, 0.85), rimShade);

    float meniscus = smoothstep(0.93, 0.975, d) * (1.0 - smoothstep(0.975, 1.0, d));
    col += meniscus * 0.18;

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
  }
`
