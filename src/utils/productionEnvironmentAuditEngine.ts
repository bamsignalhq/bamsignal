import type { ProductionEnvironmentReport } from "../types/productionEnvironmentAudit";
import { buildProductionEnvironmentReport } from "./productionEnvironmentAuditLogic";

export function buildProductionEnvironmentAudit(): ProductionEnvironmentReport {
  return buildProductionEnvironmentReport();
}
