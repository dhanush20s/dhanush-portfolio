/**
 * True when the browser can create a WebGL context. Checked once up front so
 * the page can fall back to a static background instead of mounting a canvas
 * that would throw (old devices, blocked GPU, locked-down browsers).
 */
export function webglSupported(): boolean {
  if (typeof document === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    const gl = (canvas.getContext('webgl2') ||
      canvas.getContext('webgl')) as WebGLRenderingContext | null
    if (!gl) return false
    // Give the context back straight away; browsers cap live contexts.
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}
