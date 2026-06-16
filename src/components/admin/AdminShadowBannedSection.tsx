import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  fetchShadowBannedUsers,
  liftShadowBanAdmin,
  type ShadowBannedUser
} from "../../services/adminModeration";
import { liftShadowBan } from "../../utils/shadowBan";
import { verifyAdminActionPin } from "../../utils/adminConsent";
import { AdminTerminalEmpty } from "./AdminTerminalEmpty";

type AdminShadowBannedSectionProps = {
  onRestored?: (profileId: string) => void;
  onToast?: (message: string) => void;
};

function formatPaymentStatus(status: ShadowBannedUser["paymentStatus"]) {
  switch (status) {
    case "premium_active":
      return "Premium active";
    case "premium_lapsed":
      return "Premium lapsed";
    case "paid_history":
      return "Payment history";
    default:
      return "No payments";
  }
}

export function AdminShadowBannedSection({ onRestored, onToast }: AdminShadowBannedSectionProps) {
  const [users, setUsers] = useState<ShadowBannedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [restoreTarget, setRestoreTarget] = useState<ShadowBannedUser | null>(null);
  const [restoreReason, setRestoreReason] = useState("");
  const [restorePin, setRestorePin] = useState("");
  const [restoreBusy, setRestoreBusy] = useState(false);
  const [restoreError, setRestoreError] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    const result = await fetchShadowBannedUsers();
    if (!result.ok) {
      setError(result.error);
      setUsers([]);
      setLoading(false);
      return;
    }
    setUsers(result.data.users ?? []);
    setLoading(false);
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const closeRestoreModal = () => {
    if (restoreBusy) return;
    setRestoreTarget(null);
    setRestoreReason("");
    setRestorePin("");
    setRestoreError("");
  };

  const submitRestore = async () => {
    if (!restoreTarget) return;
    const reason = restoreReason.trim();
    if (!reason) {
      setRestoreError("Enter a reason for restoration.");
      return;
    }
    if (!restorePin.trim()) {
      setRestoreError("Enter your console PIN.");
      return;
    }

    setRestoreBusy(true);
    setRestoreError("");
    try {
      const pinResult = await verifyAdminActionPin(restorePin.trim());
      if (!pinResult.ok) {
        setRestoreError(pinResult.error || "Invalid console PIN.");
        return;
      }

      const result = await liftShadowBanAdmin(restoreTarget.profileId, reason);
      if (!result.ok) {
        setRestoreError(result.error);
        return;
      }

      onToast?.("User visibility restored.");
      liftShadowBan(restoreTarget.profileId);
      onRestored?.(restoreTarget.profileId);
      closeRestoreModal();
      await loadUsers();
    } finally {
      setRestoreBusy(false);
    }
  };

  return (
    <section className="card admin-command-panel">
      <h3>Shadow banned users</h3>
      <p className="match-prefs-note">
        These members stay in the app and can pay, but their signals and messages do not reach other
        members.
      </p>

      {loading && <p className="match-prefs-note">Loading shadow banned users…</p>}

      {!loading && error && <p className="auth-message">{error}</p>}

      {!loading && !error && users.length === 0 && (
        <AdminTerminalEmpty>No shadow-banned users.</AdminTerminalEmpty>
      )}

      {!loading &&
        users.map((user) => (
          <article key={user.profileId} className="card admin-moderation-row admin-moderation-row--hot">
            <div className="admin-moderation-row__main">
              <strong>{user.name}</strong>
              <span>
                {user.city || "—"} · {user.reportCount} report{user.reportCount === 1 ? "" : "s"} ·{" "}
                {formatPaymentStatus(user.paymentStatus)}
              </span>
              {user.shadowBanReason && <small>Ban reason: {user.shadowBanReason}</small>}
              {user.lastReportAt && (
                <time>Last report: {new Date(user.lastReportAt).toLocaleString()}</time>
              )}
              {typeof user.accountAgeDays === "number" && (
                <small>Account age: {user.accountAgeDays} day{user.accountAgeDays === 1 ? "" : "s"}</small>
              )}
              {user.moderationNotes && <small>Notes: {user.moderationNotes}</small>}
            </div>
            <div className="admin-moderation-row__actions">
              <button
                type="button"
                className="btn-primary btn-sm"
                onClick={() => {
                  setRestoreTarget(user);
                  setRestoreReason("");
                  setRestorePin("");
                  setRestoreError("");
                }}
              >
                Restore user
              </button>
            </div>
          </article>
        ))}

      {restoreTarget && (
        <div className="modal-backdrop" role="presentation" onClick={closeRestoreModal}>
          <div
            className="card admin-member-purge__confirm"
            style={{ maxWidth: 480, width: "100%", margin: "auto" }}
            role="dialog"
            aria-labelledby="restore-user-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h4 id="restore-user-title">Restore user visibility?</h4>
            <p className="match-prefs-note">
              This will allow this member&apos;s Signals and messages to reach other members again.
            </p>
            <p>
              <strong>{restoreTarget.name}</strong>
              {restoreTarget.shadowBanReason ? ` · ${restoreTarget.shadowBanReason}` : ""}
            </p>

            <label className="auth-field">
              <span>Reason for restoration</span>
              <textarea
                rows={3}
                value={restoreReason}
                onChange={(event) => setRestoreReason(event.target.value)}
                placeholder="Why is this member being restored?"
              />
            </label>

            <label className="auth-field">
              <span>Console PIN</span>
              <input
                type="password"
                inputMode="numeric"
                autoComplete="off"
                value={restorePin}
                onChange={(event) => setRestorePin(event.target.value)}
              />
            </label>

            {restoreError && <p className="auth-message">{restoreError}</p>}

            <div className="admin-member-purge__confirm-actions">
              <button type="button" className="btn-secondary" onClick={closeRestoreModal} disabled={restoreBusy}>
                Cancel
              </button>
              <button type="button" className="btn-primary" onClick={() => void submitRestore()} disabled={restoreBusy}>
                {restoreBusy ? (
                  <>
                    <Loader2 className="spin" size={18} /> Restoring…
                  </>
                ) : (
                  "Restore user"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
