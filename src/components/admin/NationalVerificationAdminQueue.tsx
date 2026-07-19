import { useCallback, useEffect, useState } from "react";
import type { PublicVerificationStatus } from "../../lib/verification/types";
import { apiUrl } from "../../services/supabase";
import { memberApiHeaders } from "../../utils/memberApiAuth";
import { readResponseJson } from "../../utils/httpJson";

type QueueRow = PublicVerificationStatus & {
  email?: string | null;
  phone?: string | null;
  selfieUrl?: string | null;
  createdAt?: string;
};

type NationalVerificationAdminQueueProps = {
  onToast?: (message: string) => void;
  ensureConsent?: (message: string) => Promise<boolean>;
};

export function NationalVerificationAdminQueue({
  onToast,
  ensureConsent
}: NationalVerificationAdminQueueProps) {
  const [rows, setRows] = useState<QueueRow[]>([]);
  const [filter, setFilter] = useState("manual_review");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const headers = await memberApiHeaders();
      const response = await fetch(
        apiUrl(`/api/verification/admin?action=list&status=${encodeURIComponent(filter)}`),
        { method: "GET", headers }
      );
      const payload = await readResponseJson<{ ok?: boolean; submissions?: QueueRow[]; error?: string }>(
        response
      );
      if (!response.ok || !payload?.ok) {
        onToast?.(payload?.error || "Could not load verification queue.");
        return;
      }
      setRows(payload.submissions || []);
    } finally {
      setBusy(false);
    }
  }, [filter, onToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const decide = async (sessionId: string, action: string) => {
    if (ensureConsent && !(await ensureConsent(`Confirm ${action.replace(/_/g, " ")}?`))) {
      onToast?.("Console PIN required.");
      return;
    }
    setBusy(true);
    try {
      const headers = await memberApiHeaders();
      const response = await fetch(apiUrl("/api/verification/admin"), {
        method: "POST",
        headers,
        body: JSON.stringify({ action, sessionId })
      });
      const payload = await readResponseJson<{ ok?: boolean; error?: string }>(response);
      if (!response.ok || !payload?.ok) {
        onToast?.(payload?.error || "Decision failed.");
        return;
      }
      onToast?.(`Verification ${action.replace(/_/g, " ")} applied.`);
      await load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card">
      <div className="admin-section-head">
        <h3>National verification queue</h3>
        <div className="admin-inline-actions">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Verification status filter"
          >
            <option value="manual_review">Manual review</option>
            <option value="auto_verified">Auto verified</option>
            <option value="retry">Retry</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>
          <button type="button" className="btn-secondary btn-sm" onClick={() => void load()} disabled={busy}>
            Refresh
          </button>
        </div>
      </div>

      {rows.length === 0 ? <p className="match-prefs-note">No sessions in this filter.</p> : null}

      {rows.map((row) => (
        <article key={row.sessionId} className="card admin-moderation-row admin-photo-review-row">
          <div className="admin-moderation-row__main">
            {row.selfieUrl ? (
              <img src={row.selfieUrl} alt="Verification selfie" width={72} height={72} />
            ) : (
              <span className="match-prefs-note">No selfie URL</span>
            )}
            <div>
              <strong>
                {row.email || "member"} · {row.phone || "phone"}
              </strong>
              <span>
                {row.provider || "—"} · confidence {row.confidence ?? "—"} · trust {row.trustScore ?? "—"}
              </span>
              <small>
                {row.status}
                {row.decision ? ` · ${row.decision}` : ""}
                {row.modelVersion ? ` · ${row.modelVersion}` : ""}
              </small>
            </div>
          </div>
          <div className="admin-moderation-row__actions">
            <button type="button" className="btn-primary btn-sm" disabled={busy} onClick={() => void decide(row.sessionId, "approve")}>
              Approve
            </button>
            <button type="button" className="btn-secondary btn-sm" disabled={busy} onClick={() => void decide(row.sessionId, "request_new_selfie")}>
              Request new selfie
            </button>
            <button type="button" className="btn-secondary btn-sm" disabled={busy} onClick={() => void decide(row.sessionId, "reject")}>
              Reject
            </button>
            <button type="button" className="btn-secondary btn-sm" disabled={busy} onClick={() => void decide(row.sessionId, "suspend")}>
              Suspend
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}
