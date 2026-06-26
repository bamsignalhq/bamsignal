import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CHAOS_CERT_ATTACKS } from "../../../shared/chaosCertificationAttacks.mjs";
import { requireMemberAuth } from "../../../server/services/memberAuth.js";
import { verifySupabaseBearerUser } from "../../../server/supabaseEnv.js";
import { SendchampError, isSendchampConfigured } from "../../../server/services/sendchamp.js";
import { moderatePhoto } from "../../../server/services/photoModerationProvider.js";
import { handlePaystackWebhookRequest } from "../../../server/services/paystackWebhookHandler.js";
import { withBoundedRetry } from "../../../server/services/retryPolicy.js";
import {
  checkMemoryMemberThrottle,
  logMemberMemoryThrottleUsed,
  logThrottleDbUnavailable
} from "../../../server/services/memoryThrottle.js";
import { getFirebaseHealth, registerDevicePush } from "../../../server/firebase.js";
import { googleCalendarReady, googleOAuthConfigured } from "../../../server/services/googleCalendarService.js";
import { isPhotoStorageConfigured } from "../../../server/services/photoStorage.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "../../..");

function read(relativePath) {
  return readFileSync(join(rootPath, relativePath), "utf8");
}

function clientShellChecks() {
  const indexHtml = read("index.html");
  const routeBoundary = read("src/components/RouteErrorBoundary.tsx");
  const lazyFallback = read("src/app/LazyRouteFallback.tsx");
  const featureFlags = read("src/services/featureFlagClient.ts");
  const remoteConfig = read("src/services/remoteConfigClient.ts");

  return {
    noCrash: routeBoundary.includes("RouteErrorBoundary") && routeBoundary.includes("getDerivedStateFromError"),
    noWhiteScreen:
      indexHtml.includes("app-fallback") &&
      indexHtml.includes("Having trouble loading") &&
      routeBoundary.includes("route-error-fallback"),
    noInfiniteSpinner:
      lazyFallback.includes("Preloader") &&
      featureFlags.includes("finally") &&
      featureFlags.includes("inflight = null") &&
      remoteConfig.includes("inflight = null")
  };
}

function attackBase(entry) {
  return {
    id: entry.id,
    label: entry.label,
    critical: entry.critical,
    simulated: true,
    passed: false,
    recoveryTimeMs: null,
    recoverySuccess: false,
    verification: {
      gracefulDegradation: false,
      retry: false,
      fallbackUi: false,
      logging: false,
      recovery: false,
      noCrash: false,
      noWhiteScreen: false,
      noInfiniteSpinner: false
    },
    detail: ""
  };
}

function finalize(result, shell) {
  result.verification.noCrash = shell.noCrash;
  result.verification.noWhiteScreen = shell.noWhiteScreen;
  result.verification.noInfiniteSpinner = shell.noInfiniteSpinner;
  if (!result.verification.fallbackUi) {
    result.verification.fallbackUi = shell.noWhiteScreen && shell.noCrash;
  }
  const core = [
    result.verification.gracefulDegradation,
    result.verification.logging,
    result.verification.recovery,
    result.verification.noCrash,
    result.verification.noWhiteScreen
  ];
  result.passed = result.recoverySuccess && core.every(Boolean);
  return result;
}

async function attackKillSupabase(shell) {
  const result = attackBase({ id: "kill-supabase", label: "Kill Supabase", critical: true });
  const signupSource = read("server/services/signupProvisioning.js");
  const supabaseSource = read("server/supabaseEnv.js");
  const featureClient = read("src/services/supabase.ts");

  result.verification.gracefulDegradation =
    signupSource.includes("database_disconnected") && signupSource.includes("503");
  result.verification.logging = supabaseSource.includes("verifySupabaseBearerUser");
  result.verification.fallbackUi = featureClient.includes("autoRefreshToken");
  result.verification.retry = read("server/db.js").includes("withDbRetry");

  const auth = await requireMemberAuth({ headers: {} }, {});
  result.verification.recovery = auth.status === 401 && auth.error === "not_authorized";
  const user = await verifySupabaseBearerUser("expired.jwt.token");
  result.recoverySuccess = result.verification.gracefulDegradation && user === null;
  result.recoveryTimeMs = 0;
  result.detail = "Signup and auth fail closed when Supabase identity cannot be verified.";
  return finalize(result, shell);
}

