import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    // Aquí podrías enviar el error a un servicio externo
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: 24, borderRadius: 8, margin: 24 }}>
          <h2>Ocurrió un error inesperado en la aplicación.</h2>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: 12 }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}
