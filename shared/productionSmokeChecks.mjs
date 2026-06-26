/** Production Smoke Suite™ — verified surface registry and thresholds. */

export const PRODUCTION_SMOKE_BRAND = "Production Smoke Suite™";

export const PRODUCTION_SMOKE_CHECKS = [
  { id: "landing-page", label: "Landing Page", kind: "page", path: "/" },
  { id: "signup", label: "Signup", kind: "page", path: "/love/sign" },
  { id: "login", label: "Login", kind: "page", path: "/love/login" },
  { id: "otp", label: "OTP", kind: "api", path: "/api/auth/email-code", method: "POST" },
  { id: "discover", label: "Discover", kind: "page", path: "/discover" },
  { id: "signals", label: "Signals", kind: "page", path: "/signals" },
  { id: "chats", label: "Chats", kind: "page", path: "/chats" },
  { id: "profile", label: "Profile", kind: "page", path: "/profile" },
  { id: "payments", label: "Payments", kind: "api", path: "/api/paystack/verify", method: "POST" },
  { id: "notifications", label: "Notifications", kind: "config", path: "/api/remote-config" },
  { id: "health-endpoint", label: "Health Endpoint", kind: "api", path: "/health", method: "GET" },
  { id: "feature-flags", label: "Feature Flags", kind: "api", path: "/api/feature-flags", method: "GET" },
  { id: "remote-config", label: "Remote Config", kind: "api", path: "/api/remote-config", method: "GET" }
];

export const PRODUCTION_SMOKE_BLOCK_ON_CRITICAL = true;

export const PRODUCTION_SMOKE_THRESHOLDS = {
  pageMaxMs: 3500,
  apiMaxMs: 2000,
  readyMaxMs: 2500
};

export const PRODUCTION_SMOKE_UI_MARKERS = {
  spaRoot: '<div id="root">',
  brandTitle: "BamSignal",
  buildMeta: 'name="bamsignal-build"'
};

export const PRODUCTION_SMOKE_MEMBER_ACTIONS = [
  { action: "discover", label: "Discover API" },
  { action: "signals", label: "Signals API" },
  { action: "chats", label: "Chats API" },
  { action: "profile", label: "Profile API" }
];