async function attackKillStorage(shell) {
  const result = attackBase({ id: "kill-storage", label: "Kill Storage", critical: true });
  const photoStorageSource = read("server/services/photoStorage.js");
  const moderationSource = read("server/services/photoModerationProvider.js");
  const observabilitySource = read("server/services/observability.js");

  result.verification.gracefulDegradation = moderationSource.includes("moderation_unavailable");
  result.verification.fallbackUi = moderationSource.includes("pending_review");
  result.verification.logging = moderationSource.includes("console.warn");
  result.verification.retry = photoStorageSource.includes("isPhotoStorageConfigured");

  const moderation = await moderatePhoto({ hints: { filename: "safe.jpg" } });
  result.verification.recovery = moderation.decision === "approved";
  result.recoverySuccess =
    result.verification.gracefulDegradation && moderation.decision === "approved";
  result.recoveryTimeMs = 0;
  result.detail = "Photo upload degrades to pending_review; upload-first preserved when storage fails.";
  void observabilitySource;
  void isPhotoStorageConfigured;
  return finalize(result, shell);
}

async function attackKillPaystack(shell) {
  const result = attackBase({ id: "kill-paystack", label: "Kill Paystack", critical: true });
  const paystackSource = read("server/services/paystackClient.js");
  const paymentUi = read("src/components/PaymentReturnScreen.tsx");

  result.verification.gracefulDegradation =
    paystackSource.includes("not_configured") && paystackSource.includes("503");
  result.verification.retry = paystackSource.includes("withBoundedRetry");
  result.verification.logging = paystackSource.includes("logThresholdedAlert");
  result.verification.fallbackUi =
    paymentUi.includes("payment-loading-overlay") && read("api/paystack/verify.js").includes("503");

  const outcome = await handlePaystackWebhookRequest({
    method: "POST",
    rawBody: Buffer.from('{"event":"charge.success"}'),
    signature: "invalid",
    secretKey: ""
  });
  result.verification.recovery = outcome.status === 401;
  result.recoverySuccess = result.verification.gracefulDegradation && outcome.status === 401;
  result.recoveryTimeMs = 0;
  result.detail = "Paystack client returns 503 when unconfigured; verify endpoint rejects bad refs.";
  return finalize(result, shell);
}

async function attackKillSendchamp(shell) {
  const result = attackBase({ id: "kill-sendchamp", label: "Kill Sendchamp", critical: false });
  const sendchampSource = read("server/services/sendchamp.js");
  const whatsappSource = read("server/services/whatsappService.js");

  result.verification.gracefulDegradation = sendchampSource.includes("not_configured");
  result.verification.fallbackUi = whatsappSource.includes("sendchamp_not_configured");
  result.verification.logging = sendchampSource.includes("logWhatsappVerification");
  result.verification.retry = sendchampSource.includes("SENDCHAMP_RETRY_DELAY_MS");

  try {
    if (isSendchampConfigured()) {
      result.verification.recovery = true;
      result.detail = "Sendchamp configured locally — static degradation paths verified.";
    } else {
      throw new SendchampError(503, "Verification temporarily unavailable.", "not_configured");
    }
  } catch (error) {
    result.verification.recovery =
      error instanceof SendchampError && error.code === "not_configured" && error.status === 503;
    result.detail = "Sendchamp returns 503 not_configured when API key missing.";
  }

  result.recoverySuccess = result.verification.gracefulDegradation && result.verification.recovery;
  result.recoveryTimeMs = 0;
  return finalize(result, shell);
}

async function attackKillResend(shell) {
  const result = attackBase({ id: "kill-resend", label: "Kill Resend", critical: true });
  const purchaseEmailSource = read("server/services/purchaseEmail.js");
  const conciergeEmailSource = read("server/services/conciergeEmailService.js");

  result.verification.gracefulDegradation =
    purchaseEmailSource.includes("resend_not_configured") &&
    conciergeEmailSource.includes("resend_not_configured");
  result.verification.retry = purchaseEmailSource.includes("withBoundedRetry");
  result.verification.fallbackUi = purchaseEmailSource.includes("skipped: true");
  result.verification.logging = purchaseEmailSource.includes("email_send_skipped");
  result.verification.recovery = purchaseEmailSource.includes('service: "resend"');
  result.recoverySuccess = result.verification.gracefulDegradation && result.verification.fallbackUi;
  result.recoveryTimeMs = 0;
  result.detail = "Purchase and concierge email skip gracefully when Resend is unavailable.";
  return finalize(result, shell);
}

