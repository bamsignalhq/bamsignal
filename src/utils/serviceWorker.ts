import { APP_BUILD_ID } from "../constants/build";
import {
  clearBamSignalVolatileCache,
  htmlBuildMatchesApp,
  isChunkLoadError
} from "./crashRecovery";
import { clearAppUpdatePending, markAppUpdatePending } from "./bootFlags";

const BUILD_KEY = "bamsignal:build-id";
const BUILD_RELOAD_KEY = "bamsignal:build-reload";
const CHUNK_RELOAD_KEY = "bamsignal:chunk-reload";
const RECOVERY_RELOAD_COUNT_KEY = "bamsignal:recovery-reload-count";
const MAX_RECOVERY_RELOADS = 2;

export function notifyConnectionRefreshed(): void {
  try {
    window.dispatchEvent(new CustomEvent("bamsignal:connection-refreshed"));
  } catch {
    /* ignore */
  }
  if (typeof document === "undefined") return;
  if (document.querySelector("[data-bamsignal-connection-toast]")) return;
  const toast = document.createElement("p");
  toast.dataset.bamsignalConnectionToast = "1";
  toast.className = "compliance-sync-banner";
  toast.setAttribute("role", "status");
  toast.textContent = "Connection refreshed.";
  toast.style.cssText =
    "position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:10000;max-width:min(92vw,420px);margin:0;cursor:default;";
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 4000);
}

function canRecoveryReload(): boolean {
  try {
    const count = Number(sessionStorage.getItem(RECOVERY_RELOAD_COUNT_KEY) || 0);
    if (count >= MAX_RECOVERY_RELOADS) return false;
    sessionStorage.setItem(RECOVERY_RELOAD_COUNT_KEY, String(count + 1));
    return true;
  } catch {
    return true;
  }
}

function silentRecoveryReload(): void {
  if (!canRecoveryReload()) {
    clearAppUpdatePending();
    notifyConnectionRefreshed();
    return;
  }
  markAppUpdatePending();
  void clearBamSignalVolatileCache().finally(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("recover", String(Date.now()));
    window.location.replace(url.toString());
  });
}

/** Reload once when a new production bundle is detected. */
export function checkBuildVersion(): void {
  if (!import.meta.env.PROD) return;
  try {
    const previous = localStorage.getItem(BUILD_KEY);
    const htmlMismatch = !htmlBuildMatchesApp();
    if ((previous && previous !== APP_BUILD_ID) || htmlMismatch) {
      localStorage.setItem(BUILD_KEY, APP_BUILD_ID);
      if (!sessionStorage.getItem(BUILD_RELOAD_KEY)) {
        sessionStorage.setItem(BUILD_RELOAD_KEY, "1");
        silentRecoveryReload();
        return;
      }
      sessionStorage.removeItem(BUILD_RELOAD_KEY);
      clearAppUpdatePending();
      notifyConnectionRefreshed();
    } else {
      localStorage.setItem(BUILD_KEY, APP_BUILD_ID);
    }
  } catch {
    /* ignore storage errors */
  }
}

export function handleChunkLoadFailure(): void {
  if (sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
    sessionStorage.removeItem(CHUNK_RELOAD_KEY);
    clearAppUpdatePending();
    notifyConnectionRefreshed();
    return;
  }
  sessionStorage.setItem(CHUNK_RELOAD_KEY, "1");
  silentRecoveryReload();
}

export function installChunkLoadHandlers(): void {
  window.addEventListener(
    "error",
    (event) => {
      const target = event.target;
      if (!(target instanceof HTMLScriptElement || target instanceof HTMLLinkElement)) return;
      const src = target instanceof HTMLScriptElement ? target.src : target.href;
      if (!src.includes("/assets/")) return;
      if (sessionStorage.getItem(CHUNK_RELOAD_KEY)) return;
      handleChunkLoadFailure();
    },
    true
  );

  window.addEventListener("unhandledrejection", (event) => {
    if (!isChunkLoadError(event.reason)) return;
    event.preventDefault();
    handleChunkLoadFailure();
  });
}

export function registerServiceWorker(): void {
  if (!("serviceWorker" in navigator) || !import.meta.env.PROD) return;

  installChunkLoadHandlers();

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        registration.update().catch(() => undefined);

        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              worker.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });
      })
      .catch(() => undefined);

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (sessionStorage.getItem(BUILD_RELOAD_KEY)) return;
      sessionStorage.setItem(BUILD_RELOAD_KEY, "1");
      silentRecoveryReload();
    });
  });
}
