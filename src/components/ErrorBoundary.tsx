import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<any, any> {
  state = {
    hasError: false,
    error: null as Error | null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong. Please try again later.";
      
      try {
        const parsed = JSON.parse(this.state.error?.message || "");
        if (parsed.error && parsed.operationType) {
          errorMessage = `A database error occurred during ${parsed.operationType} at ${parsed.path}.`;
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-cream p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-wood/20 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-serif font-bold mb-4">Oops!</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              {errorMessage}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-sage text-gray-900 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-opacity-80 transition-all"
            >
              <RefreshCcw className="w-4 h-4" /> Reload Application
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
