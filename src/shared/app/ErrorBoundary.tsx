import { Component, type ReactNode } from 'react'

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  override render() {
    if (this.state.hasError) {
      return (
        <main style={{ padding: 24, fontFamily: 'var(--font-serif)' }}>
          <h1>Contenido no disponible</h1>
          <p>Ocurrió un error al cargar el contenido. Recargá la app.</p>
        </main>
      )
    }
    return this.props.children
  }
}
