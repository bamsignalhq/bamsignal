import { execSync } from "node:child_process";
import { config } from "../config.mjs";
import {
  PRODUCTION_SMOKE_CHECKS,
  PRODUCTION_SMOKE_MEMBER_ACTIONS,
  PRODUCTION_SMOKE_THRESHOLDS,
  PRODUCTION_SMOKE_UI_MARKERS
} from "../../../shared/productionSmokeChecks.mjs";
import {
  extractDeploymentTimestamp,
  parseBuildMeta,
  resolveCommitSha,
  smokeFetch
} from "./http.mjs";

function check(partial) {
  return {
    passed: true,
    severity: "low",
    httpStatus: 0,
    responseTimeMs: 0,
    expectedUi: null,
    databaseState: null,
    detail: "",
    ...partial
  };
}

function assertSpaShell(result, label) {
  const html = result.text || "";
  const hasRoot = html.includes(PRODUCTION_SMOKE_UI_MARKERS.spaRoot);
  const hasBrand = html.includes(PRODUCTION_SMOKE_UI_MARKERS.brandTitle);
  const hasBuildMeta = html.includes(PRODUCTION_SMOKE_UI_MARKERS.buildMeta);
  const buildId = parseBuildMeta(html);
  const buildResolved = Boolean(buildId && !buildId.includes("__BAMSIGNAL_BUILD__"));

  return {
    passed: result.status === 200 && hasRoot && hasBrand && buildResolved,
    detail: `${label}: HTTP ${result.status}, root=${hasRoot}, brand=${hasBrand}, build=${buildId || "missing"}`,
    expectedUi: {
      spaRoot: hasRoot,
      brandTitle: hasBrand,
      buildMeta: hasBuildMeta,
      buildId
    }
  };
}

async function checkPageSurface(surface) {
  const result = await smokeFetch(surface.path, { accept: "text/html" });
  const shell = assertSpaShell(result, surface.label);
  const slow = result.durationMs > PRODUCTION_SMOKE_THRESHOLDS.pageMaxMs;

  return check({
    id: surface.id,
    label: surface.label,
    kind: "page",
    path: surface.path,
    passed: shell.passed && !slow,
    severity: !shell.passed ? "critical" : slow ? "warning" : "low",
    httpStatus: result.status,
    responseTimeMs: result.durationMs,
    expectedUi: shell.expectedUi,
    databaseState: null,
    detail: slow ? `${shell.detail}; slow ${result.durationMs}ms` : shell.detail,
    error: result.error
  });
}

async function checkHealthEndpoint() {
  const result = await smokeFetch("/health");
  const payload = result.json || {};
  const livenessOnly =
    payload.ok === true &&
    payload.service === "bamsignal" &&
    !("database" in payload) &&
    !("ready" in payload);
  const slow = result.durationMs > PRODUCTION_SMOKE_THRESHOLDS.apiMaxMs;

  return check({
    id: "health-endpoint",
    label: "Health Endpoint",
    kind: "api",
    path: "/health",
    passed: result.status === 200 && livenessOnly && !slow,
    severity: !livenessOnly || result.status !== 200 ? "critical" : slow ? "warning" : "low",
    httpStatus: result.status,
    responseTimeMs: result.durationMs,
    expectedUi: null,
    databaseState: { livenessOnly },
    detail: `GET /health → ${result.status}; livenessOnly=${livenessOnly}`
  });
}

async function checkReadyEndpoint() {
  const headers = config.diagnosticsSecret
    ? { "x-diagnostics-secret": config.diagnosticsSecret }
    : {};

  const result = await smokeFetch("/ready", { headers });
  const payload = result.json || {};
  const databaseState = {
    ready: Boolean(payload.ready),
    database: payload.database || null,
    paystack: payload.paystack ?? null,
    signupEmail: payload.signupEmail ?? null,
    photoStorage: payload.photoStorage ?? null
  };

  const passed = result.status === 200 && payload.ready === true;
  const slow = result.durationMs > PRODUCTION_SMOKE_THRESHOLDS.readyMaxMs;

  return check({
    id: "production-ready",
    label: "Production Ready",
    kind: "api",
    path: "/ready",
    passed: passed && !slow,
    severity: !passed ? "critical" : slow ? "warning" : "low",
    httpStatus: result.status,
    responseTimeMs: result.durationMs,
    expectedUi: null,
    databaseState,
    detail: `GET /ready → ${result.status}; ready=${payload.ready}; database=${payload.database || "unknown"}`
  });
}

