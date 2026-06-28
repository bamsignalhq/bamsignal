/**
 * BamSignal external dependency definitions — lifecycle hooks only (no import-time init).
 */
import { config } from "../config.js";
import { getDatabaseStatus } from "../db.js";
import { featureStateFromClassification } from "../../shared/serviceRegistry/featureState.mjs";
import { evaluateFeature, STARTUP_FEATURE_DEFINITIONS } from "../../shared/environmentClassification.mjs";
import { isSendchampConfigured } from "./sendchamp.js";
import { isPhotoStorageConfigured } from "./photoStorage.js";
import { isFirebaseConfigured } from "../firebaseEnv.js";

function envOnlyState(featureId) {
  return (env = process.env) => featureStateFromClassification(featureId, env);
}

function envHealth(featureId) {
  return (env = process.env) => {
    const definition = STARTUP_FEATURE_DEFINITIONS.find((item) => item.id === featureId);
    if (!definition) return { ok: false, reason: "unknown feature" };
    const evaluated = evaluateFeature(definition, env);
    return { ok: evaluated.healthy, reason: evaluated.reason };
  };
}

function envReady(featureId) {
  return (env = process.env) => featureStateFromClassification(featureId, env) === "enabled";
}

/** @returns {import("../../shared/serviceRegistry/ServiceRegistry.mjs").ServiceDefinition[]} */
export function buildServiceDefinitions() {
  return [
    {
      id: "database",
      label: "Database",
      tier: "critical",
      productFeature: "Core Platform",
      shutdownPriority: 100,
      evaluateFeatureState: envOnlyState("database"),
      async initialize() {
        const { initDatabase } = await import("../db.js");
        await initDatabase();
      },
      async health() {
        const { getDatabaseStatus, pingDatabase } = await import("../db.js");
        let status = getDatabaseStatus();
        if (status === "connected") {
          const alive = await pingDatabase();
          status = alive ? "connected" : "disconnected";
        }
        return {
          ok: status === "connected",
          reason: status === "connected" ? "connected" : status
        };
      },
      ready(env = process.env) {
        if (featureStateFromClassification("database", env) !== "enabled") return false;
        return getDatabaseStatus() === "connected";
      },
      async shutdown() {
        const { closeDatabase } = await import("../db.js");
        await closeDatabase();
      },
      metadata() {
        return { provider: "postgres", ssl: process.env.PGSSLMODE !== "disable" };
      }
    },
    {
      id: "supabase",
      label: "Supabase",
      tier: "critical",
      productFeature: "Auth & Storage",
      dependsOn: ["database"],
      shutdownPriority: 200,
      evaluateFeatureState: envOnlyState("supabase"),
      health: envHealth("supabase"),
      ready: envReady("supabase"),
      metadata() {
        return { urlConfigured: Boolean(process.env.SUPABASE_URL?.trim()) };
      }
    },
    {
      id: "application",
      label: "Application URL",
      tier: "critical",
      productFeature: "Core Platform",
      evaluateFeatureState: envOnlyState("application"),
      health: envHealth("application"),
      ready: envReady("application")
    },
    {
      id: "payments",
      label: "Paystack",
      tier: "critical",
      productFeature: "Payments",
      evaluateFeatureState: envOnlyState("payments"),
      health() {
        const configured = Boolean(config.paystackSecretKey && config.paystackPublicKey);
        return { ok: configured, reason: configured ? "configured" : "paystack keys missing" };
      },
      ready() {
        return Boolean(config.paystackSecretKey && config.paystackPublicKey);
      },
      metadata() {
        return {
          hasSecretKey: Boolean(config.paystackSecretKey),
          hasPublicKey: Boolean(config.paystackPublicKey)
        };
      }
    },
    {
      id: "admin-auth",
      label: "Command Center",
      tier: "critical",
      productFeature: "Admin Operations",
      evaluateFeatureState: envOnlyState("admin-auth"),
      health: envHealth("admin-auth"),
      ready: envReady("admin-auth")
    },
    {
      id: "operations",
      label: "Cron & Diagnostics",
      tier: "critical",
      productFeature: "Operations",
      evaluateFeatureState: envOnlyState("operations"),
      health: envHealth("operations"),
      ready: envReady("operations")
    },
    {
      id: "storage",
      label: "Photo Storage",
      tier: "important",
      productFeature: "Member Photos",
      dependsOn: ["supabase"],
      evaluateFeatureState: envOnlyState("photo-storage"),
      health() {
        const ok = isPhotoStorageConfigured();
        return { ok, reason: ok ? "supabase storage available" : "storage credentials missing" };
      },
      ready() {
        return isPhotoStorageConfigured();
      }
    },
    {
      id: "resend",
      label: "Resend Email",
      tier: "important",
      productFeature: "Signup Email",
      evaluateFeatureState: envOnlyState("email"),
      health() {
        const ok = Boolean(process.env.RESEND_API_KEY?.trim());
        return { ok, reason: ok ? "configured" : "RESEND_API_KEY missing" };
      },
      ready() {
        return Boolean(process.env.RESEND_API_KEY?.trim());
      }
    },
    {
      id: "sendchamp",
      label: "Sendchamp WhatsApp",
      tier: "important",
      productFeature: "WhatsApp Verification",
      evaluateFeatureState: envOnlyState("whatsapp"),
      health() {
        const ok = isSendchampConfigured();
        return { ok, reason: ok ? "configured" : "sendchamp credentials missing" };
      },
      ready() {
        return isSendchampConfigured();
      }
    },
    {
      id: "firebase",
      label: "Firebase Push",
      tier: "important",
      productFeature: "Push Notifications",
      evaluateFeatureState: envOnlyState("firebase"),
      async health() {
        const { getFirebaseHealth } = await import("../firebase.js");
        const health = getFirebaseHealth();
        return {
          ok: Boolean(health.firebase),
          reason: health.firebase ? "configured" : "firebase credentials missing"
        };
      },
      ready() {
        return isFirebaseConfigured();
      }
    },
    {
      id: "google-calendar",
      label: "Google Calendar",
      tier: "optional",
      productFeature: "Calendar Sync",
      evaluateFeatureState: envOnlyState("google-calendar"),
      health: envHealth("google-calendar"),
      ready: envReady("google-calendar")
    },
    {
      id: "zoom",
      label: "Zoom",
      tier: "optional",
      productFeature: "Zoom Meetings",
      evaluateFeatureState: envOnlyState("zoom"),
      health: envHealth("zoom"),
      ready: envReady("zoom")
    },
    {
      id: "google-meet",
      label: "Google Meet",
      tier: "optional",
      productFeature: "Meet Links",
      evaluateFeatureState: envOnlyState("google-meet"),
      health: envHealth("google-meet"),
      ready: envReady("google-meet")
    },
    {
      id: "openai",
      label: "OpenAI",
      tier: "optional",
      productFeature: "AI Workspace",
      evaluateFeatureState: envOnlyState("openai"),
      health: envHealth("openai"),
      ready: envReady("openai")
    },
    {
      id: "telegram",
      label: "Telegram",
      tier: "optional",
      productFeature: "Telegram Bot",
      evaluateFeatureState: envOnlyState("telegram"),
      health() {
        const ok = Boolean(config.telegram?.botToken);
        return { ok, reason: ok ? "configured" : "TELEGRAM_BOT_TOKEN missing" };
      },
      ready() {
        return Boolean(config.telegram?.botToken);
      },
      shutdownPriority: 900,
      async shutdown() {
        const { bot } = await import("../telegram.js");
        if (bot && typeof bot.stop === "function") {
          await bot.stop("registry_shutdown");
        }
      }
    },
    {
      id: "background-workers",
      label: "Background Workers",
      tier: "runtime",
      productFeature: "Operations",
      dependsOn: ["database"],
      shutdownPriority: 800,
      evaluateFeatureState(env = process.env) {
        return env.DATABASE_URL?.trim() ? "enabled" : "disabled";
      },
      async initialize() {
        const { startRateLimitRetentionScheduler } = await import("./rateLimitRetention.js");
        startRateLimitRetentionScheduler();
      },
      health() {
        return { ok: true, reason: "scheduler registered at initialize" };
      },
      ready() {
        return true;
      },
      async shutdown() {
        const { stopRateLimitRetentionScheduler } = await import("./rateLimitRetention.js");
        stopRateLimitRetentionScheduler();
      }
    },
    {
      id: "notification-queue",
      label: "Notification Queue",
      tier: "runtime",
      productFeature: "Notifications",
      dependsOn: ["database"],
      shutdownPriority: 750,
      evaluateFeatureState(env = process.env) {
        return env.DATABASE_URL?.trim() ? "enabled" : "disabled";
      },
      health() {
        return { ok: true, reason: "database-backed queue (inline processing)" };
      },
      ready() {
        return true;
      }
    },
    {
      id: "http-server",
      label: "HTTP Server",
      tier: "runtime",
      productFeature: "Core Platform",
      shutdownPriority: 1000,
      evaluateFeatureState() {
        return "enabled";
      },
      health() {
        return { ok: true, reason: "listening" };
      },
      ready() {
        return true;
      },
      shutdown() {
        const { getHttpServer } = requireHttpRuntime();
        const server = getHttpServer();
        if (!server) return;
        return new Promise((resolve, reject) => {
          server.close((error) => {
            if (error) reject(error);
            else resolve();
          });
        });
      }
    }
  ];
}

/** @type {import("node:http").Server|null} */
let httpServer = null;

/** @param {import("node:http").Server|null} server */
export function setHttpServerForRegistry(server) {
  httpServer = server;
}

export function getHttpServerForRegistry() {
  return httpServer;
}

function requireHttpRuntime() {
  return { getHttpServer: getHttpServerForRegistry };
}
