import type { ReadinessAuditActionId } from "../constants/institutionalReadiness";
import { READINESS_EXPORT_TYPES } from "../constants/institutionalReadiness";
import type {
  InstitutionalReadinessVerificationBundle,
  ReadinessExportRecord,
  ReadinessExportTypeId
} from "../types/institutionalReadiness";
import { appendAuditCenterEvent } from "./auditCenterEngine";
import { buildReadinessExportSummary } from "./institutionalReadinessLogic";
import { readJson, writeJson } from "./storage";

const STORAGE_KEY = "bamsignal.institutionalReadiness.v1";

type InstitutionalReadinessState = {
  previousOverallScore: number;
  exports: ReadinessExportRecord[];
  updatedAt: string;
};

function defaultState(): InstitutionalReadinessState {
  return {
    previousOverallScore: 0,
    exports: [],
    updatedAt: new Date().toISOString()
  };
}

function loadState(): InstitutionalReadinessState {
  return { ...defaultState(), ...readJson<InstitutionalReadinessState>(STORAGE_KEY, defaultState()) };
}

function saveState(state: InstitutionalReadinessState): void {
  writeJson(STORAGE_KEY, { ...state, updatedAt: new Date().toISOString() });
}

function logReadinessAudit(action: ReadinessAuditActionId, detail: string, entityRef: string): void {
  appendAuditCenterEvent({
    actor: "institutional-readiness-audit",
    role: "Operations",
    action: "permissions-updates",
    entity: "permission",
    entityRef,
    result: "success",
    ipPlaceholder: "—",
    detail: `[${action}] ${detail}`
  });
}

export function recordReadinessTrendScore(overallScore: number): number {
  const state = loadState();
  const previous = state.previousOverallScore || overallScore;
  state.previousOverallScore = overallScore;
  saveState(state);
  logReadinessAudit("trend-recorded", `score ${overallScore}`, "TREND");
  return previous;
}

export function listReadinessExports(): ReadinessExportRecord[] {
  return loadState().exports;
}

export function exportReadinessReport(input: {
  exportType: ReadinessExportTypeId;
  bundle: InstitutionalReadinessVerificationBundle;
  actor: string;
}): ReadinessExportRecord {
  const state = loadState();
  const exportMeta = READINESS_EXPORT_TYPES.find((item) => item.id === input.exportType);
  const record: ReadinessExportRecord = {
    id: `rex_${Date.now()}`,
    exportType: input.exportType,
    title: exportMeta?.label ?? input.exportType,
    summary: buildReadinessExportSummary(input.exportType, input.bundle),
    exportedAt: new Date().toISOString(),
    actor: input.actor
  };
  state.exports = [record, ...state.exports].slice(0, 12);
  saveState(state);
  logReadinessAudit("report-exported", `${input.exportType} by ${input.actor}`, record.id);
  return record;
}
