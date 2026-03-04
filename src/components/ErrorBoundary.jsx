import { Component } from 'react';

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Arial, sans-serif',
    background: '#FAF7F0',
    padding: '2rem',
  },
  content: {
    textAlign: 'center',
    maxWidth: '500px',
  },
  heading: {
    fontSize: '1.5rem',
    color: '#3A2A1D',
    marginBottom: '0.5rem',
  },
  message: {
    color: '#6B4C3B',
    marginBottom: '1.5rem',
  },
  errorDetail: {
    color: '#999',
    fontSize: '12px',
    fontFamily: 'monospace',
    marginBottom: '1.5rem',
  },
  reloadButton: {
    padding: '12px 32px',
    background: '#3A2A1D',
    color: '#F5F0E8',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
  },
};

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  renderFallback() {
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <h1 style={styles.heading}>
            Что-то пошло не так
          </h1>
          <p style={styles.message}>
            Пожалуйста, перезагрузите страницу.
          </p>
          <p style={styles.errorDetail}>
            {this.state.error?.message}
          </p>
          <button onClick={this.handleReload} style={styles.reloadButton}>
            Перезагрузить
          </button>
        </div>
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      return this.renderFallback();
    }

    return this.props.children;
  }
}
