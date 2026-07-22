import type { AuditEventCategory, AuditTimelineEntry, PassportProductId } from "./types";
import { getPassportId } from "./session";
import type { WorkspaceId } from "../workspaces/types";

const AUDIT_KEY = "stankings-passport-audit-v1";
const MAX_ENTRIES = 200;

function readAudit(): AuditTimelineEntry[] {
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AuditTimelineEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAudit(entries: AuditTimelineEntry[]): void {
  try {
    localStorage.setItem(AUDIT_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    /* ignore quota */
  }
}

export function appendPassportAuditEvent(input: {
  category: AuditEventCategory;
  action: string;
  productId?: PassportProductId;
  workspaceId?: WorkspaceId;
  personaId?: string;
  meta?: Record<string, string | number | boolean | null>;
}): AuditTimelineEntry | null {
  const passportId = getPassportId();
  if (!passportId) return null;
  const entry: AuditTimelineEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    passportId,
    category: input.category,
    action: input.action,
    productId: input.productId ?? "bamsignal",
    workspaceId: input.workspaceId,
    personaId: input.personaId,
    at: new Date().toISOString(),
    meta: input.meta
  };
  const next = [entry, ...readAudit()];
  writeAudit(next);
  return entry;
}

export function getPassportAuditTimeline(limit = 50): AuditTimelineEntry[] {
  return readAudit().slice(0, limit);
}

export function clearPassportAuditTimeline(): void {
  try {
    localStorage.removeItem(AUDIT_KEY);
  } catch {
    /* ignore */
  }
}
