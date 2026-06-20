import type { ComplianceAckType } from "../constants/compliance";
import type { MemberCompliance, UserProfile } from "../types";
import { STORAGE_KEYS } from "../constants/limits";
import {
  allGateAckTypes,
  buildCompliancePatch,
  clearComplianceSyncPending,
  hasComplianceDoneMarker,
  isComplianceComplete,
  isComplianceCompleteForUser,
  logComplianceSave,
  mergeMemberCompliance,
  normalizeCompliance,
  readPendingComplianceAcks,
  resolveComplianceUserKey,
  setComplianceSyncPending,
  writeComplianceDoneMarker
} from "../utils/compliance";
import { clearFlowCompletionKeys, clearFlowState } from "../utils/flowWatchdog";
import { getDatingProfile, normalizeDatingProfile } from "../utils/profile";
import { readJson, writeJson } from "../utils/storage";
import { apiUrl } from "./supabase";
import { readResponseJson } from "../utils/httpJson";

type ComplianceResponse = {
  ok?: boolean;
  compliance?: MemberCompliance;
  error?: string;
  dryRun?: boolean;
};

export function persistLocalCompliance(compliance: MemberCompliance): boolean {
  const profile = normalizeDatingProfile(readJson(STORAGE_KEYS.datingProfile, {}));
  return writeJson(STORAGE_KEYS.datingProfile, {
    ...profile,
    compliance: normalizeCompliance(compliance)
  });
}

export function mergeLocalCompliance(
  ackTypes: ComplianceAckType[],
  serverMeta?: MemberCompliance
): MemberCompliance {
  const profile = getDatingProfile();
  const next = buildCompliancePatch(profile.compliance, ackTypes, serverMeta);
  persistLocalCompliance(next);
  return next;
}

export function clearComplianceFlowState(): void {
  clearComplianceSyncPending();
  clearFlowState();
  clearFlowCompletionKeys();
}

function maybeWriteComplianceDoneMarker(user: Pick<UserProfile, "email" | "phone" | "username">): void {
  const userKey = resolveComplianceUserKey(user);
  if (!userKey) return;
  if (isComplianceCompleteForUser(getDatingProfile().compliance, userKey)) {
    writeComplianceDoneMarker(userKey);
  }
}

/** Restore local compliance from durable per-user marker after logout/session clear. */
export function restoreComplianceFromMarker(
  user: Pick<UserProfile, "email" | "phone" | "username">
): MemberCompliance | null {
  const userKey = resolveComplianceUserKey(user);
  if (!userKey || !hasComplianceDoneMarker(userKey)) return null;
  if (isComplianceComplete(getDatingProfile().compliance)) {
    writeComplianceDoneMarker(userKey);
    return getDatingProfile().compliance ?? null;
  }
  const compliance = mergeLocalCompliance(allGateAckTypes());
  writeComplianceDoneMarker(userKey);
  return compliance;
}

export async function saveComplianceAcknowledgements(
  user: Pick<UserProfile, "email" | "phone">,
  ackTypes: ComplianceAckType[],
  options?: { skipOptimistic?: boolean }
): Promise<{ ok: boolean; compliance?: MemberCompliance; error?: string }> {
  if (!ackTypes.length) {
    return { ok: false, error: "No acknowledgements provided." };
  }

  let optimistic: MemberCompliance | undefined;
  if (!options?.skipOptimistic) {
    optimistic = mergeLocalCompliance(ackTypes);
    logComplianceSave({ ackTypes, stage: "optimistic", phase: "local" });
    if (optimistic && isComplianceComplete(optimistic)) {
      maybeWriteComplianceDoneMarker(user);
    }
  }

  try {
    const response = await fetch(apiUrl("/api/member/data?action=compliance-ack"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        phone: user.phone,
        acks: ackTypes.map((type) => ({ type }))
      })
    });
    const payload = await readResponseJson<ComplianceResponse>(response);
    if (!response.ok || !payload?.ok) {
      setComplianceSyncPending(ackTypes);
      logComplianceSave({
        ackTypes,
        stage: "error",
        status: response.status,
        error: payload?.error || "Compliance save failed."
      });
      return {
        ok: false,
        error: payload?.error || "Compliance save failed.",
        compliance: optimistic ?? getDatingProfile().compliance
      };
    }

    const compliance = mergeLocalCompliance(
      ackTypes,
      normalizeCompliance(payload.compliance)
    );
    if (isComplianceComplete(compliance)) {
      clearComplianceFlowState();
      maybeWriteComplianceDoneMarker(user);
    }
    logComplianceSave({ ackTypes, stage: "success", complete: isComplianceComplete(compliance) });
    return { ok: true, compliance };
  } catch (error) {
    setComplianceSyncPending(ackTypes);
    logComplianceSave({
      ackTypes,
      stage: "exception",
      error: error instanceof Error ? error.message : "Compliance save failed."
    });
    return {
      ok: false,
      error: "Compliance save failed.",
      compliance: optimistic ?? getDatingProfile().compliance
    };
  }
}

export async function retryPendingComplianceSync(
  user: Pick<UserProfile, "email" | "phone">
): Promise<boolean> {
  const pending = readPendingComplianceAcks();
  if (!pending.length) {
    clearComplianceSyncPending();
    return false;
  }
  const result = await saveComplianceAcknowledgements(user, pending, { skipOptimistic: true });
  if (result.ok && result.compliance && isComplianceComplete(result.compliance)) {
    clearComplianceFlowState();
    maybeWriteComplianceDoneMarker(user);
    return true;
  }
  return result.ok;
}

export function applyLocalComplianceFallback(
  ackTypes: ComplianceAckType[]
): MemberCompliance {
  const compliance = mergeLocalCompliance(ackTypes);
  setComplianceSyncPending(ackTypes);
  return compliance;
}

export function mergeHydratedCompliance(
  localCompliance: unknown,
  remoteCompliance: unknown
): MemberCompliance {
  return mergeMemberCompliance(localCompliance, remoteCompliance);
}

export function syncComplianceDoneMarkerFromProfile(
  user: Pick<UserProfile, "email" | "phone" | "username">,
  compliance?: MemberCompliance
): void {
  const userKey = resolveComplianceUserKey(user);
  if (!userKey) return;
  if (isComplianceComplete(compliance) || hasComplianceDoneMarker(userKey)) {
    writeComplianceDoneMarker(userKey);
  }
}
