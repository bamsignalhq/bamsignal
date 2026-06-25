import type {
  ConsentRecord,
  DataGovernanceSummary,
  DataInventoryItem,
  PrivacyRequestRecord,
  RetentionPolicyRecord
} from "../types/dataGovernanceCenter";
import type { DataGovernanceAreaId } from "../constants/dataGovernanceCenter";

export function buildDataGovernanceSummary(
  inventory: DataInventoryItem[],
  retentionPolicies: RetentionPolicyRecord[],
  privacyRequests: PrivacyRequestRecord[],
  consentRecords: ConsentRecord[],
  regionalPolicies: { active: boolean }[],
  sensitiveRegisters: unknown[]
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
    highlyConfidentialCount
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
  return `${summary.inventoryCount} inventory · ${summary.openPrivacyRequests} open requests · ${summary.activeConsents} active consents · ${summary.sensitiveRegisters} sensitive registers`;
}
