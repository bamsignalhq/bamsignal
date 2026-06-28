/**
 * Shared admin health snapshot fetch — used by Observability, Platform Health, System Health.
 *
 * NOTE: `/health` is liveness-only. Detailed dependency state lives on `/ready?details=1`
 * (diagnostics auth). See P1 item in docs/operations/technical-debt-audit.md.
 */
import type { AdminHealthSnapshot } from "../components/admin/AdminHealthPanel";
import { apiUrl } from "../services/supabase";

export async function fetchAdminHealthSnapshot(): Promise<AdminHealthSnapshot | null> {
  try {
    const response = await fetch(apiUrl("/health"), { cache: "no-store" });
    if (!response.ok) return null;
    const payload = await response.json();
    if (!payload || typeof payload !== "object") return null;
    if (!("database" in payload)) {
      return null;
    }
    return payload as AdminHealthSnapshot;
  } catch {
    return null;
  }
}
