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
import {
  handleAdminSessionExpired,
  validateHardSession
} from "../../utils/adminSession";
import { supabase } from "../../services/supabase";

type AdminShellProps = {
  children: ReactNode;
  authorized: boolean | null;
  onUnauthorized: () => void;
};

type AdminGatePhase = "checking" | "authorized" | "denied";

export function AdminShell({ children, onUnauthorized }: AdminShellProps) {
  const [phase, setPhase] = useState<AdminGatePhase>(() =>
    isHardAuthRoute() ? "authorized" : "checking"
  );

  useEffect(() => {
    document.documentElement.classList.add("hard-mode");
    document.documentElement.dataset.theme = "dark";
    return () => {
      document.documentElement.classList.remove("hard-mode");
    };
  }, []);

  useEffect(() => {
    if (isHardAuthRoute()) {
      setPhase("authorized");
      return;
    }

    let cancelled = false;
    void validateHardSession().then((ok) => {
      if (cancelled) return;
      if (!ok) {
        setPhase("denied");
        window.setTimeout(() => onUnauthorized(), 900);
        return;
      }
      setPhase("authorized");
    });
    return () => {
      cancelled = true;
    };
  }, [onUnauthorized]);

  useEffect(() => {
    if (!supabase || isHardAuthRoute()) return;

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session?.access_token) {
        void handleAdminSessionExpired(onUnauthorized);
        setPhase("denied");
        return;
      }
      if (event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        void validateHardSession().then((ok) => {
          if (!ok) {
            setPhase("denied");
            void handleAdminSessionExpired(onUnauthorized);
          }
        });
      }
    });

    return () => subscription.unsubscribe();
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
      if (!isHardRoute() || isHardAuthRoute()) return;
      void validateHardSession().then((ok) => {
        if (ok) navigateToPath(hardPathForTab("command"));
        else void handleAdminSessionExpired(onUnauthorized);
      });
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [onUnauthorized]);

  if (phase === "checking") {
    return (
      <div className="admin-console admin-console--boot">
        <p className="admin-console__boot-msg">Authenticating…</p>
      </div>
    );
  }

  if (phase === "denied") {
    return (
      <div className="admin-console admin-console--boot">
        <p className="admin-console__boot-msg">Session expired. Please sign in again.</p>
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
