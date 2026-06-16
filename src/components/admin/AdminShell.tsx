import { useCallback, useEffect, useState, type ReactNode } from "react";
import { hardPathForTab } from "../../constants/hardRoutes";
import {
  HARD_AUTH_PATH,
  isHardAuthRoute,
  isHardRoute,
  navigateToPath,
  normalizePath
} from "../../constants/routes";
import { AdminErrorBoundary } from "./AdminErrorBoundary";
import { validateHardSession } from "../../utils/adminSession";

type AdminShellProps = {
  children: ReactNode;
  authorized: boolean | null;
  onUnauthorized: () => void;
};

export function AdminShell({ children, authorized, onUnauthorized }: AdminShellProps) {
  const [checking, setChecking] = useState(authorized === null);

  useEffect(() => {
    document.documentElement.classList.add("hard-mode");
    document.documentElement.dataset.theme = "dark";
    return () => {
      document.documentElement.classList.remove("hard-mode");
    };
  }, []);

  useEffect(() => {
    if (isHardAuthRoute()) {
      setChecking(false);
      return;
    }
    let cancelled = false;
    void validateHardSession().then((ok) => {
      if (cancelled) return;
      setChecking(false);
      if (!ok) onUnauthorized();
    });
    return () => {
      cancelled = true;
    };
  }, [onUnauthorized]);

  const handleHardBack = useCallback(() => {
    if (!isHardRoute() || isHardAuthRoute()) return;

    const path = normalizePath(window.location.pathname);
    if (path === "/hard/command" || path === "/hard") {
      return;
    }

    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    navigateToPath(hardPathForTab("command"));
  }, []);

  useEffect(() => {
    const onCustomBack = (event: Event) => {
      if (!isHardRoute() || isHardAuthRoute()) return;
      if (event.defaultPrevented) return;
      handleHardBack();
    };
    window.addEventListener("bamsignal:hard-back", onCustomBack);
    window.addEventListener("bamsignal:admin-back", onCustomBack);
    return () => {
      window.removeEventListener("bamsignal:hard-back", onCustomBack);
      window.removeEventListener("bamsignal:admin-back", onCustomBack);
    };
  }, [handleHardBack]);

  useEffect(() => {
    const onPopState = () => {
      if (!isHardRoute() || !isHardAuthRoute()) return;
      void validateHardSession().then((ok) => {
        if (ok) navigateToPath(hardPathForTab("command"));
      });
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  if (checking && !isHardAuthRoute()) {
    return (
      <div className="admin-console admin-console--boot">
        <p className="admin-console__boot-msg">Authenticating…</p>
      </div>
    );
  }

  return (
    <AdminErrorBoundary>
      <div className="admin-console-root">{children}</div>
    </AdminErrorBoundary>
  );
}

export function openHardLogin(): void {
  navigateToPath(HARD_AUTH_PATH);
}
