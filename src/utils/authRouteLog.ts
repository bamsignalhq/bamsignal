/** Structured login/routing logs — database is the only completion authority. */

export type AuthRouteEvent =
  | "AUTH_SUCCESS"
  | "PROFILE_FETCHED"
  | "PROFILE_COMPLETED"
  | "ROUTE_SELECTED"
  | "REDIRECT_REASON";

export function logAuthRoute(
  event: AuthRouteEvent,
  payload: Record<string, unknown> = {}
): void {
  const entry = {
    event,
    ts: new Date().toISOString(),
    ...payload
  };
  if (import.meta.env.DEV) {
    console.info(`[auth-route] ${event}`, entry);
  } else {
    console.info(JSON.stringify({ channel: "auth-route", ...entry }));
  }
}