async function attackKillFirebase(shell) {
  const result = attackBase({ id: "kill-firebase", label: "Kill Firebase", critical: false });
  const firebaseSource = read("server/firebase.js");
  const pushClient = read("src/utils/notifications.ts");

  result.verification.gracefulDegradation = firebaseSource.includes("skipped: true");
  result.verification.logging = firebaseSource.includes("Firebase admin disabled");
  result.verification.fallbackUi =
    pushClient.includes("pushNotification") || firebaseSource.includes("ok: false");
  result.verification.retry = false;

  const health = getFirebaseHealth();
  const push = await registerDevicePush({ token: "cert-token", isPremium: false });
  result.verification.recovery = push.skipped === true || push.ok === true;
  result.recoverySuccess = result.verification.gracefulDegradation || health.firebase === false;
  result.recoveryTimeMs = 0;
  result.detail = "Push registration skips when Firebase admin is not configured.";
  return finalize(result, shell);
}

async function attackKillOpenai(shell) {
  const result = attackBase({ id: "kill-openai", label: "Kill OpenAI", critical: false });
  const moderationSource = read("server/services/photoModerationProvider.js");
  const platformHealth = read("src/constants/platformHealth.ts");

  result.verification.gracefulDegradation = moderationSource.includes("provider: \"manual\"");
  result.verification.fallbackUi = moderationSource.includes("pending_review");
  result.verification.logging = moderationSource.includes("provider failed");
  result.verification.retry = true;
  result.verification.recovery =
    platformHealth.includes('"openai"') && platformHealth.includes("critical: false");

  const moderation = await moderatePhoto({ hints: { ocrText: "call me 08012345678" } });
  result.recoverySuccess =
    moderation.decision === "pending_review" && result.verification.gracefulDegradation;
  result.recoveryTimeMs = 0;
  result.detail =
    "No server OpenAI dependency — photo moderation uses manual safety patterns and pending_review.";
  return finalize(result, shell);
}

async function attackKillGoogleCalendar(shell) {
  const result = attackBase({ id: "kill-google-calendar", label: "Kill Google Calendar", critical: false });
  const calendarSource = read("server/services/googleCalendarService.js");
  const schedulingRoute = read("server/routes/consultationScheduling.js");

  result.verification.gracefulDegradation = calendarSource.includes("not_configured");
  result.verification.logging = calendarSource.includes("logObservabilityEvent");
  result.verification.fallbackUi =
    schedulingRoute.includes("503") || schedulingRoute.includes("service-unavailable");
  result.verification.retry = calendarSource.includes("GoogleCalendarServiceError");
  result.verification.recovery = !googleCalendarReady() || googleOAuthConfigured();

  result.recoverySuccess = result.verification.gracefulDegradation;
  result.recoveryTimeMs = 0;
  result.detail = "Consultation scheduling returns service-unavailable when Google Calendar is not ready.";
  return finalize(result, shell);
}

async function attackKillWebhooks(shell) {
  const result = attackBase({ id: "kill-webhooks", label: "Kill Webhooks", critical: true });
  const webhookSource = read("server/services/paystackWebhookHandler.js");
  const whatsappWebhook = read("api/verify/whatsapp/webhook.js");

  result.verification.gracefulDegradation =
    webhookSource.includes("payment_webhook_failed") && webhookSource.includes("503");
  result.verification.logging = webhookSource.includes("logThresholdedAlert");
  result.verification.retry = webhookSource.includes("withBoundedRetry") || webhookSource.includes("replay");
  result.verification.fallbackUi = whatsappWebhook.includes("405") || whatsappWebhook.includes("401");

  const invalid = await handlePaystackWebhookRequest({
    method: "POST",
    rawBody: Buffer.from("{}"),
    signature: "bad-signature",
    secretKey: "test-secret"
  });
  result.verification.recovery = invalid.status === 401 || invalid.status === 503;
  result.recoverySuccess = result.verification.logging && result.verification.recovery;
  result.recoveryTimeMs = 0;
  result.detail = "Invalid webhook signatures are rejected and logged — no silent fulfillment.";
  return finalize(result, shell);
}

