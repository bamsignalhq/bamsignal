import type { DataGovernanceAuditActionId } from "../constants/dataGovernanceCenter";
import {
  CONSENT_RECORD_SEED,
  DATA_INVENTORY_SEED,
  PRIVACY_REQUEST_SEED,
  REGIONAL_POLICY_SEED,
  RETENTION_POLICY_SEED,
  SENSITIVE_DATA_REGISTER_SEED
} from "../data/dataGovernanceCenterSeed";
import type { ConsentRecord, PrivacyRequestRecord } from "../types/dataGovernanceCenter";
import { appendAuditCenterEvent } from "./auditCenterEngine";
import {
  completePrivacyRequest,
  withdrawConsent
} from "./dataGovernanceCenterLogic";
import { readJson, writeJson } from "./storage";

const STORAGE_KEY = "bamsignal.dataGovernanceCenter.v1";

type DataGovernanceCenterState = {
  inventory: typeof DATA_INVENTORY_SEED;
  retentionPolicies: typeof RETENTION_POLICY_SEED;
  privacyRequests: typeof PRIVACY_REQUEST_SEED;
  consentRecords: typeof CONSENT_RECORD_SEED;
  regionalPolicies: typeof REGIONAL_POLICY_SEED;
  sensitiveRegisters: typeof SENSITIVE_DATA_REGISTER_SEED;
  updatedAt: string;
};

function defaultState(): DataGovernanceCenterState {
  return {
    inventory: [...DATA_INVENTORY_SEED],
    retentionPolicies: [...RETENTION_POLICY_SEED],
    privacyRequests: [...PRIVACY_REQUEST_SEED],
    consentRecords: [...CONSENT_RECORD_SEED],
    regionalPolicies: [...REGIONAL_POLICY_SEED],
    sensitiveRegisters: [...SENSITIVE_DATA_REGISTER_SEED],
    updatedAt: new Date().toISOString()
  };
}

function loadState(): DataGovernanceCenterState {
  const stored = readJson<DataGovernanceCenterState>(STORAGE_KEY, defaultState());
  if (!stored?.inventory?.length) return defaultState();
  return { ...defaultState(), ...stored };
}

function saveState(state: DataGovernanceCenterState): void {
  writeJson(STORAGE_KEY, { ...state, updatedAt: new Date().toISOString() });
}

function logDataGovernanceAudit(
  action: DataGovernanceAuditActionId,
  detail: string,
  entityRef: string
): void {
  appendAuditCenterEvent({
    actor: "data-governance-center",
    role: "Governance",
    action: "permissions-updates",
    entity: "permission",
    entityRef,
    result: "success",
    ipPlaceholder: "—",
    detail: `[${action}] ${detail}`
  });
}

export function listDataInventory() {
  return loadState().inventory;
}

export function listRetentionPolicies() {
  return loadState().retentionPolicies;
}

export function listPrivacyRequests() {
  return loadState().privacyRequests;
}

export function listConsentRecords() {
  return loadState().consentRecords;
}

export function listRegionalPolicies() {
  return loadState().regionalPolicies;
}

export function listSensitiveDataRegisters() {
  return loadState().sensitiveRegisters;
}

export function completeDataGovernancePrivacyRequest(
  requestId: string,
  actor: string
): PrivacyRequestRecord | null {
  const state = loadState();
  const index = state.privacyRequests.findIndex((item) => item.id === requestId);
  if (index < 0) return null;
  state.privacyRequests[index] = completePrivacyRequest(state.privacyRequests[index], actor);
  saveState(state);
  logDataGovernanceAudit(
    "privacy-request-completed",
    `${state.privacyRequests[index].requestRef} by ${actor}`,
    state.privacyRequests[index].requestRef
  );
  return state.privacyRequests[index];
}

export function withdrawDataGovernanceConsent(
  consentId: string,
  actor: string
): ConsentRecord | null {
  const state = loadState();
  const index = state.consentRecords.findIndex((item) => item.id === consentId);
  if (index < 0) return null;
  state.consentRecords[index] = withdrawConsent(state.consentRecords[index], actor);
  saveState(state);
  logDataGovernanceAudit(
    "consent-withdrawn",
    `${state.consentRecords[index].consentRef} by ${actor}`,
    state.consentRecords[index].consentRef
  );
  return state.consentRecords[index];
}
