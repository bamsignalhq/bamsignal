/**
 * Singleton service registry bootstrap — registers all BamSignal dependencies.
 */
import {
  createServiceRegistry,
  setGlobalServiceRegistry
} from "../../shared/serviceRegistry/index.mjs";
import { isSignupEmailConfigured } from "../supabaseEnv.js";
import { buildServiceDefinitions } from "./serviceDefinitions.js";

/** @type {import("../../shared/serviceRegistry/ServiceRegistry.mjs").ServiceRegistry|null} */
let registryInstance = null;

export function getServiceRegistry() {
  if (!registryInstance) {
    registryInstance = createServiceRegistry();
    for (const definition of buildServiceDefinitions()) {
      registryInstance.register(definition);
    }
    setGlobalServiceRegistry(registryInstance);
  }
  return registryInstance;
}

export function resetServiceRegistryForTests() {
  registryInstance = null;
  setGlobalServiceRegistry(null);
}

/**
 * @param {Record<string, string|undefined>} [env]
 */
export async function initializeServiceRegistry(env = process.env) {
  const registry = getServiceRegistry();
  return registry.initializeAll(env);
}

/**
 * @param {Record<string, string|undefined>} [env]
 */
export async function registryHealthSnapshot(env = process.env) {
  const registry = getServiceRegistry();
  const health = await registry.healthCheckAll(env);
  const readiness = await registry.isReady(env);
  return {
    health,
    readiness,
    services: registry.snapshot(env),
    timing: registry.startupTimingReport()
  };
}

export function registryFeatureSnapshot(env = process.env) {
  const registry = getServiceRegistry();
  return registry.snapshot(env).map((service) => ({
    id: service.id,
    label: service.label,
    tier: service.tier,
    enabled: service.featureState !== "disabled",
    healthy: service.featureState === "enabled" && service.lastHealth?.ok !== false,
    featureState: service.featureState,
    reason: service.lastHealth?.reason || (service.featureState === "disabled" ? "not configured" : "ok"),
    metrics: service.metrics
  }));
}

/**
 * Admin / observability health snapshot derived from registry state.
 * @param {Record<string, string|undefined>} [env]
 */
export async function buildRegistryAdminHealthSnapshot(env = process.env) {
  const registry = getServiceRegistry();
  await registry.healthCheckAll(env);
  const snapshot = registry.snapshot(env);
  const byId = Object.fromEntries(snapshot.map((service) => [service.id, service]));

  const databaseHealth = byId.database?.lastHealth;
  const databaseStatus =
    databaseHealth?.ok === true
      ? "connected"
      : databaseHealth?.reason === "dry-run"
        ? "dry-run"
        : "disconnected";

  return {
    database: databaseStatus,
    paystack: byId.payments?.featureState === "enabled",
    resend: byId.resend?.featureState === "enabled",
    signupEmail:
      byId.resend?.featureState === "enabled" &&
      byId.supabase?.featureState === "enabled" &&
      isSignupEmailConfigured(),
    sendchamp: byId.sendchamp?.featureState === "enabled",
    firebase: byId.firebase?.featureState === "enabled",
    photoStorage: byId.storage?.featureState === "enabled",
    telegram: byId.telegram?.featureState === "enabled"
  };
}
