import {
  NOTIFICATION_ACTION_LOG_SEED,
  NOTIFICATION_AUDIT_SEED,
  NOTIFICATION_TEMPLATE_SEED
} from "../data/notificationCenterSeed";
import type { NotificationAuditRecord, NotificationTemplateRecord } from "../types/notificationReliability";

const STORAGE_KEY = "bamsignal.notificationCenter.v1";

type NotificationCenterStoreState = {
  templates: NotificationTemplateRecord[];
  audit: NotificationAuditRecord[];
  cancelledIds: string[];
  actionLog: typeof NOTIFICATION_ACTION_LOG_SEED;
  updatedAt: string;
};

function readState(): NotificationCenterStoreState {
  if (typeof window === "undefined") {
    return {
      templates: [...NOTIFICATION_TEMPLATE_SEED],
      audit: [...NOTIFICATION_AUDIT_SEED],
      cancelledIds: [],
      actionLog: [...NOTIFICATION_ACTION_LOG_SEED],
      updatedAt: new Date().toISOString()
    };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        templates: [...NOTIFICATION_TEMPLATE_SEED],
        audit: [...NOTIFICATION_AUDIT_SEED],
        cancelledIds: [],
        actionLog: [...NOTIFICATION_ACTION_LOG_SEED],
        updatedAt: new Date().toISOString()
      };
    }
    const parsed = JSON.parse(raw) as NotificationCenterStoreState;
    return {
      templates: Array.isArray(parsed.templates) ? parsed.templates : [...NOTIFICATION_TEMPLATE_SEED],
      audit: Array.isArray(parsed.audit) ? parsed.audit : [...NOTIFICATION_AUDIT_SEED],
      cancelledIds: Array.isArray(parsed.cancelledIds) ? parsed.cancelledIds : [],
      actionLog: Array.isArray(parsed.actionLog) ? parsed.actionLog : [],
      updatedAt: parsed.updatedAt ?? new Date().toISOString()
    };
  } catch {
    return {
      templates: [...NOTIFICATION_TEMPLATE_SEED],
      audit: [...NOTIFICATION_AUDIT_SEED],
      cancelledIds: [],
      actionLog: [...NOTIFICATION_ACTION_LOG_SEED],
      updatedAt: new Date().toISOString()
    };
  }
}

function writeState(state: NotificationCenterStoreState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function listNotificationTemplates(): NotificationTemplateRecord[] {
  return readState().templates;
}

export function listNotificationAudit(): NotificationAuditRecord[] {
  return readState().audit;
}

export function listCancelledMessageIds(): string[] {
  return readState().cancelledIds;
}

export function applyNotificationCenterAction(input: {
  tool: "retry" | "cancel" | "preview" | "duplicate" | "send-test" | "bulk-send";
  messageId: string;
  actor: string;
  detail?: string;
}): void {
  const state = readState();
  const entry = {
    id: `act-${Date.now()}`,
    tool: input.tool,
    messageId: input.messageId,
    actor: input.actor,
    at: new Date().toISOString(),
    detail: input.detail ?? `${input.tool} applied to ${input.messageId}`
  };
  state.actionLog = [entry, ...state.actionLog].slice(0, 200);

  if (input.tool === "cancel" && !state.cancelledIds.includes(input.messageId)) {
    state.cancelledIds = [...state.cancelledIds, input.messageId];
  }

  state.updatedAt = new Date().toISOString();
  writeState(state);
}

export function appendNotificationAudit(record: NotificationAuditRecord): void {
  const state = readState();
  state.audit = [record, ...state.audit].slice(0, 500);
  state.updatedAt = new Date().toISOString();
  writeState(state);
}
