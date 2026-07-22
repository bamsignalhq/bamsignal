/**
 * Parse request context for auth session/device registry.
 * Privacy-respecting: no fingerprinting beyond client-supplied device id + UA.
 */

function pickHeader(req, name) {
  const headers = req?.headers || {};
  const value = headers[name] || headers[name.toLowerCase()];
  return String(Array.isArray(value) ? value[0] : value || "").trim();
}

function parseUserAgent(ua = "") {
  const text = String(ua);
  let platform = "unknown";
  let browser = "unknown";

  if (/android/i.test(text)) platform = "android";
  else if (/iphone|ipad|ipod/i.test(text)) platform = "ios";
  else if (/windows/i.test(text)) platform = "windows";
  else if (/mac os x|macintosh/i.test(text)) platform = "macos";
  else if (/linux/i.test(text)) platform = "linux";

  if (/chrome\/\d+/i.test(text) && !/edg\//i.test(text)) browser = "chrome";
  else if (/safari\/\d+/i.test(text) && !/chrome/i.test(text)) browser = "safari";
  else if (/firefox\/\d+/i.test(text)) browser = "firefox";
  else if (/edg\/\d+/i.test(text)) browser = "edge";

  return { platform, browser };
}

export function parseAuthRequestContext(req, input = {}) {
  const forwarded = pickHeader(req, "x-forwarded-for");
  const ip =
    String(input.ip || "").trim() ||
    (forwarded ? forwarded.split(",")[0].trim() : "") ||
    String(req?.socket?.remoteAddress || req?.ip || "").trim() ||
    null;

  const userAgent =
    String(input.userAgent || "").trim() || pickHeader(req, "user-agent") || null;
  const { platform, browser } = parseUserAgent(userAgent || "");

  const deviceId =
    String(input.deviceId || "").trim() ||
    pickHeader(req, "x-device-id") ||
    pickHeader(req, "x-bamsignal-device-id") ||
    null;

  const deviceName =
    String(input.deviceName || "").trim() ||
    pickHeader(req, "x-device-name") ||
    `${platform} ${browser}`.trim();

  const approximateLocation =
    String(input.approximateLocation || "").trim() ||
    pickHeader(req, "x-approx-location") ||
    null;

  return {
    ip,
    userAgent,
    deviceId,
    deviceName,
    platform,
    browser,
    approximateLocation
  };
}
