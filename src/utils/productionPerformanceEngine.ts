import type { PerformanceHealthReport } from "../types/productionPerformance";
import { buildPerformanceHealthReport } from "./productionPerformanceLogic";

export function buildProductionPerformanceReport(): PerformanceHealthReport {
  return buildPerformanceHealthReport();
}
