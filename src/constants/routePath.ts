/** Path normalization and history navigation — no route registry imports. */

export function normalizePath(pathname = window.location.pathname): string {
  return pathname.replace(/\/$/, "") || "/";
}

export function navigateToPath(path: string, replace = false) {
  if (replace) {
    window.history.replaceState(null, "", path);
  } else {
    window.history.pushState(null, "", path);
  }
  window.dispatchEvent(new PopStateEvent("popstate"));
}
