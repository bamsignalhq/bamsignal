import { REMEDIATION_STATUS_STORAGE_KEY } from "../constants/remediationBoard";
import { REMEDIATION_FINDINGS_SEED } from "../data/remediationFindingsSeed";
import type {
  RemediationBoardBundle,
  RemediationFinding,
  RemediationStatusId
} from "../types/remediationBoard";
import {
  buildCategorySummaries,
  buildRemediationMetrics,
  sortFindings
} from "./remediationBoardLogic";

type StatusOverrides = Record<string, RemediationStatusId>;

function readStatusOverrides(): StatusOverrides {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(REMEDIATION_STATUS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as StatusOverrides;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStatusOverrides(overrides: StatusOverrides): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REMEDIATION_STATUS_STORAGE_KEY, JSON.stringify(overrides));
}

function materializeFindings(overrides: StatusOverrides): RemediationFinding[] {
  const now = new Date().toISOString();
  return REMEDIATION_FINDINGS_SEED.map((seed) => ({
    ...seed,
    status: overrides[seed.id] ?? seed.defaultStatus,
    updatedAt: now
  }));
}

export function buildRemediationBoardBundle(): RemediationBoardBundle {
  const overrides = readStatusOverrides();
  const findings = sortFindings(materializeFindings(overrides));

  return {
    generatedAt: new Date().toISOString(),
    metrics: buildRemediationMetrics(findings),
    categorySummaries: buildCategorySummaries(findings),
    findings
  };
}

export function updateRemediationFindingStatus(
  findingId: string,
  status: RemediationStatusId
): RemediationBoardBundle {
  const overrides = readStatusOverrides();
  overrides[findingId] = status;
  writeStatusOverrides(overrides);
  return buildRemediationBoardBundle();
}

export function resetRemediationBoardStatuses(): RemediationBoardBundle {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(REMEDIATION_STATUS_STORAGE_KEY);
  }
  return buildRemediationBoardBundle();
}
