import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends (Component as any) {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: any) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    try {
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div 
          id="error-boundary-screen"
          className="min-h-screen w-full flex items-center justify-center bg-[#0a0e17] text-slate-100 p-6 select-none"
        >
          <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-6">
              <ShieldAlert size={32} />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              The application encountered a temporary display issue. You can quickly reload the page or return to the main dashboard.
            </p>

            {this.state.error && (
              <div className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 mb-6 text-left overflow-x-auto max-h-32">
                <p className="text-xs font-mono text-rose-300 break-words">
                  {this.state.error.message || 'Unknown runtime error'}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                id="error-boundary-reload-btn"
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[#0052ff] hover:bg-[#0045d8] text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[#0052ff]/20 active:scale-95"
              >
                <RefreshCw size={16} />
                Reload Page
              </button>
              <button
                id="error-boundary-home-btn"
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-semibold transition-all border border-slate-700 active:scale-95"
              >
                <Home size={16} />
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
