import { apiUrl } from "../services/supabase";
import { memberApiHeaders } from "./memberApiAuth";
import { readResponseJson } from "./httpJson";
import { COMMERCIAL_PRODUCT_LABELS } from "../constants/commercialExperience";
import type { CommercialTransaction } from "./commercialLedger";

export type ServerPaymentRow = {
  paystack_reference?: string;
  product_type?: string;
  product_id?: string;
  amount_kobo?: number | null;
  currency?: string | null;
  status?: string;
  fulfilled_at?: string | null;
  created_at?: string | null;
};

function productLabel(row: ServerPaymentRow): string {
  const type = String(row.product_type || "").toLowerCase();
  if (type === "premium" || type === "discover") return COMMERCIAL_PRODUCT_LABELS.discover;
  if (type === "discreet" || type === "discreet_membership") return COMMERCIAL_PRODUCT_LABELS.discreet;
  if (type === "boost") return COMMERCIAL_PRODUCT_LABELS.boost;
  if (type === "conversation_unlock" || type === "conversation-unlock") {
    return COMMERCIAL_PRODUCT_LABELS.conversation_unlock;
  }
  if (type === "concierge_invoice" || type === "concierge-invoice") {
    return COMMERCIAL_PRODUCT_LABELS.concierge_invoice;
  }
  if (type === "consultation-fee") return COMMERCIAL_PRODUCT_LABELS.consultation_fee;
  if (type === "fast_connection") return COMMERCIAL_PRODUCT_LABELS.fast_connection;
  return row.product_id || row.product_type || "Purchase";
}

export async function fetchServerPaymentHistory(limit = 40): Promise<ServerPaymentRow[]> {
  try {
    const response = await fetch(apiUrl("/api/member/data?action=payment-history"), {
      method: "POST",
      headers: await memberApiHeaders(),
      body: JSON.stringify({ limit })
    });
    const payload = await readResponseJson<{ ok?: boolean; payments?: ServerPaymentRow[] }>(response);
    if (!response.ok || !payload?.ok) return [];
    return payload.payments || [];
  } catch {
    return [];
  }
}

export function mapServerPaymentsToTransactions(rows: ServerPaymentRow[]): CommercialTransaction[] {
  return (rows || []).map((row, index) => {
    const amount = Number(row.amount_kobo || 0);
    return {
      id: `pay-${row.paystack_reference || index}`,
      kind:
        String(row.product_type || "").includes("discreet")
          ? "discreet"
          : String(row.product_type || "").includes("boost")
            ? "boost"
            : String(row.product_type || "").includes("conversation")
              ? "conversation_unlock"
              : String(row.product_type || "").includes("concierge")
                ? "concierge_invoice"
                : "discover",
      label: productLabel(row),
      detail: row.paystack_reference ? `Receipt ${row.paystack_reference}` : "Payment recorded",
      at: row.fulfilled_at || row.created_at || new Date().toISOString(),
      status: "Paid",
      amountLabel: amount > 0 ? `₦${Math.round(amount / 100).toLocaleString("en-NG")}` : undefined
    };
  });
}
