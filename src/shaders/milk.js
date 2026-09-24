import * as THREE from "three";

const milkNoise = /* glsl */ `
  vec3 mod289(vec3 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x){ return mod289(((x * 34.0) + 1.0) * x); }

  // 2D simplex noise (Ashima Arts)
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m; m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x  = a0.x  * x0.x   + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float fbm(vec2 p){
    float f = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      f += a * snoise(p);
      p *= 2.02;
      a *= 0.5;
    }
    return f;
  }

  // Slowly rotating, domain-warped field -> creamy ribbons
  float milkField(vec2 uv, float t){
    vec2 p = (uv - 0.5) * uScale;

    // swirl: stronger twist near the center
    float r = length(p);
    float ang = t * 0.12 + uSwirl / (1.0 + r * r);
    float s = sin(ang), c = cos(ang);
    p = mat2(c, -s, s, c) * p;

    vec2 q = vec2(fbm(p + vec2(0.0, t * 0.10)),
                  fbm(p + vec2(5.2, 1.3) - t * 0.08));
    vec2 w = vec2(fbm(p + 2.5 * q + vec2(1.7, 9.2) + t * 0.12),
                  fbm(p + 2.5 * q + vec2(8.3, 2.8) - t * 0.10));
    return fbm(p + 2.0 * w);
  }
`;


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

export const milkFragment = `
uniform float uTime;
  uniform float uScale;
  uniform float uSwirl;
  uniform float uBump;

  varying vec2 vUv;
  varying vec3 vViewPos;
  varying vec3 vT;
  varying vec3 vB;
  varying vec3 vN;

  ${milkNoise}

  void main() {
    // Radial distance: 0 at center, 1 at the edge of the disc
    float d = length(vUv - 0.5) * 2.0;
    if (d > 1.0) discard; // lets you use a PlaneGeometry too

    float t = uTime;

    // --- Height + normal via finite differences --------------------------
    float e  = 0.0025;
    float h  = milkField(vUv, t);
    float hx = milkField(vUv + vec2(e, 0.0), t);
    float hy = milkField(vUv + vec2(0.0, e), t);

    // Flatten the bumps toward the rim (liquid settles at the wall)
    float bump = uBump * (1.0 - smoothstep(0.75, 1.0, d));
    vec3 nLocal = normalize(vec3(-(hx - h) / e * bump * 0.02,
                                 -(hy - h) / e * bump * 0.02,
                                 1.0));
    vec3 N = normalize(vT * nLocal.x + vB * nLocal.y + vN * nLocal.z);
    vec3 V = normalize(-vViewPos);

    // Light in view space (upper-left, toward camera) -> stable highlights
    vec3 L = normalize(vec3(-0.35, 0.75, 0.55));
    vec3 H = normalize(L + V);

    // --- Albedo: soft grey milk + bright cream ribbons --------------------
    float cream = smoothstep(0.02, 0.32, h);
    vec3 milk      = vec3(1.0, 1.0, 1.0);
    vec3 creamCol  = vec3(1.00, 1.0, 1.0);
    vec3 albedo    = mix(milk, creamCol, cream);

    // --- Lighting ---------------------------------------------------------
    float ndl  = dot(N, L);
    float diff = ndl * 0.5 + 0.5;          // wrapped diffuse (fake SSS)
    diff = diff * diff;

    float ndh  = max(dot(N, H), 0.0);
    float specSharp = pow(ndh, 90.0) * 0.55;
    float specSoft  = pow(ndh, 14.0) * 0.18;
    float spec = (specSharp + specSoft) * (0.4 + 0.6 * cream);

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