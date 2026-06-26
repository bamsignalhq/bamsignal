import type {
  ConsentRecord,
  DataGovernanceSummary,
  DataInventoryItem,
  GovernanceAuditRecord,
  LegalHoldRecord,
  PolicyVersionRecord,
  PrivacyRequestRecord,
  RetentionPolicyRecord
} from "../types/dataGovernanceCenter";
import type {
  DataGovernanceAreaId,
  DataGovernanceModuleId,
  DataGovernanceToolId,
  GovernanceTrailActionId
} from "../constants/dataGovernanceCenter";

export function buildDataGovernanceSummary(
  inventory: DataInventoryItem[],
  retentionPolicies: RetentionPolicyRecord[],
  privacyRequests: PrivacyRequestRecord[],
  consentRecords: ConsentRecord[],
  regionalPolicies: { active: boolean }[],
  sensitiveRegisters: unknown[],
  legalHolds: LegalHoldRecord[],
  auditExports: unknown[],
  policyVersions: PolicyVersionRecord[],
  governanceAudit: GovernanceAuditRecord[]
): DataGovernanceSummary {
  const openPrivacyRequests = privacyRequests.filter(
    (item) => !["completed", "rejected"].includes(item.status)
  ).length;
  const activeConsents = consentRecords.filter((item) => item.status === "active").length;
  const withdrawnConsents = consentRecords.filter((item) => item.status === "withdrawn").length;
  const highlyConfidentialCount = inventory.filter(
    (item) => item.dataClass === "highly-confidential" || item.dataClass === "restricted"
  ).length;

  return {
    inventoryCount: inventory.length,
    activeRetentionPolicies: retentionPolicies.filter((item) => item.active).length,
    openPrivacyRequests,
    activeConsents,
    withdrawnConsents,
    regionalPolicies: regionalPolicies.filter((item) => item.active).length,
    sensitiveRegisters: sensitiveRegisters.length,
    highlyConfidentialCount,
    activeLegalHolds: legalHolds.filter((item) => item.active).length,
    auditExportCount: auditExports.length,
    policyVersionCount: policyVersions.filter((item) => item.active).length,
    governanceAuditCount: governanceAudit.length
  };
}

export function filterInventoryByArea(
  inventory: DataInventoryItem[],
  areaId: DataGovernanceAreaId
): DataInventoryItem[] {
  if (areaId === "inventory" || areaId === "classification") return inventory;
  if (areaId === "sensitive") {
    return inventory.filter((item) => item.containsSensitive || item.containsPii);
  }
  return inventory;
}

export function filterPrivacyRequestsByArea(
  requests: PrivacyRequestRecord[],
  areaId: DataGovernanceAreaId
): PrivacyRequestRecord[] {
  if (areaId === "privacy") {
    return requests.filter(
      (item) =>
        item.requestType === "correct" || item.requestType === "processing-restriction"
    );
  }
  if (areaId === "deletion") {
    return requests.filter((item) => item.requestType === "delete");
  }
  if (areaId === "export") {
    return requests.filter((item) => item.requestType === "download");
  }
  if (areaId === "consent") {
    return requests.filter((item) => item.requestType === "consent-withdrawal");
  }
  return requests;
}

export function filterDeletionRequests(requests: PrivacyRequestRecord[]) {
  return requests.filter((item) => item.requestType === "delete");
}

export function filterExportRequests(requests: PrivacyRequestRecord[]) {
  return requests.filter((item) => item.requestType === "download");
}

export function filterGeneralPrivacyRequests(requests: PrivacyRequestRecord[]) {
  return requests.filter(
    (item) =>
      item.requestType === "correct" ||
      item.requestType === "processing-restriction" ||
      item.requestType === "consent-withdrawal"
  );
}

export function mapGovernanceToolToAuditAction(toolId: DataGovernanceToolId): GovernanceTrailActionId {
  if (toolId === "export-member") return "exported";
  if (toolId === "delete-member" || toolId === "anonymize") return "deleted";
  if (toolId === "policy-versions") return "approved";
  return "accessed";
}

export function buildGovernanceToolDetail(
  toolId: DataGovernanceToolId,
  target: string,
  actor: string
): string {
  const labels: Record<DataGovernanceToolId, string> = {
    "export-member": `Member export package generated for ${target}`,
    "delete-member": `Member deletion processed for ${target}`,
    anonymize: `Member PII anonymized for ${target}`,
    "retention-rules": `Retention rules reviewed by ${actor}`,
    "policy-versions": `Policy version workflow initiated by ${actor}`
  };
  return labels[toolId];
}

export function appendConsentAudit(
  consent: ConsentRecord,
  actor: string,
  action: string
): ConsentRecord {
  return {
    ...consent,
    auditTrail: [...consent.auditTrail, { at: new Date().toISOString(), actor, action }]
  };
}

export function withdrawConsent(consent: ConsentRecord, actor: string): ConsentRecord {
  if (consent.status === "withdrawn") {
    throw new Error("Data governance violation: consent already withdrawn");
  }
  return appendConsentAudit(
    {
      ...consent,
      status: "withdrawn",
      withdrawnAt: new Date().toISOString()
    },
    actor,
    "consent withdrawn"
  );
}

export function completePrivacyRequest(
  request: PrivacyRequestRecord,
  actor: string
): PrivacyRequestRecord {
  if (request.status === "completed") {
    throw new Error("Data governance violation: request already completed");
  }
  return {
    ...request,
    status: "completed",
    completedAt: new Date().toISOString(),
    assignedTo: request.assignedTo ?? actor
  };
}

export function listOpenPrivacyRequests(requests: PrivacyRequestRecord[]) {
  return requests.filter((item) => !["completed", "rejected"].includes(item.status));
}

export function listActiveConsents(consents: ConsentRecord[]) {
  return consents.filter((item) => item.status === "active");
}

export function formatDataGovernanceSummaryLine(summary: DataGovernanceSummary) {
  return `${summary.openPrivacyRequests} open requests · ${summary.activeLegalHolds} legal holds · ${summary.auditExportCount} audit exports · ${summary.governanceAuditCount} audit events`;
}

export function moduleShowsConsent(moduleId: DataGovernanceModuleId) {
  return moduleId === "consent-management";
}

export function moduleShowsRetention(moduleId: DataGovernanceModuleId) {
  return moduleId === "data-retention";
}
