import type { DataGovernanceCenterBundle } from "../types/dataGovernanceCenter";
import type { DataGovernanceAreaId } from "../constants/dataGovernanceCenter";
import {
  buildDataGovernanceSummary,
  filterInventoryByArea,
  filterPrivacyRequestsByArea
} from "./dataGovernanceCenterLogic";
import {
  listConsentRecords,
  listDataInventory,
  listPrivacyRequests,
  listRegionalPolicies,
  listRetentionPolicies,
  listSensitiveDataRegisters
} from "./dataGovernanceCenterStore";

export function buildDataGovernanceCenterBundle(
  areaId: DataGovernanceAreaId = "inventory"
): DataGovernanceCenterBundle {
  const inventory = listDataInventory();
  const retentionPolicies = listRetentionPolicies();
  const privacyRequests = listPrivacyRequests();
  const consentRecords = listConsentRecords();
  const regionalPolicies = listRegionalPolicies();
  const sensitiveRegisters = listSensitiveDataRegisters();

  return {
    generatedAt: new Date().toISOString(),
    summary: buildDataGovernanceSummary(
      inventory,
      retentionPolicies,
      privacyRequests,
      consentRecords,
      regionalPolicies,
      sensitiveRegisters
    ),
    inventory: filterInventoryByArea(inventory, areaId),
    retentionPolicies:
      areaId === "retention" || areaId === "inventory" ? retentionPolicies : retentionPolicies,
    privacyRequests: filterPrivacyRequestsByArea(privacyRequests, areaId),
    consentRecords:
      areaId === "consent" || areaId === "inventory" ? consentRecords : consentRecords,
    regionalPolicies:
      areaId === "regional" || areaId === "inventory" ? regionalPolicies : regionalPolicies,
    sensitiveRegisters:
      areaId === "sensitive" || areaId === "inventory" ? sensitiveRegisters : sensitiveRegisters
  };
}
