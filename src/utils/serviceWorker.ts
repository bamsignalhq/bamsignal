import { APP_BUILD_ID } from "../constants/build";

const BUILD_KEY = "bamsignal:build-id";
const BUILD_RELOAD_KEY = "bamsignal:build-reload";
const CHUNK_RELOAD_KEY = "bamsignal:chunk-reload";

/** Reload once when a new production bundle is detected. */
export function checkBuildVersion(): void {
  if (!import.meta.env.PROD) return;
  try {
    const previous = localStorage.getItem(BUILD_KEY);
    if (previous && previous !== APP_BUILD_ID) {
      localStorage.setItem(BUILD_KEY, APP_BUILD_ID);
      if (!sessionStorage.getItem(BUILD_RELOAD_KEY)) {
        sessionStorage.setItem(BUILD_RELOAD_KEY, "1");
        window.location.reload();
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

export function registerServiceWorker(): void {
  if (!("serviceWorker" in navigator) || !import.meta.env.PROD) return;

  window.addEventListener(
    "error",
    (event) => {
      const target = event.target;
      if (!(target instanceof HTMLScriptElement || target instanceof HTMLLinkElement)) return;
      const src = target instanceof HTMLScriptElement ? target.src : target.href;
      if (!src.includes("/assets/")) return;
      if (sessionStorage.getItem(CHUNK_RELOAD_KEY)) return;
      sessionStorage.setItem(CHUNK_RELOAD_KEY, "1");
      window.location.reload();
    },
    true
  );

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
      window.location.reload();
    });
  });
}
