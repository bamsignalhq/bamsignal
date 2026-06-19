import type { ComplianceAckType } from "../constants/compliance";
import { apiUrl } from "./supabase";
import { readResponseJson } from "../utils/httpJson";
import type { MemberCompliance, UserProfile } from "../types";
import type { FlowRepairPayload } from "../utils/flowWatchdog";
import {
  mergeLocalCompliance,
  persistLocalCompliance,
  saveComplianceAcknowledgements
} from "./compliance";
import { normalizeCompliance, setComplianceSyncPending } from "../utils/compliance";

type RepairFlowResponse = {
  ok?: boolean;
  nextRoute?: string;
  repaired?: boolean;
  message?: string;
  compliance?: MemberCompliance;
  error?: string;
};

export async function repairMemberFlow(
  user: Pick<UserProfile, "email" | "phone">,
  payload: FlowRepairPayload
): Promise<RepairFlowResponse> {
  try {
    const response = await fetch(apiUrl("/api/member/data?action=repair-flow"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        phone: user.phone,
        ...payload
      })
    });
    const result = await readResponseJson<RepairFlowResponse>(response);
    if (!response.ok || !result?.ok) {
      if (import.meta.env.DEV) {
        console.info("[repair-flow]", { ok: false, error: result?.error });
      }
      return { ok: false, error: result?.error || "Could not repair flow." };
    }

    if (result.compliance) {
      persistLocalCompliance(normalizeCompliance(result.compliance));
    }

    if (import.meta.env.DEV) {
      console.info("[repair-flow]", {
        repaired: result.repaired,
        nextRoute: result.nextRoute,
        message: result.message
      });
    }

    return result;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.info("[repair-flow]", {
        ok: false,
        error: error instanceof Error ? error.message : "repair failed"
      });
    }
    return { ok: false, error: "Could not repair flow." };
  }
}

export async function continueComplianceSafely(
  user: Pick<UserProfile, "email" | "phone">,
  ackTypes: ComplianceAckType[]
): Promise<MemberCompliance> {
  const local = mergeLocalCompliance(ackTypes);
  setComplianceSyncPending(ackTypes);
  void repairMemberFlow(user, {
    flowName: "compliance_pledge",
    currentRoute: window.location.pathname,
    clientState: { pendingAcks: ackTypes, complianceSyncPending: true }
  });
  void saveComplianceAcknowledgements(user, ackTypes).catch(() => undefined);
  return local;
}
