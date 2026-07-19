import {
  CONVERSATION_UNLOCK_PRICE_NGN,
  conversationUnlockDescription,
  conversationUnlockLabel
} from "../../shared/discoverCommerceHelpers.mjs";
import { STORAGE_KEYS } from "./limits";
import { readJson, writeJson } from "../utils/storage";

export type ConversationUnlockRecord = {
  targetProfileId: string;
  matchId?: string | null;
  purchasedAt: string;
  sourcePaymentRef?: string | null;
  targetName?: string | null;
};

export const CONVERSATION_UNLOCK_PRODUCT = {
  id: "conversation-unlock",
  name: conversationUnlockLabel(),
  price: CONVERSATION_UNLOCK_PRICE_NGN,
  priceLabel: `₦${CONVERSATION_UNLOCK_PRICE_NGN.toLocaleString("en-NG")}`,
  description: conversationUnlockDescription(),
  cta: "Unlock conversation"
} as const;

export function listLocalConversationUnlocks(): ConversationUnlockRecord[] {
  return readJson<ConversationUnlockRecord[]>(STORAGE_KEYS.conversationUnlocks, []);
}

export function hasLocalConversationUnlock(targetProfileId: string): boolean {
  const id = String(targetProfileId || "").trim();
  if (!id) return false;
  return listLocalConversationUnlocks().some((row) => row.targetProfileId === id);
}

export function rememberConversationUnlock(entry: ConversationUnlockRecord): void {
  const id = String(entry.targetProfileId || "").trim();
  if (!id) return;
  const existing = listLocalConversationUnlocks().filter((row) => row.targetProfileId !== id);
  writeJson(
    STORAGE_KEYS.conversationUnlocks,
    [
      {
        targetProfileId: id,
        matchId: entry.matchId || null,
        purchasedAt: entry.purchasedAt || new Date().toISOString(),
        sourcePaymentRef: entry.sourcePaymentRef || null,
        targetName: entry.targetName || null
      },
      ...existing
    ].slice(0, 100)
  );
}

export function hydrateConversationUnlocksFromServer(
  rows: Array<{
    target_profile_id?: string;
    targetProfileId?: string;
    match_id?: string | null;
    matchId?: string | null;
    created_at?: string;
    purchasedAt?: string;
    source_payment_ref?: string | null;
    metadata?: { targetName?: string | null };
  }> = []
): ConversationUnlockRecord[] {
  const mapped: ConversationUnlockRecord[] = [];
  for (const row of rows) {
    const targetProfileId = String(row.target_profile_id || row.targetProfileId || "").trim();
    if (!targetProfileId) continue;
    mapped.push({
      targetProfileId,
      matchId: row.match_id || row.matchId || null,
      purchasedAt: row.created_at || row.purchasedAt || new Date().toISOString(),
      sourcePaymentRef: row.source_payment_ref || null,
      targetName: row.metadata?.targetName || null
    });
  }

  writeJson(STORAGE_KEYS.conversationUnlocks, mapped.slice(0, 100));
  return mapped;
}
