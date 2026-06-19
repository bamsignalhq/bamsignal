import type { ComplianceAckType } from "../constants/compliance";

export const FLOW_STATE_KEY = "bamsignal_flow_state";

export type FlowName =
  | "signup_otp"
  | "onboarding"
  | "compliance_pledge"
  | "adult_risk_modal"
  | "offline_safety_modal"
  | "payment_initializing"
  | "profile_hydrate"
  | "photo_upload";

export type FlowState = {
  flowName: FlowName;
  startedAt: string;
  updatedAt: string;
  attempts: number;
  userId?: string;
  route: string;
};

export const FLOW_TIMEOUT_MS: Record<FlowName, number> = {
  signup_otp: 120_000,
  onboarding: 180_000,
  compliance_pledge: 90_000,
  adult_risk_modal: 90_000,
  offline_safety_modal: 90_000,
  payment_initializing: 30_000,
  profile_hydrate: 20_000,
  photo_upload: 60_000
};

function readRaw(): FlowState | null {
  try {
    const raw = localStorage.getItem(FLOW_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FlowState;
    if (!parsed?.flowName || !parsed.startedAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function startFlowState(
  flowName: FlowName,
  route: string,
  userId?: string
): FlowState {
  const now = new Date().toISOString();
  const prior = readRaw();
  const next: FlowState = {
    flowName,
    startedAt: prior?.flowName === flowName ? prior.startedAt : now,
    updatedAt: now,
    attempts: prior?.flowName === flowName ? prior.attempts + 1 : 1,
    userId,
    route
  };
  try {
    localStorage.setItem(FLOW_STATE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  logFlowWatchdog("start", { flowName, route, attempts: next.attempts });
  return next;
}

export function touchFlowState(): void {
  const current = readRaw();
  if (!current) return;
  const next = { ...current, updatedAt: new Date().toISOString() };
  try {
    localStorage.setItem(FLOW_STATE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function clearFlowState(): void {
  try {
    localStorage.removeItem(FLOW_STATE_KEY);
  } catch {
    /* ignore */
  }
  logFlowWatchdog("clear");
}

export function readFlowState(): FlowState | null {
  return readRaw();
}

export function isFlowStuck(flowName: FlowName, timeoutMs = FLOW_TIMEOUT_MS[flowName]): boolean {
  const state = readRaw();
  if (!state || state.flowName !== flowName) return false;
  const elapsed = Date.now() - new Date(state.updatedAt).getTime();
  return elapsed >= timeoutMs;
}

export function clearFlowCompletionKeys(): void {
  const keys = [
    "bamsignal_onboarding_step",
    "bamsignal-onboarding-step",
    "bamsignal_onboarding_draft",
    "bamsignal-onboarding-draft",
    "bamsignal_signup_draft",
    "bamsignal-signup-draft",
    "bamsignal_setup_step",
    "bamsignal_current_step",
    "bamsignal_profile_draft",
    "bamsignal_compliance_pending_old",
    FLOW_STATE_KEY
  ];
  for (const key of keys) {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}

export function logFlowWatchdog(event: string, detail?: Record<string, unknown>): void {
  if (!import.meta.env.DEV) return;
  if (detail) {
    console.info(`[flow-watchdog] ${event}`, detail);
  } else {
    console.info(`[flow-watchdog] ${event}`);
  }
}

export type FlowRepairPayload = {
  currentRoute?: string;
  flowName?: FlowName;
  clientState?: {
    compliancePhase?: string;
    complianceSyncPending?: boolean;
    pendingAcks?: ComplianceAckType[];
    profileComplete?: boolean;
  };
};
