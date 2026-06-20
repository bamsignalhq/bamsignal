import React from "react";
import {
  isSafeMode,
  performAppRecovery,
  recordCrashTimestamp,
  enableSafeMode
} from "../utils/crashRecovery";
import { logAppCrash } from "../utils/crashLog";

type AppErrorBoundaryProps = {
  children: React.ReactNode;
};

type AppErrorBoundaryState = {
  error: Error | null;
  recovering: boolean;
};

export class AppErrorBoundary extends React.Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { error: null, recovering: false };

  static getDerivedStateFromError(error: Error): Partial<AppErrorBoundaryState> {
    if (isSafeMode()) {
      return { error: null, recovering: true };
    }
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logAppCrash(error, info.componentStack);

    const shouldSafeMode = recordCrashTimestamp();
    if (shouldSafeMode) {
      enableSafeMode();
      this.setState({ recovering: true, error: null });
      void performAppRecovery({ enableSafeMode: true });
    }
  }

  private reload = () => {
    void performAppRecovery();
  };

  render() {
    if (this.state.recovering) {
      return null;
    }

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
