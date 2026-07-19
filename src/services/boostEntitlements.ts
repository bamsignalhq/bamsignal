import type { UserProfile } from "../types";
import { memberApiHeaders } from "../utils/memberApiAuth";
import { readResponseJson } from "../utils/httpJson";
import { hydrateBoostsFromServer } from "../utils/activeBoosts";
import { hydrateConversationUnlocksFromServer } from "../constants/conversationUnlock";
import { apiUrl } from "./supabase";

export type ServerBoostEntitlement = {
  id?: string;
  productId?: string;
  activatedAt?: string | null;
  expiresAt?: string | null;
  consumed?: boolean;
  city?: string;
  memberDiscoverId?: string;
  paystackReference?: string | null;
};

export async function refreshMemberBoostEntitlements(
  user: Pick<UserProfile, "email" | "phone" | "username">
): Promise<ServerBoostEntitlement[]> {
  try {
    const response = await fetch(apiUrl("/api/member/data?action=status"), {
      method: "POST",
      headers: await memberApiHeaders(),
      body: JSON.stringify({ email: user.email, phone: user.phone })
    });
    const payload = await readResponseJson<{
      ok?: boolean;
      activeBoosts?: ServerBoostEntitlement[];
      conversationUnlocks?: Array<{
        target_profile_id?: string;
        match_id?: string | null;
        created_at?: string;
        source_payment_ref?: string | null;
        metadata?: { targetName?: string | null };
      }>;
    }>(response);
    if (!response.ok || !payload?.ok) {
      return [];
    }
    if (Array.isArray(payload.conversationUnlocks)) {
      hydrateConversationUnlocksFromServer(payload.conversationUnlocks);
    }
    if (!Array.isArray(payload.activeBoosts)) {
      return [];
    }
    hydrateBoostsFromServer(payload.activeBoosts, user);
    return payload.activeBoosts;
  } catch {
    return [];
  }
}

export function applyServerBoostEntitlement(
  user: Pick<UserProfile, "email" | "phone" | "username">,
  boost?: ServerBoostEntitlement | null
): boolean {
  if (!boost?.productId) return false;
  hydrateBoostsFromServer([boost], user);
  return true;
}
