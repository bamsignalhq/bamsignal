import { apiUrl } from "./supabase";
import { memberApiHeaders } from "../utils/memberApiAuth";

export type WalletGateEntry =
  | "premium"
  | "boost"
  | "priority"
  | "super_boost"
  | "fast_connection"
  | "likes"
  | "super_like"
  | "signal"
  | "verification";

export type WalletGateStep = "wallet" | "purchase" | "buy_baygold" | "completed";

export interface WalletHomePayload {
  overview: {
    balanceBayGold: number;
    availableBayGold: number;
    currencyLabel: string;
    walletId: string;
    recentActivity: {
      id: string;
      label: string;
      signedAmount: number;
      createdAt: string;
    }[];
  };
  rewardsEarned: number;
  pendingRewards: unknown[];
  pendingPurchases: unknown[];
  recentNotifications: { id: string; title: string; createdAt: string }[];
}

export interface WalletGateResult {
  ok: boolean;
  step: WalletGateStep;
  needsFunding?: boolean;
  resumeToken?: string;
  shortfallBayGold?: number;
  productLabel?: string;
  priceBayGold?: number;
  availableBayGold?: number;
  purchaseId?: string;
  reference?: string;
  error?: string;
}

export async function fetchWalletHome(): Promise<{ ok: boolean; home?: WalletHomePayload; error?: string }> {
  try {
    const response = await fetch(apiUrl("/api/wallet"), {
      headers: await memberApiHeaders()
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) {
      return { ok: false, error: payload.error || "Unable to load wallet." };
    }
    return { ok: true, home: payload.home };
  } catch {
    return { ok: false, error: "Wallet unavailable." };
  }
}

export async function purchaseThroughWallet(input: {
  entry: WalletGateEntry | string;
  productId?: string;
  idempotencyKey?: string;
}): Promise<{ ok: boolean; gate?: WalletGateResult; error?: string }> {
  try {
    const response = await fetch(apiUrl("/api/wallet"), {
      method: "POST",
      headers: await memberApiHeaders(),
      body: JSON.stringify({
        action: "purchase-gate",
        entry: input.entry,
        productId: input.productId,
        idempotencyKey: input.idempotencyKey
      })
    });
    const payload = await response.json();
    if (!payload.gate) {
      return { ok: false, error: payload.error || "Purchase gate failed." };
    }
    return { ok: Boolean(payload.ok && payload.gate.ok), gate: payload.gate, error: payload.gate.error };
  } catch {
    return { ok: false, error: "Purchase gate unavailable." };
  }
}

export async function resumeWalletPurchase(input: {
  resumeToken: string;
  paystackReference: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const response = await fetch(apiUrl("/api/wallet"), {
      method: "POST",
      headers: await memberApiHeaders(),
      body: JSON.stringify({
        action: "resume",
        resumeToken: input.resumeToken,
        paystackReference: input.paystackReference
      })
    });
    const payload = await response.json();
    return { ok: Boolean(payload.ok), error: payload.error };
  } catch {
    return { ok: false, error: "Resume purchase failed." };
  }
}

export function walletGateLabel(entry: WalletGateEntry | string): string {
  const labels: Record<string, string> = {
    premium: "Premium",
    boost: "Profile Boost",
    priority: "Priority Signal",
    super_boost: "Super Boost",
    fast_connection: "Fast Connection",
    likes: "Unlimited Likes",
    super_like: "Super Like",
    signal: "Signal",
    verification: "Verification"
  };
  return labels[entry] ?? "Purchase";
}
