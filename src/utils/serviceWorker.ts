import { APP_BUILD_ID } from "../constants/build";
import {
  clearBamSignalVolatileCache,
  htmlBuildMatchesApp,
  isChunkLoadError,
  performAppRecovery,
  unregisterStaleServiceWorkers
} from "./crashRecovery";

const BUILD_KEY = "bamsignal:build-id";
const BUILD_RELOAD_KEY = "bamsignal:build-reload";
const CHUNK_RELOAD_KEY = "bamsignal:chunk-reload";

function showUpdatingOverlay(message = "Updating BamSignal…"): void {
  if (document.getElementById("bamsignal-updating-overlay")) return;
  const overlay = document.createElement("div");
  overlay.id = "bamsignal-updating-overlay";
  overlay.className = "app-updating-overlay";
  overlay.setAttribute("role", "status");
  overlay.textContent = message;
  document.body.appendChild(overlay);
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
        showUpdatingOverlay();
        void clearBamSignalVolatileCache().finally(() => {
          const url = new URL(window.location.href);
          url.searchParams.set("recover", String(Date.now()));
          window.location.replace(url.toString());
        });
        return;
      }
      sessionStorage.removeItem(BUILD_RELOAD_KEY);
    } else {
      localStorage.setItem(BUILD_KEY, APP_BUILD_ID);
    }
  } catch {
    /* ignore storage errors */
  }
}

export function handleChunkLoadFailure(): void {
  if (sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
    void performAppRecovery({ enableSafeMode: true });
    return;
  }
  sessionStorage.setItem(CHUNK_RELOAD_KEY, "1");
  showUpdatingOverlay();
  void clearBamSignalVolatileCache().finally(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("recover", String(Date.now()));
    window.location.replace(url.toString());
  });
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
      showUpdatingOverlay();
      const url = new URL(window.location.href);
      url.searchParams.set("recover", String(Date.now()));
      window.location.replace(url.toString());
    });
  });
}
