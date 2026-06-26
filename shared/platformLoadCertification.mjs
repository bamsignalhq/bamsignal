/** Platform Load Certification™ — realistic member journey registry and thresholds. */

export const PLATFORM_LOAD_CERT_BRAND = "Platform Load Certification™";

export const PLATFORM_LOAD_DEFAULT_VIRTUAL_MEMBERS = 1000;
export const PLATFORM_LOAD_DEFAULT_MAX_CONCURRENCY = 100;

export const PLATFORM_LOAD_BLOCK_ON_CRITICAL = true;

export const PLATFORM_LOAD_THRESHOLDS = {
  apiP95Ms: 1200,
  healthP95Ms: 600,
  readyP95Ms: 2000,
  failureRatePercent: 3,
  maxQueueDepth: 800,
  runnerRamMbPeak: 768,
  cpuUserMsPerMember: 120
};

/** Retry policy for transient load-cert request failures (idempotent GET/HEAD/probes only). */
export const PLATFORM_LOAD_RETRY = {
  maxAttempts: 4,
  baseDelayMs: 100,
  maxDelayMs: 1800,
  retriableStatuses: [0, 408, 429, 500, 502, 503, 504]
};

/** Baseline snapshot from pre-hardening 1000-member run (load-7b5329af) for enterprise reports. */
export const PLATFORM_LOAD_BASELINE = {
  runId: "load-7b5329af",
  loadScore: 94,
  journeysPassed: 938,
  journeysFailed: 62,
  requestFailures: 71,
  failureRatePercent: 0.5,
  maxQueueDepth: 65,
  bottlenecks: 1
};

/** Realistic think-time ranges (ms) between member actions — avoids API spam patterns. */
export const PLATFORM_LOAD_THINK_MS = {
  min: 450,
  max: 2800,
  pageReadMin: 800,
  pageReadMax: 3500,
  fastMin: 40,
  fastMax: 140,
  fastPageMin: 60,
  fastPageMax: 180
};

/**
 * Weighted member journeys — each virtual member runs one full session.
 * Steps use think delays and expected HTTP outcomes for unauthenticated load simulation.
 */
export const PLATFORM_LOAD_JOURNEY_TYPES = [
  { id: "full-session", label: "Full member session", weight: 55 },
  { id: "browse-discover", label: "Browse + discover", weight: 20 },
  { id: "signals-chats", label: "Signals + chats", weight: 15 },
  { id: "payments-otp", label: "Payments + OTP", weight: 10 }
];

export const PLATFORM_LOAD_JOURNEY_STEPS = {
  login: [
    { id: "login-page", kind: "page", method: "GET", path: "/love/login" },
    { id: "pin-login", kind: "api", method: "POST", path: "/api/auth/pin-login", body: { username: "__member__", pin: "123456" }, expect: [400, 401, 429] }
  ],
  browse: [
    { id: "landing", kind: "page", method: "GET", path: "/" },
    { id: "premium", kind: "page", method: "GET", path: "/premium" },
    { id: "features", kind: "page", method: "GET", path: "/features" }
  ],
  discover: [
    { id: "discover-page", kind: "page", method: "GET", path: "/discover" },
    { id: "discover-api", kind: "api", method: "POST", path: "/api/member/data?action=discover", body: { action: "discover" }, expect: [401, 403] }
  ],
  signals: [
    { id: "signals-page", kind: "page", method: "GET", path: "/signals" },
    { id: "signals-api", kind: "api", method: "POST", path: "/api/member/data?action=signals", body: { action: "signals" }, expect: [401, 403] }
  ],
  chats: [
    { id: "chats-page", kind: "page", method: "GET", path: "/chats" },
    { id: "chats-api", kind: "api", method: "POST", path: "/api/member/data?action=chats", body: { action: "chats" }, expect: [401, 403] }
  ],
  profile: [
    { id: "profile-page", kind: "page", method: "GET", path: "/profile" },
    { id: "profile-api", kind: "api", method: "POST", path: "/api/member/data?action=profile", body: { action: "profile" }, expect: [401, 403] },
    {
      id: "profile-edit",
      kind: "api",
      method: "POST",
      path: "/api/member/data?action=profile-patch",
      body: { action: "profile-patch", bio: "Load cert bio" },
      expect: [401, 403, 400]
    }
  ],
  notifications: [
    { id: "remote-config", kind: "api", method: "GET", path: "/api/remote-config", expect: [200, 404] },
    { id: "feature-flags", kind: "api", method: "GET", path: "/api/feature-flags", expect: [200, 404] },
    { id: "home-page", kind: "page", method: "GET", path: "/home" }
  ],
  payments: [
    { id: "subscription-page", kind: "page", method: "GET", path: "/subscription" },
    {
      id: "paystack-verify",
      kind: "api",
      method: "POST",
      path: "/api/paystack/verify",
      body: { reference: "__loadcert__" },
      expect: [400, 401, 404, 422, 503]
    }
  ],
  otp: [
    { id: "signup-page", kind: "page", method: "GET", path: "/love/sign" },
    {
      id: "otp-math-challenge",
      kind: "api",
      method: "POST",
      path: "/api/auth/email-code",
      body: { action: "math-challenge" },
      expect: [200, 400, 429]
    }
  ],
  health: [
    { id: "health", kind: "probe", method: "GET", path: "/health", expect: [200] },
    { id: "ready", kind: "probe", method: "GET", path: "/ready", expect: [200, 503] }
  ]
};

export const PLATFORM_LOAD_FULL_SESSION_PHASES = [
  "browse",
  "login",
  "discover",
  "signals",
  "chats",
  "profile",
  "notifications",
  "payments",
  "otp"
];

export const PLATFORM_LOAD_JOURNEY_PHASES = {
  "full-session": PLATFORM_LOAD_FULL_SESSION_PHASES,
  "browse-discover": ["browse", "discover", "notifications"],
  "signals-chats": ["browse", "signals", "chats", "notifications"],
  "payments-otp": ["browse", "payments", "otp"]
};