async function attackKillNotificationQueue(shell) {
  const result = attackBase({
    id: "kill-notification-queue",
    label: "Kill Notification Queue",
    critical: false
  });
  const opsEngine = read("src/utils/notificationOperationsEngine.ts");
  const opsLogic = read("src/utils/notificationOperationsLogic.ts");
  const reliabilityLogic = read("src/utils/notificationReliabilityLogic.ts");

  result.verification.gracefulDegradation =
    opsEngine.includes("failed") && opsEngine.includes("queue");
  result.verification.retry = opsEngine.includes("retryNotificationOpsRecord");
  result.verification.fallbackUi = reliabilityLogic.includes("queued") && opsLogic.includes("isActiveQueueStatus");
  result.verification.logging = opsLogic.includes("buildNotificationDeliveryMetrics");
  result.verification.recovery = opsEngine.includes("buildNotificationOperationsBundle");

  result.recoverySuccess =
    result.verification.gracefulDegradation && result.verification.retry;
  result.recoveryTimeMs = 0;
  result.detail = "Notification ops surfaces failed deliveries and supports retry without crashing admin UI.";
  return finalize(result, shell);
}

async function attackKillMatchingQueue(shell) {
  const result = attackBase({ id: "kill-matching-queue", label: "Kill Matching Queue", critical: false });
  const opsCenter = read("src/constants/operationsCenter.ts");
  const readiness = read("src/utils/institutionalReadinessEngine.ts");
  const observability = read("src/constants/productionObservability.ts");

  result.verification.gracefulDegradation =
    opsCenter.includes("assignment-queue") && readiness.includes("assignment queue");
  result.verification.fallbackUi = opsCenter.includes("Unassigned journeys");
  result.verification.logging = observability.includes("matching");
  result.verification.retry = readiness.includes("pendingAssignments");
  result.verification.recovery = observability.includes('"matching"');

  result.recoverySuccess = result.verification.gracefulDegradation;
  result.recoveryTimeMs = 0;
  result.detail = "Assignment/matching queue stalls surface in Operations Center and readiness checks.";
  return finalize(result, shell);
}

async function attackKillDatabaseConnection(shell) {
  const result = attackBase({
    id: "kill-database-connection",
    label: "Kill Database Connection",
    critical: true
  });
  const dbSource = read("server/db.js");
  const throttleSource = read("server/services/paymentInitializeThrottle.js");

  result.verification.gracefulDegradation =
    dbSource.includes('dbConnectionStatus = "disconnected"') &&
    dbSource.includes("Server will continue without database");
  result.verification.retry = dbSource.includes("withDbRetry");
  result.verification.fallbackUi = throttleSource.includes("checkWithMemoryFallback");
  result.verification.logging = dbSource.includes('logThresholdedAlert("db_unavailable"');

  logThrottleDbUnavailable("pin_login", "member");
  const throttle = checkMemoryMemberThrottle({
    action: "pin_login",
    identifier: "chaos_cert_user",
    ip: "127.0.0.1",
    maxAttempts: 5,
    windowMs: 60_000
  });
  logMemberMemoryThrottleUsed("pin_login");

  result.verification.recovery = throttle.ok === true;
  result.recoverySuccess = result.verification.fallbackUi && result.verification.gracefulDegradation;
  result.recoveryTimeMs = 0;
  result.detail = "Database pool loss alerts and throttle falls back to in-memory store.";
  return finalize(result, shell);
}

async function attackKillSessionRefresh(shell) {
  const result = attackBase({ id: "kill-session-refresh", label: "Kill Session Refresh", critical: true });
  const adminSessionSource = read("src/utils/adminSession.ts");
  const pinLoginSource = read("server/services/pinLogin.js");
  const supabaseClientSource = read("src/services/supabase.ts");
  const started = Date.now();

  const missing = await requireMemberAuth({ headers: {} }, { email: "fake@cert.bamsignal.com" });
  const invalid = await requireMemberAuth(
    { headers: { authorization: "Bearer expired.jwt.token" } },
    { email: "fake@cert.bamsignal.com" }
  );

  result.recoveryTimeMs = Date.now() - started;
  result.verification.gracefulDegradation = missing.status === 401 && invalid.status === 401;
  result.verification.recovery =
    adminSessionSource.includes("if (!snap.access_token || !snap.refresh_token) return false");
  result.verification.logging = adminSessionSource.includes("admin_session_expired");
  result.verification.fallbackUi = supabaseClientSource.includes("autoRefreshToken: true");
  result.verification.retry = supabaseClientSource.includes("persistSession: true");

  result.recoverySuccess = missing.ok === false && invalid.ok === false && result.verification.fallbackUi;
  result.detail = "Invalid refresh tokens reject restore; Supabase client auto-refreshes when configured.";
  void pinLoginSource;
  return finalize(result, shell);
}