async function checkOtpEndpoint() {
  const result = await smokeFetch("/api/auth/email-code", {
    method: "POST",
    body: { action: "send" }
  });

  const mounted = result.status !== 404 && result.status !== 405;
  const acceptable = mounted && result.status < 500;
  const slow = result.durationMs > PRODUCTION_SMOKE_THRESHOLDS.apiMaxMs;

  return check({
    id: "otp",
    label: "OTP",
    kind: "api",
    path: "/api/auth/email-code",
    passed: acceptable && !slow,
    severity: !mounted ? "critical" : result.status >= 500 ? "high" : slow ? "warning" : "low",
    httpStatus: result.status,
    responseTimeMs: result.durationMs,
    expectedUi: null,
    databaseState: null,
    detail: `POST /api/auth/email-code → ${result.status} (route mounted, non-5xx)`
  });
}

async function checkPaymentsEndpoint() {
  const result = await smokeFetch("/api/paystack/verify", {
    method: "POST",
    body: { reference: "__smoke__" }
  });

  const mounted = result.status !== 404 && result.status !== 405;
  const acceptable = mounted && [400, 401, 402, 403, 422, 503].includes(result.status);
  const slow = result.durationMs > PRODUCTION_SMOKE_THRESHOLDS.apiMaxMs;

  return check({
    id: "payments",
    label: "Payments",
    kind: "api",
    path: "/api/paystack/verify",
    passed: acceptable && !slow,
    severity: !mounted ? "critical" : !acceptable ? "high" : slow ? "warning" : "low",
    httpStatus: result.status,
    responseTimeMs: result.durationMs,
    expectedUi: null,
    databaseState: null,
    detail: `POST /api/paystack/verify → ${result.status} (Paystack route mounted)`
  });
}

async function checkFeatureFlags() {
  const result = await smokeFetch("/api/feature-flags");
  const flags = Array.isArray(result.json?.flags) ? result.json.flags : null;
  const hasTrustedMember = flags?.some((item) => item.key === "trusted_member");
  const slow = result.durationMs > PRODUCTION_SMOKE_THRESHOLDS.apiMaxMs;

  return check({
    id: "feature-flags",
    label: "Feature Flags",
    kind: "api",
    path: "/api/feature-flags",
    passed: result.status === 200 && Boolean(flags?.length) && hasTrustedMember && !slow,
    severity: result.status !== 200 || !flags?.length ? "critical" : slow ? "warning" : "low",
    httpStatus: result.status,
    responseTimeMs: result.durationMs,
    expectedUi: null,
    databaseState: { flagCount: flags?.length ?? 0 },
    detail: `GET /api/feature-flags → ${result.status}; flags=${flags?.length ?? 0}`
  });
}

async function checkRemoteConfig() {
  const result = await smokeFetch("/api/remote-config");
  const configPayload = result.json?.config;
  const hasSignalsLimit = configPayload?.["signals.free_daily_limit"] != null;
  const slow = result.durationMs > PRODUCTION_SMOKE_THRESHOLDS.apiMaxMs;

  return check({
    id: "remote-config",
    label: "Remote Config",
    kind: "api",
    path: "/api/remote-config",
    passed: result.status === 200 && hasSignalsLimit && !slow,
    severity: result.status !== 200 || !hasSignalsLimit ? "critical" : slow ? "warning" : "low",
    httpStatus: result.status,
    responseTimeMs: result.durationMs,
    expectedUi: null,
    databaseState: { revision: result.json?.revision ?? null },
    detail: `GET /api/remote-config → ${result.status}; signals.free_daily_limit=${configPayload?.["signals.free_daily_limit"]}`
  });
}

async function checkNotificationsConfig() {
  const result = await smokeFetch("/api/remote-config");
  const configPayload = result.json?.config || {};
  const hasRetry = configPayload["notifications.retry_interval_seconds"] != null;
  const hasTemplates = Boolean(configPayload["notifications.templates"]);

  return check({
    id: "notifications",
    label: "Notifications",
    kind: "config",
    path: "/api/remote-config",
    passed: result.status === 200 && hasRetry && hasTemplates,
    severity: !hasRetry || !hasTemplates ? "high" : "low",
    httpStatus: result.status,
    responseTimeMs: result.durationMs,
    expectedUi: null,
    databaseState: {
      retryIntervalSeconds: configPayload["notifications.retry_interval_seconds"],
      templates: configPayload["notifications.templates"]
    },
    detail: `Remote config exposes notifications.retry_interval_seconds and notifications.templates`
  });
}

