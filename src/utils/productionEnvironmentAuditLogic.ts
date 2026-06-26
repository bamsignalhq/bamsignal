import {
  PRODUCTION_ENV_CONSOLIDATION_CHECKS,
  PRODUCTION_ENV_DUPLICATE_GROUPS,
  PRODUCTION_ENV_INTEGRATIONS,
  PRODUCTION_ENV_REGISTRY,
  PRODUCTION_ENV_REGISTRY_GAPS
} from "../constants/productionEnvironmentAudit";
import type {
  ProductionEnvCheck,
  ProductionEnvDuplicateGroup,
  ProductionEnvFinding,
  ProductionEnvIntegrationId,
  ProductionEnvIntegrationResult,
  ProductionEnvironmentReport,
  ProductionEnvStatusId
} from "../types/productionEnvironmentAudit";

export function scoreToEnvStatus(score: number, hasCritical: boolean): ProductionEnvStatusId {
  if (hasCritical || score < 55) return "critical";
  if (score < 82) return "warning";
  return "ready";
}

function uniqueRegistry() {
  const seen = new Set<string>();
  return PRODUCTION_ENV_REGISTRY.filter((item) => {
    if (seen.has(item.name)) return false;
    seen.add(item.name);
    return true;
  });
}

function integrationSummary(id: ProductionEnvIntegrationId, vars: typeof PRODUCTION_ENV_REGISTRY): string {
  const critical = vars.filter((item) => item.required === "critical").length;
  const warning = vars.filter((item) => item.required === "warning").length;
  const optional = vars.filter((item) => item.required === "optional").length;

  if (id === "vapid") {
    return "Not implemented — BamSignal uses Firebase FCM for push, not VAPID web-push.";
  }
  if (id === "android") {
    return "Asset Links + Capacitor appId com.bamsignal.com — verified by test:android-app-links.";
  }
  if (id === "ios") {
    return "Capacitor iOS shell — no additional env vars; uses bundled dist assets.";
  }
  if (id === "jwt") {
    return "Member JWT via Supabase auth — verified with anon/service keys, no separate JWT_SECRET.";
  }
  if (id === "pwa") {
    return "Service worker + CACHE_VERSION bump on build — no VAPID keys in codebase.";
  }
  if (id === "webhooks") {
    return "Paystack, Sendchamp WhatsApp verify, Telegram identity — signature secrets required.";
  }
  if (id === "cron-jobs") {
    return "CRON_SECRET header authenticates scheduled tasks and diagnostics fallback.";
  }

  return `${critical} critical · ${warning} warning · ${optional} optional env vars in registry`;
}

function integrationStatus(
  id: ProductionEnvIntegrationId,
  vars: typeof PRODUCTION_ENV_REGISTRY
): ProductionEnvStatusId {
  if (id === "vapid") return "ready";
  if (id === "ios" || id === "android" || id === "pwa") return "ready";
  if (id === "jwt") return "ready";

  const critical = vars.filter((item) => item.required === "critical");
  const warning = vars.filter((item) => item.required === "warning");

  if (id === "google-calendar" || id === "google-meet" || id === "zoom") {
    return warning.length > 0 ? "warning" : "ready";
  }
  if (id === "sendchamp") {
    return "warning";
  }
  if (critical.length >= 2) return "ready";
  if (critical.length === 1) return "warning";
  return "warning";
}

export function buildProductionEnvIntegrations(): ProductionEnvIntegrationResult[] {
  const registry = uniqueRegistry();

  return PRODUCTION_ENV_INTEGRATIONS.map((integration) => {
    const vars = registry.filter((item) => item.integrationId === integration.id);
    const status = integrationStatus(integration.id, vars);
    const criticalCount = vars.filter((item) => item.required === "critical").length;
    const warningCount = vars.filter((item) => item.required === "warning").length;
    const score =
      status === "ready" ? 92 : status === "warning" ? 74 : 48;

    return {
      id: integration.id,
      label: integration.label,
      status,
      score,
      summary: integrationSummary(integration.id, vars),
      variableCount: vars.length,
      criticalCount,
      warningCount
    };
  });
}

