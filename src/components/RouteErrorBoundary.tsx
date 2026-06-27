import React from "react";
import { logRouteCrash } from "../utils/crashLog";
import { logStackOverflowCrash, shouldUsePlainErrorFallback } from "../utils/debugRecursion";

type RouteErrorBoundaryProps = {
  children: React.ReactNode;
  name: string;
  fallbackTitle?: string;
};

type RouteErrorBoundaryState = {
  error: Error | null;
};

export class RouteErrorBoundary extends React.Component<RouteErrorBoundaryProps, RouteErrorBoundaryState> {
  state: RouteErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): RouteErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logStackOverflowCrash({
      component: this.props.name,
      error,
      componentStack: info.componentStack
    });
    logRouteCrash(this.props.name, error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    if (shouldUsePlainErrorFallback()) {
      const err = this.state.error;
      return (
        <pre
          className="route-error-fallback__detail"
          role="alert"
          style={{ whiteSpace: "pre-wrap", padding: "1rem", fontSize: "12px" }}
        >
          {`[debug crash] ${this.props.name}\n${err.message}\n${err.stack ?? ""}`}
        </pre>
      );
    }

    return (
      <section className="route-error-fallback" role="alert">
        <div className="route-error-fallback__card card">
          <h2>{this.props.fallbackTitle || "This section needs a moment"}</h2>
          <p>We saved your session. Try reloading this section.</p>
          {import.meta.env.DEV && this.state.error?.message ? (
            <p className="route-error-fallback__detail" role="note">
              {this.state.error.message}
            </p>
          ) : null}
          <button
            type="button"
            className="btn-primary"
            onClick={() => this.setState({ error: null })}
          >
            Try again
          </button>
        </div>
      </section>
    );
  }
}

export function PublicRouteBoundary(props: Omit<RouteErrorBoundaryProps, "fallbackTitle">) {
  return <RouteErrorBoundary {...props} fallbackTitle="This page needs a moment" />;
}

export function MemberRouteBoundary({
  sessionKey,
  ...props
}: RouteErrorBoundaryProps & { sessionKey?: number }) {
  return <RouteErrorBoundary key={sessionKey} {...props} />;
}

export function AdminRouteBoundary(props: RouteErrorBoundaryProps) {
  return <RouteErrorBoundary {...props} fallbackTitle="Console section interrupted" />;
}
