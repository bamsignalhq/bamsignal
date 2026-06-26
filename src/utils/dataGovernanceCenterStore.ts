import type {
  DataGovernanceAuditActionId,
  DataGovernanceToolId
} from "../constants/dataGovernanceCenter";
import {
  AUDIT_EXPORT_SEED,
  CONSENT_RECORD_SEED,
  DATA_INVENTORY_SEED,
  GOVERNANCE_AUDIT_SEED,
  LEGAL_HOLD_SEED,
  POLICY_VERSION_SEED,
  PRIVACY_REQUEST_SEED,
  REGIONAL_POLICY_SEED,
  RETENTION_POLICY_SEED,
  SENSITIVE_DATA_REGISTER_SEED
} from "../data/dataGovernanceCenterSeed";
import type {
  AuditExportRecord,
  ConsentRecord,
  GovernanceAuditRecord,
  PrivacyRequestRecord
} from "../types/dataGovernanceCenter";
import { appendAuditCenterEvent } from "./auditCenterEngine";
import {
  buildGovernanceToolDetail,
  completePrivacyRequest,
  mapGovernanceToolToAuditAction,
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
  legalHolds: typeof LEGAL_HOLD_SEED;
  policyVersions: typeof POLICY_VERSION_SEED;
  governanceAudit: typeof GOVERNANCE_AUDIT_SEED;
  auditExports: typeof AUDIT_EXPORT_SEED;
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
    legalHolds: [...LEGAL_HOLD_SEED],
    policyVersions: [...POLICY_VERSION_SEED],
    governanceAudit: [...GOVERNANCE_AUDIT_SEED],
    auditExports: [...AUDIT_EXPORT_SEED],
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

function appendGovernanceAudit(
  state: DataGovernanceCenterState,
  record: GovernanceAuditRecord
): void {
  state.governanceAudit = [record, ...state.governanceAudit].slice(0, 200);
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

export function listLegalHolds() {
  return loadState().legalHolds;
}

export function listPolicyVersions() {
  return loadState().policyVersions;
}

export function listGovernanceAudit() {
  return loadState().governanceAudit;
}

export function listAuditExports() {
  return loadState().auditExports;
}

export function completeDataGovernancePrivacyRequest(
  requestId: string,
  actor: string
): PrivacyRequestRecord | null {
  const state = loadState();
  const index = state.privacyRequests.findIndex((item) => item.id === requestId);
  if (index < 0) return null;
  state.privacyRequests[index] = completePrivacyRequest(state.privacyRequests[index], actor);
  appendGovernanceAudit(state, {
    id: `ga-${Date.now()}`,
    action: "approved",
    actor,
    target: state.privacyRequests[index].requestRef,
    at: new Date().toISOString(),
    detail: `Privacy request ${state.privacyRequests[index].requestRef} completed`
  });
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
  appendGovernanceAudit(state, {
    id: `ga-${Date.now()}`,
    action: "approved",
    actor,
    target: state.consentRecords[index].consentRef,
    at: new Date().toISOString(),
    detail: `Consent ${state.consentRecords[index].consentRef} withdrawn`
  });
  saveState(state);
  logDataGovernanceAudit(
    "consent-withdrawn",
    `${state.consentRecords[index].consentRef} by ${actor}`,
    state.consentRecords[index].consentRef
  );
  return state.consentRecords[index];
}

export function applyDataGovernanceTool(input: {
  toolId: DataGovernanceToolId;
  target: string;
  actor: string;
}): GovernanceAuditRecord {
  const state = loadState();
  const action = mapGovernanceToolToAuditAction(input.toolId);
  const detail = buildGovernanceToolDetail(input.toolId, input.target, input.actor);
  const record: GovernanceAuditRecord = {
    id: `ga-${Date.now()}`,
    action,
    actor: input.actor,
    target: input.target,
    at: new Date().toISOString(),
    detail
  };
  appendGovernanceAudit(state, record);

  if (input.toolId === "export-member") {
    const exportRecord: AuditExportRecord = {
      id: `ae-${Date.now()}`,
      exportRef: `AEX-${new Date().getFullYear()}-${String(state.auditExports.length + 1).padStart(4, "0")}`,
      scope: `Member data export — ${input.target}`,
      requestedBy: input.actor,
      generatedAt: new Date().toISOString(),
      recordCount: 1,
      format: "JSON"
    };
    state.auditExports = [exportRecord, ...state.auditExports].slice(0, 100);
  }

  if (input.toolId === "policy-versions") {
    const nextVersion =
      Math.max(0, ...state.policyVersions.map((item) => item.version)) + 1;
    state.policyVersions = [
      {
        id: `pv-${Date.now()}`,
        policyRef: `POL-PRIV-${String(nextVersion).padStart(3, "0")}`,
        name: "BamSignal Privacy Policy",
        version: nextVersion,
        publishedAt: new Date().toISOString(),
        publishedBy: input.actor,
        active: true
      },
      ...state.policyVersions.map((item) =>
        item.name === "BamSignal Privacy Policy" ? { ...item, active: false } : item
      )
    ];
  }

  saveState(state);
  logDataGovernanceAudit(
    "privacy-request-opened",
    `${input.toolId} on ${input.target} by ${input.actor}`,
    input.target
  );
  return record;
}

export function recordGovernanceCenterAccess(actor: string): void {
  const state = loadState();
  appendGovernanceAudit(state, {
    id: `ga-${Date.now()}`,
    action: "accessed",
    actor,
    target: "data-governance-center",
    at: new Date().toISOString(),
    detail: "Data Governance & Privacy Center accessed"
  });
  saveState(state);
}
