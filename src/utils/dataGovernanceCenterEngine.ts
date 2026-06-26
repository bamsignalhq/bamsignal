import type { DataGovernanceCenterBundle } from "../types/dataGovernanceCenter";
import type { DataGovernanceModuleId } from "../constants/dataGovernanceCenter";
import {
  buildDataGovernanceSummary,
  filterDeletionRequests,
  filterExportRequests,
  filterGeneralPrivacyRequests
} from "./dataGovernanceCenterLogic";
import {
  listAuditExports,
  listConsentRecords,
  listDataInventory,
  listGovernanceAudit,
  listLegalHolds,
  listPolicyVersions,
  listPrivacyRequests,
  listRegionalPolicies,
  listRetentionPolicies,
  listSensitiveDataRegisters
} from "./dataGovernanceCenterStore";

export function buildDataGovernanceCenterBundle(
  _moduleId: DataGovernanceModuleId = "consent-management"
): DataGovernanceCenterBundle {
  const inventory = listDataInventory();
  const retentionPolicies = listRetentionPolicies();
  const privacyRequests = listPrivacyRequests();
  const consentRecords = listConsentRecords();
  const regionalPolicies = listRegionalPolicies();
  const sensitiveRegisters = listSensitiveDataRegisters();
  const legalHolds = listLegalHolds();
  const policyVersions = listPolicyVersions();
  const governanceAudit = listGovernanceAudit();
  const auditExports = listAuditExports();

  return {
    generatedAt: new Date().toISOString(),
    summary: buildDataGovernanceSummary(
      inventory,
      retentionPolicies,
      privacyRequests,
      consentRecords,
      regionalPolicies,
      sensitiveRegisters,
      legalHolds,
      auditExports,
      policyVersions,
      governanceAudit
    ),
    inventory,
    retentionPolicies,
    privacyRequests,
    deletionRequests: filterDeletionRequests(privacyRequests),
    exportRequests: filterExportRequests(privacyRequests),
    consentRecords,
    regionalPolicies,
    sensitiveRegisters,
    legalHolds,
    policyVersions,
    governanceAudit,
    auditExports
  };
}
