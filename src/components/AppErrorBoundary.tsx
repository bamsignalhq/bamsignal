import React from "react";

type AppErrorBoundaryProps = {
  children: React.ReactNode;
};

type AppErrorBoundaryState = {
  error: Error | null;
};

export class AppErrorBoundary extends React.Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("[bamsignal] app crash", error, info.componentStack);
    }
  }

  private reload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="app-fallback" role="alert">
        <div className="app-fallback__card card">
          <h1>Something went wrong</h1>
          <p>Tap below to reload BamSignal. Your session is saved on this device.</p>
          <button type="button" className="btn-primary btn-full" onClick={this.reload}>
            Reload
          </button>
        </div>
      </main>
    );
  }
}
