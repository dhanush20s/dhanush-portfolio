export const particleVert = /* glsl */ `
uniform sampler2D uPos;
uniform sampler2D uVel;
uniform float uSize;
uniform float uTime;
uniform float uIntro;
uniform float uPixelRatio;

attribute vec2  aRef;   // where this particle lives in the sim texture
attribute float aSeed;

varying float vSpeed;
varying float vSeed;
varying float vDepth;

void main() {
  vec4 p = texture2D(uPos, aRef);
  vec4 v = texture2D(uVel, aRef);

  vSpeed = v.w;
  vSeed  = aSeed;

  vec4 mv = modelViewMatrix * vec4(p.xyz, 1.0);
  vDepth  = -mv.z;
  gl_Position = projectionMatrix * mv;

  // Slow per-particle twinkle so the field never looks static.
  float twinkle = 0.65 + 0.35 * sin(uTime * 1.7 + aSeed * 43.0);

  // Size variance matters more than it looks: uniform points read as noise,
  // whereas a minority of noticeably larger ones give the field a star-field
  // hierarchy the eye can parse.
  float grade = mix(0.7, 2.3, pow(aSeed, 3.0));

  // Perspective-correct sizing, clamped so nothing becomes a screen-filling
  // blob when a particle drifts right up to the near plane.
  float size = uSize * grade * twinkle * uPixelRatio * (26.0 / max(vDepth, 0.35));
  gl_PointSize = clamp(size * uIntro, 0.0, 42.0);
}
`

export const particleFrag = /* glsl */ `
uniform float uOpacity;
uniform vec3  uPalA;
uniform vec3  uPalB;
uniform vec3  uPalC;
uniform vec3  uPalD;

varying float vSpeed;
varying float vSeed;
varying float vDepth;

/** Iñigo Quílez cosine palette — cheap, and it stays iridescent at any t. */
vec3 palette(float t) {
  return uPalA + uPalB * cos(6.28318530718 * (uPalC * t + uPalD));
}

void main() {
  vec2  c = gl_PointCoord - 0.5;
  float d = dot(c, c);              // squared distance, avoids a sqrt
  if (d > 0.25) discard;

  // Soft round sprite with a hot centre. Written as 1 - smoothstep rather than
  // reversed edges, which is undefined in GLSL.
  float alpha = 1.0 - smoothstep(0.0, 0.25, d);
  alpha *= alpha;

  float t = fract(vSeed * 0.55 + vSpeed * 6.0 + 0.12);
  vec3  col = palette(t);

  // Fast movers glow hotter — reads as energy during a morph.
  col += vec3(vSpeed * 1.3);

  // Depth fog pulls the far side of the cloud down into the background, and
  // also kills anything that drifts too close to the near plane (those become
  // screen-filling blobs once bloom gets hold of them).
  // Range is tuned to the camera sitting ~16 units out from a ~5-unit cloud:
  // depth runs roughly 10–22, so the falloff has to start well beyond that or
  // the whole far hemisphere goes black.
  float fog  = 1.0 - smoothstep(9.0, 36.0, vDepth);
  fog       *= smoothstep(2.0, 5.5, vDepth);

  gl_FragColor = vec4(col, alpha * uOpacity * fog);
}
`
