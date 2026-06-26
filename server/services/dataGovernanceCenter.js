/**
 * Data Governance & Privacy Center™ — server-side stewardship logic.
 */

export const DATA_GOVERNANCE_CENTER_DB_TABLES = [
  "data_inventory_items",
  "retention_policies",
  "privacy_requests",
  "consent_records",
  "regional_policies",
  "sensitive_data_registers",
  "legal_holds",
  "policy_versions",
  "governance_audit_log",
  "audit_exports"
];

export const DATA_GOVERNANCE_MODULES = [
  "consent-management",
  "data-retention",
  "deletion-requests",
  "export-requests",
  "privacy-requests",
  "legal-holds",
  "audit-exports"
];

export const DATA_GOVERNANCE_TOOLS = [
  "export-member",
  "delete-member",
  "anonymize",
  "retention-rules",
  "policy-versions"
];

export const GOVERNANCE_TRAIL_ACTIONS = ["accessed", "exported", "deleted", "approved"];

export function getDataGovernanceCenterDatabaseTableManifest() {
  return DATA_GOVERNANCE_CENTER_DB_TABLES.map((tableName) => ({
    tableName,
    domain: "data-governance",
    migrationRef:
      tableName === "legal_holds" ||
      tableName === "policy_versions" ||
      tableName === "governance_audit_log" ||
      tableName === "audit_exports"
        ? "202606261400_data_governance_privacy_center.sql"
        : "202606252700_data_governance_center.sql",
    hasUuidPrimaryKey: true,
    auditFields: ["created_at", "updated_at", "created_by", "updated_by"]
  }));
}

export function canAccessDataGovernanceCenter(permissions = []) {
  return (
    permissions.includes("ManageGovernance") ||
    permissions.includes("SystemAdministration") ||
    permissions.includes("ManageCompliance")
  );
}

export function buildDataGovernanceSummary(
  inventory,
  retentionPolicies,
  privacyRequests,
  consentRecords,
  regionalPolicies,
  sensitiveRegisters,
  legalHolds = [],
  auditExports = [],
  policyVersions = [],
  governanceAudit = []
) {
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

export function filterInventoryByArea(inventory, areaId) {
  if (!areaId || areaId === "inventory" || areaId === "classification") return inventory;
  if (areaId === "sensitive") {
    return inventory.filter((item) => item.containsSensitive || item.containsPii);
  }
  return inventory;
}

export function filterPrivacyRequestsByArea(requests, areaId) {
  if (!areaId || areaId === "privacy") {
    return requests.filter(
      (item) => item.requestType === "correct" || item.requestType === "processing-restriction"
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

export function filterDeletionRequests(requests) {
  return requests.filter((item) => item.requestType === "delete");
}

export function filterExportRequests(requests) {
  return requests.filter((item) => item.requestType === "download");
}

export function mapGovernanceToolToAuditAction(toolId) {
  if (toolId === "export-member") return "exported";
  if (toolId === "delete-member" || toolId === "anonymize") return "deleted";
  if (toolId === "policy-versions") return "approved";
  return "accessed";
}

export function appendConsentAudit(consent, actor, action) {
  return {
    ...consent,
    auditTrail: [
      ...(consent.auditTrail ?? []),
      { at: new Date().toISOString(), actor, action }
    ]
  };
}

export function withdrawConsent(consent, actor) {
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

export function completePrivacyRequest(request, actor) {
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

export function listOpenPrivacyRequests(requests) {
  return requests.filter((item) => !["completed", "rejected"].includes(item.status));
}

export function listActiveConsents(consents) {
  return consents.filter((item) => item.status === "active");
}