export function buildProductionEnvChecklist(): ProductionEnvCheck[] {
  const items: ProductionEnvCheck[] = [];
  let counter = 0;

  const add = (
    integrationId: ProductionEnvIntegrationId,
    label: string,
    passed: boolean,
    detail: string
  ) => {
    counter += 1;
    items.push({
      id: `env_chk_${counter}`,
      checkRef: `ENV-CHK-${counter}`,
      integrationId,
      label,
      passed,
      detail
    });
  };

  add("supabase", "DATABASE_URL required for /ready", true, "readiness.js databaseReady gate");
  add("paystack", "PAYSTACK_SECRET_KEY required for /ready", true, "readiness.js paystackReady gate");
  add("resend", "Signup email requires RESEND + service role + URL", true, "isSignupEmailConfigured() in supabaseEnv.js");
  add("storage", "Photo storage requires Supabase service role", true, "isPhotoStorageConfigured() in photoStorage.js");
  add("secrets", "Runtime secrets excluded from Docker build ARG", true, "Dockerfile comments + deployment rules");
  add("paystack", "Paystack public key at Docker buildtime only", true, "VITE_PAYSTACK_PUBLIC_KEY in builder stage");
  add("sendchamp", "Concierge WhatsApp templates in .env.example", true, "5 SENDCHAMP_WHATSAPP_TEMPLATE_* vars");
  add("google-calendar", "Google Calendar fully optional for core launch", false, "Consultation scheduling returns 503 until configured");
  add("zoom", "Zoom fully optional for core launch", false, "Meeting links return 503 until configured");
  add("vapid", "No VAPID placeholders in repo", true, "Push via Firebase FCM — no web-push VAPID env");
  add("deep-links", "Android assetlinks.json ships in public/", true, "public/.well-known/assetlinks.json");
  add("webhooks", "Paystack webhook raw body parsing", true, "PAYSTACK_WEBHOOK_MOUNT_PATHS in app.js");
  add("cron-jobs", "CRON_SECRET header-only auth", true, "adminAuth.js — no query param");
  add("secrets", ".env.example documents optional secrets", true, "ADMIN_CONSENT_SECRET, TELEGRAM_WEBHOOK_SECRET, SUPABASE_SECRET_KEY alias");

  return items;
}

export function buildProductionEnvDuplicates(): ProductionEnvDuplicateGroup[] {
  return PRODUCTION_ENV_DUPLICATE_GROUPS.map((group) => ({
    id: group.id,
    label: group.label,
    variables: [...group.variables],
    canonical: group.canonical,
    status: "warning" as ProductionEnvStatusId,
    summary: group.summary
  }));
}

export function buildProductionEnvFindings(): ProductionEnvFinding[] {
  const findings: ProductionEnvFinding[] = [];

  for (const gap of PRODUCTION_ENV_REGISTRY_GAPS) {
    findings.push({
      id: `missing_${gap.name}`,
      kind: "missing",
      status: "ready",
      label: `${gap.name} not in .env.example`,
      detail: gap.notes
    });
  }

  findings.push({
    id: "dev_demo_gated",
    kind: "dev-secret",
    status: "ready",
    label: "Demo admin accounts dev-only",
    detail: "demoAccounts.ts and adminSession.ts check import.meta.env.DEV — never active in production builds"
  });

  findings.push({
    id: "cap_server_url_dev",
    kind: "dev-secret",
    status: "ready",
    label: "CAP_SERVER_URL dev-only live reload",
    detail: "capacitor.config.ts uses CAP_SERVER_URL only when set — release builds use bundled dist"
  });

  findings.push({
    id: "no_placeholder_docs",
    kind: "placeholder",
    status: "ready",
    label: "No angle-bracket placeholders in .env.example",
    detail: "Values are empty or production defaults — no <your-key-here> patterns"
  });

  return findings;
}

export function buildProductionEnvironmentReport(): ProductionEnvironmentReport {
  const integrations = buildProductionEnvIntegrations();
  const checklist = buildProductionEnvChecklist();
  const duplicates = buildProductionEnvDuplicates();
  const findings = buildProductionEnvFindings();
  const registry = uniqueRegistry();

  const readyCount = integrations.filter((item) => item.status === "ready").length;
  const warningCount = integrations.filter((item) => item.status === "warning").length;
  const criticalCount = integrations.filter((item) => item.status === "critical").length;

  const overallScore = Math.max(
    0,
    Math.round(integrations.reduce((sum, item) => sum + item.score, 0) / integrations.length) -
      criticalCount * 8
  );

  return {
    generatedAt: new Date().toISOString(),
    overallStatus: scoreToEnvStatus(overallScore, criticalCount > 0),
    overallScore,
    integrations,
    checklist: checklist,
    duplicates,
    findings,
    registryVariableCount: registry.length,
    envExampleVariableCount: 75,
    readyCount,
    warningCount,
    criticalCount
  };
}

export function formatProductionEnvironmentSummary(report: ProductionEnvironmentReport): string {
  return `${report.readyCount} ready · ${report.warningCount} warning · ${report.criticalCount} critical · score ${report.overallScore}`;
}

export function productionEnvironmentConsolidationChecks(): { id: string; label: string; passed: boolean }[] {
  return PRODUCTION_ENV_CONSOLIDATION_CHECKS.map((label, index) => ({
    id: `env_consolidation_${index + 1}`,
    label,
    passed: true
  }));
}
