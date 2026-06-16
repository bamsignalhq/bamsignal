import React from "react";

type AdminErrorBoundaryProps = {
  children: React.ReactNode;
};

type AdminErrorBoundaryState = {
  error: Error | null;
};

export class AdminErrorBoundary extends React.Component<AdminErrorBoundaryProps, AdminErrorBoundaryState> {
  state: AdminErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): AdminErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[bamsignal:admin] console crash", error, info.componentStack);
  }

  private reload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="admin-console admin-console--fault" role="alert">
        <div className="admin-fault">
          <p className="admin-fault__kicker">COMMAND CENTER</p>
          <h1 className="admin-fault__title">Command Center interrupted.</h1>
          <p className="admin-fault__body">Reload console to continue operations.</p>
          <button type="button" className="admin-console__logout" onClick={this.reload}>
            Reload Admin
          </button>
        </div>
      </main>
    );
  }
}
