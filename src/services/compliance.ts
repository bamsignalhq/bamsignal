import type { ComplianceAckType } from "../constants/compliance";
import type { MemberCompliance, UserProfile } from "../types";
import { STORAGE_KEYS } from "../constants/limits";
import { buildCompliancePatch, normalizeCompliance } from "../utils/compliance";
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

export function mergeLocalCompliance(ackTypes: ComplianceAckType[], serverMeta?: MemberCompliance): boolean {
  const profile = getDatingProfile();
  const next = buildCompliancePatch(profile.compliance, ackTypes, serverMeta);
  return persistLocalCompliance(next);
}

export async function saveComplianceAcknowledgements(
  user: Pick<UserProfile, "email" | "phone">,
  ackTypes: ComplianceAckType[]
): Promise<{ ok: boolean; compliance?: MemberCompliance; error?: string }> {
  if (!ackTypes.length) {
    return { ok: false, error: "No acknowledgements provided." };
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
      return { ok: false, error: payload?.error || "Compliance save failed." };
    }

    const compliance = normalizeCompliance(payload.compliance);
    mergeLocalCompliance(ackTypes, compliance);
    return { ok: true, compliance };
  } catch {
    return { ok: false, error: "Compliance save failed." };
  }
}
