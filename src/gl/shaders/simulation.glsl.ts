import { noiseGLSL } from './noise.glsl'

/**
 * Velocity pass.
 *
 * Every particle is a spring pulled toward its slot in the current shape, with
 * a curl-noise field layered on top so the cloud keeps breathing even once it
 * has settled. Pointer repulsion and the click shockwave are impulses added to
 * the same accumulator.
 *
 * GPUComputationRenderer injects `resolution`, `texturePosition` and
 * `textureVelocity` for us.
 */
export const velocityFrag = /* glsl */ `
${noiseGLSL}

uniform float uTime;
uniform float uMorph;      // 0..1 blend between the two active shapes
uniform float uAgitation;  // scroll velocity -> how wild the curl field gets
uniform float uBurst;      // click shockwave, decays in JS
uniform float uIntro;      // 0..1 during the reveal
uniform float uSnap;       // debug: teleport straight onto the target
uniform float uStep;       // frame delta normalised to 60fps, clamped in JS
uniform vec3  uPointer;    // pointer projected onto the particle plane
uniform sampler2D uTargetA;
uniform sampler2D uTargetB;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;

  vec4 posSeed = texture2D(texturePosition, uv);
  vec4 vel     = texture2D(textureVelocity, uv);

  vec3  pos  = posSeed.xyz;
  float seed = posSeed.w;

  vec3 target = mix(
    texture2D(uTargetA, uv).xyz,
    texture2D(uTargetB, uv).xyz,
    uMorph
  );

  // Debug hatch: emit the exact displacement to the target so the position pass
  // lands on it in one step. Lets a readback distinguish "target is wrong" from
  // "the solver isn't getting there".
  if (uSnap > 1.5) {
    // Emit the sampled target verbatim so a velocity-buffer readback shows
    // exactly what the GPU thinks the target texture contains.
    gl_FragColor = vec4(target, 1.0);
    return;
  }
  if (uSnap > 0.5) {
    gl_FragColor = vec4(target - pos, 0.0);
    return;
  }

  // Per-particle stiffness gives the morph a bit of grain instead of every
  // point arriving on the same frame. Stiff enough that a shape is legible
  // within about a second — softer than this and the cloud reads as fog.
  float stiffness = 0.055 + seed * 0.030;
  vec3 accel = (target - pos) * stiffness * mix(0.35, 1.0, uIntro);

  // Divergence-free turbulence, scaled by seed so the cloud has texture.
  //
  // Normalised deliberately. Raw curl of a simplex potential swings to a
  // magnitude of ~8 (the finite-difference gradient divides by 2*eps), which
  // put the turbulent force on par with the spring and left every particle
  // orbiting a unit or two off its target — the silhouette dissolved into
  // uniform dust. Taking only the direction makes the amplitude below mean
  // exactly what it says in world units.
  vec3 curlRaw = curlNoise(pos * 0.20 + vec3(0.0, 0.0, uTime * 0.055) + seed * 5.0);
  vec3 curl = curlRaw / (length(curlRaw) + 1e-4);
  accel += curl * (0.0005 + uAgitation * 0.0038) * (0.35 + seed);

  // Pointer pushes particles away.
  //
  // Note the falloffs are written as 1 - smoothstep(near, far, d), not
  // smoothstep(far, near, d). GLSL leaves smoothstep undefined when edge0 >
  // edge1, and at least one driver here returns a non-zero value for distant
  // particles — which applied a permanent outward shove to the entire cloud.
  vec3  d    = pos - uPointer;
  float dist = length(d) + 1e-4;
  vec3  dir  = d / dist;
  accel += dir * (1.0 - smoothstep(0.0, 3.4, dist)) * 0.085;

  // Click shockwave — much wider radius, short lived.
  accel += dir * uBurst * (1.0 - smoothstep(0.0, 7.0, dist)) * 0.30;

  // Frame-rate independence: without this the cloud converges at half speed on
  // a 30Hz display and twice as fast on 120Hz. Damping is exponential, so it
  // scales as a power rather than a product.
  vel.xyz = (vel.xyz + accel * uStep) * pow(0.855, uStep);
  vel.w   = length(vel.xyz);             // stash speed for the render pass

  gl_FragColor = vel;
}
`

/** Position pass — plain integration. `w` carries the per-particle seed. */
export const positionFrag = /* glsl */ `
uniform float uStep;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 pos = texture2D(texturePosition, uv);
  vec4 vel = texture2D(textureVelocity, uv);
  pos.xyz += vel.xyz * uStep;
  gl_FragColor = pos;
}
`
