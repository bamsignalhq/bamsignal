/** Path normalization and history navigation — no route registry imports. */

import { debugNavigation, isDebugRecursionEnabled } from "../utils/debugRecursion";

export function normalizePath(pathname = window.location.pathname): string {
  return pathname.replace(/\/$/, "") || "/";
}

export function navigateToPath(path: string, replace = false) {
  const from = normalizePath(window.location.pathname);
  const to = normalizePath(path.split("?")[0] || path);
  if (isDebugRecursionEnabled()) {
    debugNavigation(from, to, replace);
    console.info("[debug-nav]", { from, to, replace, stack: new Error().stack?.split("\n").slice(2, 6).join("\n") });
  }
  if (replace) {
    window.history.replaceState(null, "", path);
  } else {
    window.history.pushState(null, "", path);
  }
  window.dispatchEvent(new PopStateEvent("popstate"));
}