async function checkLoginApi() {
  const result = await smokeFetch("/api/auth/pin-login", {
    method: "POST",
    body: { username: "__smoke__", pin: "000000" }
  });

  const mounted = result.status !== 404 && result.status !== 405;
  const acceptable = mounted && [400, 401, 403, 422, 429].includes(result.status);

  return check({
    id: "login-api",
    label: "Login API",
    kind: "api",
    path: "/api/auth/pin-login",
    passed: acceptable,
    severity: !mounted ? "critical" : !acceptable ? "high" : "low",
    httpStatus: result.status,
    responseTimeMs: result.durationMs,
    expectedUi: null,
    databaseState: null,
    detail: `POST /api/auth/pin-login → ${result.status} (auth route mounted)`
  });
}

async function checkMemberDatabaseActions() {
  const checks = [];

  for (const item of PRODUCTION_SMOKE_MEMBER_ACTIONS) {
    const result = await smokeFetch(`/api/member/data?action=${encodeURIComponent(item.action)}`, {
      method: "POST",
      body: {}
    });

    const mounted = result.status !== 404 && result.status !== 405;
    const requiresAuth = mounted && [401, 403].includes(result.status);
    const databaseBlocked = result.status === 503 && /database/i.test(result.json?.error || result.text || "");

    checks.push(
      check({
        id: `member-${item.action}`,
        label: item.label,
        kind: "api",
        path: `/api/member/data?action=${item.action}`,
        passed: requiresAuth,
        severity: !mounted ? "critical" : databaseBlocked ? "critical" : !requiresAuth ? "high" : "low",
        httpStatus: result.status,
        responseTimeMs: result.durationMs,
        expectedUi: null,
        databaseState: {
          requiresAuth,
          databaseBlocked,
          error: result.json?.error || null
        },
        detail: `POST member ${item.action} → ${result.status} (expects auth without session)`
      })
    );
  }

  return checks;
}

export async function runProductionSmokeChecks() {
  const checks = [];
  const pageSurfaces = PRODUCTION_SMOKE_CHECKS.filter((item) => item.kind === "page");

  const landingResult = await smokeFetch("/", { accept: "text/html" });
  const deploymentBuildId = parseBuildMeta(landingResult.text || "");
  const deploymentTimestamp =
    extractDeploymentTimestamp(landingResult.headers, deploymentBuildId) ||
    landingResult.json?.generatedAt ||
    null;

  let commitSha = resolveCommitSha();
  if (!commitSha) {
    try {
      commitSha = execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
    } catch {
      commitSha = null;
    }
  }

  for (const surface of pageSurfaces) {
    if (surface.id === "landing-page") {
      const shell = assertSpaShell(landingResult, "Landing Page");
      const slow = landingResult.durationMs > PRODUCTION_SMOKE_THRESHOLDS.pageMaxMs;
      checks.push(
        check({
          id: "landing-page",
          label: "Landing Page",
          kind: "page",
          path: "/",
          passed: shell.passed && !slow,
          severity: !shell.passed ? "critical" : slow ? "warning" : "low",
          httpStatus: landingResult.status,
          responseTimeMs: landingResult.durationMs,
          expectedUi: shell.expectedUi,
          databaseState: null,
          detail: slow ? `${shell.detail}; slow ${landingResult.durationMs}ms` : shell.detail
        })
      );
      continue;
    }

    checks.push(await checkPageSurface(surface));
  }

  checks.push(await checkHealthEndpoint());
  checks.push(await checkReadyEndpoint());
  checks.push(await checkOtpEndpoint());
  checks.push(await checkLoginApi());
  checks.push(await checkPaymentsEndpoint());
  checks.push(await checkFeatureFlags());
  checks.push(await checkRemoteConfig());
  checks.push(await checkNotificationsConfig());
  checks.push(...(await checkMemberDatabaseActions()));

  return {
    checks,
    deploymentBuildId,
    deploymentTimestamp,
    commitSha
  };
}

export function buildSmokeFailures(checks) {
  return checks
    .filter((item) => !item.passed && item.severity === "critical")
    .map((item) => `${item.label}: ${item.detail}`);
}

export function buildSmokeRecommendations(checks) {
  return checks
    .filter((item) => !item.passed)
    .map((item) => ({
      id: `rec-${item.id}`,
      priority:
        item.severity === "critical"
          ? "critical"
          : item.severity === "high"
            ? "high"
            : item.severity === "warning"
              ? "medium"
              : "low",
      title: item.label,
      detail: item.detail
    }));
}
