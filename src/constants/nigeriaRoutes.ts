import { normalizePath } from "./routePath";

export type NigeriaRoute =
  | { kind: "index" }
  | { kind: "state"; stateSlug: string }
  | { kind: "city"; stateSlug: string; citySlug: string };

const NIGERIA_PREFIX = "/nigeria";

export function getNigeriaRoute(pathname = window.location.pathname): NigeriaRoute | null {
  const path = normalizePath(pathname);
  if (path === NIGERIA_PREFIX) return { kind: "index" };
  if (!path.startsWith(`${NIGERIA_PREFIX}/`)) return null;

  const rest = path.slice(NIGERIA_PREFIX.length + 1);
  const parts = rest.split("/").filter(Boolean);
  if (parts.length === 1) {
    return { kind: "state", stateSlug: parts[0] };
  }
  if (parts.length === 2) {
    return { kind: "city", stateSlug: parts[0], citySlug: parts[1] };
  }
  return null;
}

export function isNigeriaSeoRoute(pathname = window.location.pathname): boolean {
  return getNigeriaRoute(pathname) !== null;
}
