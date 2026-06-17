import React from "react";
import { APP_BUILD_ID } from "../constants/build";
import { STORAGE_KEYS } from "../constants/limits";
import { readJson } from "../utils/storage";

type AppErrorBoundaryProps = {
  children: React.ReactNode;
};

type AppErrorBoundaryState = {
  error: Error | null;
};

function crashUserHint(): string {
  try {
    const user = readJson<{ email?: string; phone?: string }>(STORAGE_KEYS.userProfile, {});
    return user.email || user.phone || "";
  } catch {
    return "";
  }
}

export class AppErrorBoundary extends React.Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    const payload = {
      build: APP_BUILD_ID,
      route: `${window.location.pathname}${window.location.search}`,
      user: crashUserHint(),
      name: error.name,
      message: error.message,
      stack: info.componentStack
    };

    if (import.meta.env.DEV) {
      console.error("[bamsignal] app crash", payload);
    }

    try {
      sessionStorage.setItem("bamsignal:last-crash", JSON.stringify(payload));
    } catch {
      /* ignore */
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