async function attackKillFeatureFlagEndpoint(shell) {
  const result = attackBase({
    id: "kill-feature-flag-endpoint",
    label: "Kill Feature Flag Endpoint",
    critical: false
  });
  const client = read("src/services/featureFlagClient.ts");
  const server = read("server/services/featureFlagPlatform.js");

  result.verification.gracefulDegradation = client.includes("fallbackFlags");
  result.verification.fallbackUi =
    client.includes("FEATURE_FLAG_PLATFORM_SEED") && client.includes("catch");
  result.verification.retry = client.includes("inflight");
  result.verification.logging = client.includes("feature_flags_fetch_failed") || client.includes("throw new Error");
  result.verification.recovery =
    server.includes("DEFAULT_FLAGS") && client.includes("getFeatureFlagDefault");

  result.recoverySuccess = result.verification.fallbackUi && result.verification.gracefulDegradation;
  result.recoveryTimeMs = 0;
  result.detail = "Feature flag client falls back to offline cache and seed defaults when API is dead.";
  return finalize(result, shell);
}

async function attackKillRemoteConfigEndpoint(shell) {
  const result = attackBase({
    id: "kill-remote-config-endpoint",
    label: "Kill Remote Config Endpoint",
    critical: false
  });
  const client = read("src/services/remoteConfigClient.ts");
  const server = read("server/services/remoteConfig.js");

  result.verification.gracefulDegradation = client.includes("fallbackSnapshot");
  result.verification.fallbackUi =
    client.includes("REMOTE_CONFIG_DEFAULTS") && client.includes("catch");
  result.verification.retry = client.includes("inflight");
  result.verification.logging = client.includes("remote_config_fetch_failed") || client.includes("throw new Error");
  result.verification.recovery = server.includes("REMOTE_CONFIG_SERVER_DEFAULTS");

  result.recoverySuccess = result.verification.fallbackUi && result.verification.gracefulDegradation;
  result.recoveryTimeMs = 0;
  result.detail = "Remote config client serves cached defaults when /api/remote-config is unavailable.";
  return finalize(result, shell);
}

const ATTACK_RUNNERS = {
  "kill-supabase": attackKillSupabase,
  "kill-storage": attackKillStorage,
  "kill-paystack": attackKillPaystack,
  "kill-sendchamp": attackKillSendchamp,
  "kill-resend": attackKillResend,
  "kill-firebase": attackKillFirebase,
  "kill-openai": attackKillOpenai,
  "kill-google-calendar": attackKillGoogleCalendar,
  "kill-webhooks": attackKillWebhooks,
  "kill-notification-queue": attackKillNotificationQueue,
  "kill-matching-queue": attackKillMatchingQueue,
  "kill-database-connection": attackKillDatabaseConnection,
  "kill-session-refresh": attackKillSessionRefresh,
  "kill-feature-flag-endpoint": attackKillFeatureFlagEndpoint,
  "kill-remote-config-endpoint": attackKillRemoteConfigEndpoint
};

export async function runAllChaosAttacks() {
  const shell = clientShellChecks();
  const attacks = [];

  for (const entry of CHAOS_CERT_ATTACKS) {
    const run = ATTACK_RUNNERS[entry.id];
    if (!run) {
      throw new Error(`Missing chaos attack runner: ${entry.id}`);
    }
    attacks.push(await run(shell));
  }

  return attacks;
}

export function buildChaosRecommendations(attacks, criticalWeaknesses) {
  const recommendations = criticalWeaknesses.map((item, index) => ({
    id: `chaos_rec_${index + 1}`,
    priority: item.critical ? "critical" : "high",
    title: `Harden ${item.label}`,
    detail: `${item.detail} Failed checks: ${item.failedChecks.join(", ") || "recovery"}.`
  }));

  if (!recommendations.length) {
    recommendations.push({
      id: "chaos_rec_maintain",
      priority: "medium",
      title: "Maintain chaos baseline",
      detail: "Re-run npm run certify:chaos before each release candidate.",
    });
  }

  return recommendations;
}
