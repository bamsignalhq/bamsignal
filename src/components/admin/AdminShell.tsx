import { useCallback, useEffect, useState, type ReactNode } from "react";
import { adminPathForTab } from "../../constants/adminRoutes";
import {
  ADMIN_AUTH_PATH,
  isAdminAuthRoute,
  isAdminRoute,
  navigateToPath,
  normalizePath
} from "../../constants/routes";
import { AdminErrorBoundary } from "./AdminErrorBoundary";
import { validateAdminSession } from "../../utils/adminSession";

type AdminShellProps = {
  children: ReactNode;
  authorized: boolean | null;
  onUnauthorized: () => void;
};

export function AdminShell({ children, authorized, onUnauthorized }: AdminShellProps) {
  const [checking, setChecking] = useState(authorized === null);

  useEffect(() => {
    document.documentElement.classList.add("admin-mode");
    document.documentElement.dataset.theme = "dark";
    return () => {
      document.documentElement.classList.remove("admin-mode");
    };
  }, []);

  useEffect(() => {
    if (isAdminAuthRoute()) {
      setChecking(false);
      return;
    }
    let cancelled = false;
    void validateAdminSession().then((ok) => {
      if (cancelled) return;
      setChecking(false);
      if (!ok) onUnauthorized();
    });
    return () => {
      cancelled = true;
    };
  }, [onUnauthorized]);

  const handleAdminBack = useCallback(() => {
    if (!isAdminRoute() || isAdminAuthRoute()) return;

    const path = normalizePath(window.location.pathname);
    if (path === "/admin/command" || path === "/admin" || path === "/hard") {
      return;
    }

    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    navigateToPath(adminPathForTab("command"));
  }, []);

  useEffect(() => {
    const onCustomBack = (event: Event) => {
      if (!isAdminRoute() || isAdminAuthRoute()) return;
      if (event.defaultPrevented) return;
      handleAdminBack();
    };
    window.addEventListener("bamsignal:admin-back", onCustomBack);
    return () => window.removeEventListener("bamsignal:admin-back", onCustomBack);
  }, [handleAdminBack]);

  useEffect(() => {
    const onPopState = () => {
      if (!isAdminRoute() || !isAdminAuthRoute()) return;
      void validateAdminSession().then((ok) => {
        if (ok) navigateToPath(adminPathForTab("command"));
      });
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  if (checking && !isAdminAuthRoute()) {
    return (
      <div className="admin-console admin-console--boot">
        <p className="admin-console__boot-msg">Restoring command session…</p>
      </div>
    );
  }

  return (
    <AdminErrorBoundary>
      <div className="admin-console-root">{children}</div>
    </AdminErrorBoundary>
  );
}

export function openAdminLogin(): void {
  navigateToPath(ADMIN_AUTH_PATH);
}
