import { apiUrl } from "../services/supabase";
import { readResponseJson } from "./httpJson";

export type ConciergeMemberInvoice = {
  id: string;
  invoice_number?: string | null;
  status: string;
  total_kobo?: number | null;
  amount_paid_kobo?: number | null;
  currency?: string | null;
  due_at?: string | null;
  paid_at?: string | null;
  payment_ref?: string | null;
  notes?: string | null;
  created_at?: string | null;
  journey_id?: string | null;
};

export type ConciergeMemberCaseEvent = {
  id: string;
  eventType: string;
  fromStatus?: string | null;
  toStatus?: string | null;
  notes?: string | null;
  createdAt?: string | null;
  invoiceId?: string | null;
  consultantId?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type ConciergeMemberCasePayload = {
  ok: boolean;
  error?: string;
  case?: {
    memberId: string;
    journeyId?: string | null;
    opsStatus?: string | null;
    memberStatus?: string | null;
    preferredTier?: string | null;
    consultantId?: string | null;
    assignedBy?: string | null;
    assignedAt?: string | null;
    stewardshipHistory?: unknown;
    createdAt?: string | null;
    updatedAt?: string | null;
  } | null;
  history?: ConciergeMemberCaseEvent[];
  invoices?: ConciergeMemberInvoice[];
  payments?: {
    outstandingKobo: number;
    paidCount: number;
    openCount: number;
  };
};

async function postConciergeMember<T>(
  action: string,
  body: Record<string, unknown> = {}
): Promise<T & { ok: boolean; error?: string }> {
  const response = await fetch(apiUrl(`/api/concierge-member?action=${action}`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body)
  });
  const payload =
    (await readResponseJson<T & { ok?: boolean; error?: string }>(response)) ??
    ({ ok: false, error: "empty_response" } as T & { ok: boolean; error?: string });
  return {
    ...payload,
    ok: Boolean(payload.ok),
    error: payload.error
  };
}

export async function fetchConciergeMemberCase(): Promise<ConciergeMemberCasePayload> {
  try {
    return await postConciergeMember<ConciergeMemberCasePayload>("my-case");
  } catch {
    return { ok: false, error: "network_error" };
  }
}

export async function submitConciergeApplicationToOps(input: {
  journeyId?: string | null;
  preferredTier?: string | null;
  application?: Record<string, unknown>;
}): Promise<{ ok: boolean; error?: string; duplicate?: boolean; message?: string }> {
  try {
    return await postConciergeMember("submit-application", {
      journeyId: input.journeyId || null,
      preferredTier: input.preferredTier || null,
      application: input.application || {}
    });
  } catch {
    return { ok: false, error: "network_error" };
  }
}

export async function listConciergeMemberInvoices(): Promise<{
  ok: boolean;
  error?: string;
  invoices: ConciergeMemberInvoice[];
}> {
  try {
    const payload = await postConciergeMember<{ invoices?: ConciergeMemberInvoice[] }>("list-invoices");
    return {
      ok: payload.ok,
      error: payload.error,
      invoices: payload.invoices || []
    };
  } catch {
    return { ok: false, error: "network_error", invoices: [] };
  }
}

export function formatConciergeInvoiceAmount(kobo = 0): string {
  const naira = Math.max(0, Math.round(Number(kobo) || 0) / 100);
  return `₦${naira.toLocaleString("en-NG")}`;
}

export function conciergeInvoiceOutstandingKobo(invoice: ConciergeMemberInvoice): number {
  return Math.max(0, Number(invoice.total_kobo || 0) - Number(invoice.amount_paid_kobo || 0));
}

export function isConciergeInvoicePayable(invoice: ConciergeMemberInvoice): boolean {
  return ["sent", "partially_paid", "overdue"].includes(String(invoice.status || ""));
}
