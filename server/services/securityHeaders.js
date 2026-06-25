/** Production security response headers — safe defaults without breaking SPA assets. */

export const SECURITY_RESPONSE_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-DNS-Prefetch-Control": "off",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
};

export function applySecurityHeaders(res) {
  for (const [name, value] of Object.entries(SECURITY_RESPONSE_HEADERS)) {
    if (!res.getHeader(name)) {
      res.setHeader(name, value);
    }
  }
}

export function securityHeadersMiddleware(_req, res, next) {
  applySecurityHeaders(res);
  next();
}

export function hasSecurityHeaders(headers = {}) {
  const normalized = Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [String(key).toLowerCase(), value])
  );
  return (
    normalized["x-content-type-options"] === "nosniff" &&
    normalized["x-frame-options"] === "SAMEORIGIN" &&
    normalized["referrer-policy"] === "strict-origin-when-cross-origin"
  );
}
