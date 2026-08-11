import { noiseGLSL } from './noise.glsl'

export const backdropVert = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  // Fullscreen triangle-ish quad: skip the matrices entirely so the plane
  // always covers the viewport regardless of camera movement.
  gl_Position = vec4(position.xy, 0.999, 1.0);
}
`

export const backdropFrag = /* glsl */ `
${noiseGLSL}

uniform float uTime;
uniform float uStage;      // fractional section index, drives the hue drift
uniform float uIntro;
uniform float uAurora;     // overall backdrop brightness
uniform vec2  uResolution;
uniform vec2  uPointer;

varying vec2 vUv;

/** Hash for the film grain. Deliberately ugly and fast. */
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec2 uv = vUv;
  vec2 p  = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);

  // Two slow fbm layers moving at different rates: the aurora.
  float n1 = fbm(vec3(p * 1.35, uTime * 0.035));
  float n2 = fbm(vec3(p * 2.60 + 4.7, uTime * 0.055 + 2.0));
  float aurora = smoothstep(-0.15, 0.85, n1 * 0.7 + n2 * 0.45);

  // Hue drifts as you scroll — each section gets its own temperature.
  float hue = uStage * 0.22 + n2 * 0.10 + uTime * 0.006;
  vec3 cool = vec3(0.05, 0.30, 0.42);
  vec3 warm = vec3(0.38, 0.08, 0.30);
  vec3 tint = mix(cool, warm, 0.5 + 0.5 * sin(hue * 6.28318));

  vec3 col = vec3(0.010, 0.011, 0.024);          // near-black base
  col += tint * aurora * uAurora;

  // A soft glow that trails the cursor, as if the cloud is lit from there.
  float glow = 1.0 - smoothstep(0.0, 0.85, length(p - uPointer * vec2(0.9, 0.5)));
  col += tint * glow * uAurora * 0.45;

  // Vignette.
  col *= 1.0 - 0.72 * pow(length(uv - 0.5) * 1.32, 2.4);

  // Film grain, animated. Keeps flat gradients from banding on cheap panels.
  float grain = hash21(gl_FragCoord.xy + fract(uTime) * 431.0);
  col += (grain - 0.5) * 0.016;

  gl_FragColor = vec4(col * uIntro, 1.0);
}
`
