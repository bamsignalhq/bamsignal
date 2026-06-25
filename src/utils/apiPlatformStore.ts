import type { ApiPlatformAuditActionId } from "../constants/apiPlatform";
import {
  API_CATALOG_SEED,
  API_CLIENT_SEED,
  API_KEY_SEED,
  API_RATE_LIMIT_SEED,
  API_USAGE_SEED,
  API_WEBHOOK_SEED
} from "../data/apiPlatformSeed";
import type { ApiKeyRecord } from "../types/apiPlatform";
import { appendAuditCenterEvent } from "./auditCenterEngine";
import { revokeApiKey, rotateApiKey } from "./apiPlatformLogic";
import { readJson, writeJson } from "./storage";

const STORAGE_KEY = "bamsignal.apiPlatform.v1";

type ApiPlatformState = {
  catalog: typeof API_CATALOG_SEED;
  clients: typeof API_CLIENT_SEED;
  keys: typeof API_KEY_SEED;
  webhooks: typeof API_WEBHOOK_SEED;
  rateLimits: typeof API_RATE_LIMIT_SEED;
  usage: typeof API_USAGE_SEED;
  updatedAt: string;
};

function defaultState(): ApiPlatformState {
  return {
    catalog: [...API_CATALOG_SEED],
    clients: [...API_CLIENT_SEED],
    keys: [...API_KEY_SEED],
    webhooks: [...API_WEBHOOK_SEED],
    rateLimits: [...API_RATE_LIMIT_SEED],
    usage: [...API_USAGE_SEED],
    updatedAt: new Date().toISOString()
  };
}

function loadState(): ApiPlatformState {
  const stored = readJson<ApiPlatformState>(STORAGE_KEY, defaultState());
  if (!stored?.catalog?.length) return defaultState();
  return { ...defaultState(), ...stored };
}

function saveState(state: ApiPlatformState): void {
  writeJson(STORAGE_KEY, { ...state, updatedAt: new Date().toISOString() });
}

function logApiPlatformAudit(action: ApiPlatformAuditActionId, detail: string, entityRef: string): void {
  appendAuditCenterEvent({
    actor: "api-platform",
    role: "Operations",
    action: "permissions-updates",
    entity: "permission",
    entityRef,
    result: "success",
    ipPlaceholder: "—",
    detail: `[${action}] ${detail}`
  });
}

export function listApiCatalog() {
  return loadState().catalog;
}

export function listApiClients() {
  return loadState().clients;
}

export function listApiKeys() {
  return loadState().keys;
}

export function listApiWebhooks() {
  return loadState().webhooks;
}

export function listApiRateLimits() {
  return loadState().rateLimits;
}

export function listApiUsageSnapshots() {
  return loadState().usage;
}

export function rotateApiPlatformKey(keyId: string, actor: string): ApiKeyRecord | null {
  const state = loadState();
  const index = state.keys.findIndex((item) => item.id === keyId);
  if (index < 0) return null;
  state.keys[index] = rotateApiKey(state.keys[index]);
  saveState(state);
  logApiPlatformAudit("key-rotated", `${state.keys[index].keyRef} by ${actor}`, state.keys[index].keyRef);
  return state.keys[index];
}

export function revokeApiPlatformKey(keyId: string, actor: string): ApiKeyRecord | null {
  const state = loadState();
  const index = state.keys.findIndex((item) => item.id === keyId);
  if (index < 0) return null;
  state.keys[index] = revokeApiKey(state.keys[index]);
  saveState(state);
  logApiPlatformAudit("key-revoked", `${state.keys[index].keyRef} by ${actor}`, state.keys[index].keyRef);
  return state.keys[index];
}
