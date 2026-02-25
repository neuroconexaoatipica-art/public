import { Component } from "react";
import type { ReactNode, ErrorInfo } from "react";
interface ErrorBoundaryProps { children: ReactNode; }
interface ErrorBoundaryState { hasError: boolean; error: Error | null; }
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error: Error): ErrorBoundaryState { return { hasError: true, error }; }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) { console.error('[NeuroConexao] Erro:', error, errorInfo); }
  handleReload = () => { this.setState({ hasError: false, error: null }); window.location.reload(); };
  render() {
    if (this.state.hasError) {
      return (<div className="min-h-screen bg-black flex items-center justify-center px-6"><div className="max-w-md w-full text-center"><div className="w-16 h-16 rounded-full bg-[#C8102E]/20 border-2 border-[#C8102E]/40 flex items-center justify-center mx-auto mb-6"><span className="text-3xl">!</span></div><h1 className="text-2xl font-semibold text-white mb-3">Algo deu errado</h1><p className="text-base text-white/70 mb-6">Um erro inesperado aconteceu. Tente recarregar.</p><button onClick={this.handleReload} className="px-8 py-3 bg-[#81D8D0] text-black rounded-xl font-bold hover:bg-[#81D8D0]/90 transition-colors">Recarregar</button></div></div>);
    }
    return this.props.children;
  }
}
