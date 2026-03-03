import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontFamily: 'Arial, sans-serif',
          background: '#FAF7F0', padding: '2rem'
        }}>
          <div style={{ textAlign: 'center', maxWidth: '500px' }}>
            <h1 style={{ fontSize: '1.5rem', color: '#3A2A1D', marginBottom: '0.5rem' }}>
              Etwas ist schiefgelaufen
            </h1>
            <p style={{ color: '#6B4C3B', marginBottom: '1.5rem' }}>
              Bitte lade die Seite neu.
            </p>
            <p style={{ color: '#999', fontSize: '12px', fontFamily: 'monospace', marginBottom: '1.5rem' }}>
              {this.state.error?.message}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 32px', background: '#3A2A1D', color: '#F5F0E8',
                border: 'none', cursor: 'pointer', fontSize: '14px',
                letterSpacing: '2px', textTransform: 'uppercase',
              }}
            >
              Seite neu laden
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
