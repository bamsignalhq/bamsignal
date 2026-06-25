import type { UxConsistencyReport } from "../types/uxConsistency";
import { buildUxConsistencyReport } from "./uxConsistencyLogic";

export function buildUxConsistencyAudit(): UxConsistencyReport {
  return buildUxConsistencyReport();
}
