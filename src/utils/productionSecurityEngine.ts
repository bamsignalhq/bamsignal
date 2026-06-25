import type { SecurityHealthReport } from "../types/productionSecurity";
import { buildSecurityHealthReport } from "./productionSecurityLogic";
import { buildPermissionsAuditReport } from "./securityAuditReport";

export function buildProductionSecurityReport(): SecurityHealthReport {
  const permissionReport = buildPermissionsAuditReport();
  return buildSecurityHealthReport(permissionReport);
}
