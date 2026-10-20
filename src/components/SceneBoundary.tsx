import { Component, type ReactNode } from 'react'

type Props = { fallback: ReactNode; children: ReactNode }

/**
 * The WebGL scene is decoration. If it throws (context creation failed, a
 * shader didn't compile on this GPU) the page must keep working, so the error
 * is contained here and a static background takes over.
 */
export class SceneBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.warn('[scene] WebGL scene disabled:', error)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
