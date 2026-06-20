export const GENERIC_NOT_AUTHORIZED = "not_authorized";
export const GENERIC_NOT_AVAILABLE = "not_available";

export function logIdentityExposureBlocked(context = {}) {
  console.warn("[bamsignal] identity_exposure_blocked", {
    ...context,
    at: new Date().toISOString()
  });
}

export function logAdminStatusHidden(context = {}) {
  console.warn("[bamsignal] admin_status_hidden", {
    ...context,
    at: new Date().toISOString()
  });
}

export function logDiagnosticsAccessDenied(context = {}) {
  console.warn("[bamsignal] diagnostics_access_denied", {
    ...context,
    at: new Date().toISOString()
  });
}

export function sendGenericNotAuthorized(res, status = 401) {
  return res.status(status).json({ ok: false, error: GENERIC_NOT_AUTHORIZED });
}

export function sendGenericNotAvailable(res, status = 404) {
  return res.status(status).json({ ok: false, error: GENERIC_NOT_AVAILABLE });
}

export function sendGenericServiceUnavailable(res) {
  return res.status(503).json({ ok: false, error: GENERIC_NOT_AVAILABLE });
}

/** Strip owner-only fields from profiles shown to unauthenticated viewers. */
export function sanitizePublicMemberProfile(profile) {
  if (!profile || typeof profile !== "object") return null;
  const { premium: _premium, safetySettings: _safetySettings, ...publicProfile } = profile;
  return publicProfile;
}
