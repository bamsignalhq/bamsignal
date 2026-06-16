import { useState } from "react";
import { Flag, ShieldBan, ShieldCheck, UserX, X } from "lucide-react";
import { BUTTON_COPY, EXPERIENCE_COPY } from "../constants/copy";
import { FEMALE_SAFETY_COPY, REPORT_REASONS } from "../constants/safety";
import type { ReportReason } from "../types";
import { recordReport } from "../utils/safety";

type ReportBlockModalProps = {
  open: boolean;
  userName: string;
  profileId?: string;
  onClose: () => void;
  onReport?: (reason: ReportReason, details?: string) => void;
  onBlock: () => void;
  onUnmatch?: () => void;
};

export function ReportBlockModal({
  open,
  userName,
  profileId,
  onClose,
  onReport,
  onBlock,
  onUnmatch
}: ReportBlockModalProps) {
  const [view, setView] = useState<"menu" | "report" | "done">("menu");
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");

  if (!open) return null;

  const reset = () => {
    setView("menu");
    setReason(null);
    setDetails("");
  };

  const close = () => {
    reset();
    onClose();
  };

  const submitReport = () => {
    if (!reason || !profileId) return;
    if (reason === "other" && !details.trim()) return;
    recordReport(profileId, reason, details);
    onReport?.(reason, details);
    setView("done");
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={close}>
      <div className="safety-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={close} aria-label="Close">
          <X size={20} />
        </button>

        {view === "menu" && (
          <>
            <div className="safety-modal__icon">
              <ShieldCheck size={28} />
            </div>
            <h3>{EXPERIENCE_COPY.safetyMenuTitle}</h3>
            <p className="safety-modal__lead">{EXPERIENCE_COPY.safetyMenuLead}</p>
            <div className="safety-actions">
              <button
                type="button"
                className="safety-action-btn report"
                onClick={() => setView("report")}
                disabled={!profileId}
              >
                <Flag size={18} /> {EXPERIENCE_COPY.reportUser}
              </button>
              <button
                type="button"
                className="safety-action-btn block"
                onClick={() => {
                  onBlock();
                  close();
                }}
              >
                <ShieldBan size={18} /> {EXPERIENCE_COPY.blockUser}
              </button>
              {onUnmatch ? (
                <button
                  type="button"
                  className="safety-action-btn unmatch"
                  onClick={() => {
                    onUnmatch();
                    close();
                  }}
                >
                  <UserX size={18} /> {EXPERIENCE_COPY.unmatch}
                </button>
              ) : null}
            </div>
          </>
        )}

        {view === "report" && (
          <>
            <h3>Report {userName}</h3>
            <p className="safety-modal__lead">What happened? Choose the closest reason.</p>
            <div className="safety-reason-list">
              {REPORT_REASONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`safety-reason ${reason === item.id ? "selected" : ""}`}
                  onClick={() => setReason(item.id)}
                >
                  <strong>{item.label}</strong>
                  <span>{item.hint}</span>
                </button>
              ))}
            </div>
            <label className="safety-details-label">
              Additional details (optional)
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Share what happened, in your own words…"
                rows={3}
                maxLength={500}
              />
            </label>
            <div className="safety-modal__actions">
              <button type="button" className="btn-secondary" onClick={() => setView("menu")}>
                Back
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={!reason || (reason === "other" && !details.trim())}
                onClick={submitReport}
              >
                {BUTTON_COPY.done}
              </button>
            </div>
          </>
        )}

        {view === "done" && (
          <>
            <div className="safety-modal__icon safety-modal__icon--success">
              <ShieldCheck size={28} />
            </div>
            <h3>Report submitted</h3>
            <p className="safety-modal__lead">{FEMALE_SAFETY_COPY.reportConfirm}</p>
            <div className="safety-modal__actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  onBlock();
                  close();
                }}
              >
                {EXPERIENCE_COPY.blockUser}
              </button>
              <button type="button" className="btn-primary" onClick={close}>
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** @deprecated Use recordReport from utils/safety */
export { recordReport } from "../utils/safety";
export { isAutoFlagged } from "../utils/safety";
