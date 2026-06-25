import type { FounderAcceptanceReport } from "../types/founderAcceptance";
import { buildFounderAcceptanceReport } from "./founderAcceptanceLogic";

export function buildFounderAcceptanceVerification(
  testSuite?: FounderAcceptanceReport["testSuite"]
): FounderAcceptanceReport {
  return buildFounderAcceptanceReport(testSuite);
}
