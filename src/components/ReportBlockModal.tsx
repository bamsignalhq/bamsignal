import { useState } from "react";
import { Flag, ShieldAlert, ShieldBan, ShieldCheck, UserX, X } from "lucide-react";
import { BUTTON_COPY, EXPERIENCE_COPY } from "../constants/copy";
import { CONTACT_LEAK_BLOCK_MESSAGE, validateUserText } from "../utils/contactGuard";
import {
  FEMALE_SAFETY_COPY,
  PANIC_REPORT_REASONS,
  REPORT_REASONS
} from "../constants/safety";
import type { ReportReason } from "../types";
import { recordReport } from "../utils/safety";

type ReportBlockModalProps = {
  open: boolean;
  userName: string;
  profileId?: string;
  onClose: () => void;
  onReport?: (reason: ReportReason, details?: string) => void;
  onBlock: () => void;
  onBlockAndReport?: (reason: ReportReason, details?: string) => void;
  onUnmatch?: () => void;
  showDisableContactSharing?: boolean;
  onDisableContactSharing?: () => void;
};

type ModalView = "menu" | "report" | "block_and_report" | "done" | "panic_done";

export function ReportBlockModal({
  open,
  userName,
  profileId,
  onClose,
  onReport,
  onBlock,
  onBlockAndReport,
  onUnmatch,
  showDisableContactSharing,
  onDisableContactSharing
}: ReportBlockModalProps) {
  const [view, setView] = useState<ModalView>("menu");
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [detailsError, setDetailsError] = useState("");

  if (!open) return null;

  const reset = () => {
    setView("menu");
    setReason(null);
    setDetails("");
    setDetailsError("");
  };

  const close = () => {
    reset();
    onClose();
  };

  const validateDetails = (): boolean => {
    const leakError = validateUserText(details);
    if (leakError) {
      setDetailsError(CONTACT_LEAK_BLOCK_MESSAGE);
      return false;
    }
    setDetailsError("");
    return true;
  };

  const submitReport = () => {
    if (!reason || !profileId) return;
    if (reason === "other" && !details.trim()) return;
    if (!validateDetails()) return;
    recordReport(profileId, reason, details);
    onReport?.(reason, details);
    setView("done");
  };

  const submitBlockAndReport = () => {
    if (!reason || !profileId || !onBlockAndReport) return;
    if (reason === "other" && !details.trim()) return;
    if (!validateDetails()) return;
    onBlockAndReport(reason, details);
    setView("panic_done");
  };

  const reasonList = view === "block_and_report" ? PANIC_REPORT_REASONS : REPORT_REASONS;
  const noteRequired = reason === "other";
  const canSubmit = Boolean(reason && (!noteRequired || details.trim()));

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
              {onBlockAndReport ? (
                <button
                  type="button"
                  className="safety-action-btn safety-action-btn--panic"
                  onClick={() => setView("block_and_report")}
                  disabled={!profileId}
                >
                  <ShieldAlert size={18} /> Block &amp; Report
                </button>
              ) : null}
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
              {showDisableContactSharing && onDisableContactSharing ? (
                <button
                  type="button"
                  className="safety-action-btn"
                  onClick={() => {
                    onDisableContactSharing();
                    close();
                  }}
                >
                  Disable Contact Sharing
                </button>
              ) : null}
            </div>
          </>
        )}

        {(view === "report" || view === "block_and_report") && (
          <>
            <h3>
              {view === "block_and_report" ? `Block and report ${userName}?` : `Report ${userName}`}
            </h3>
            <p className="safety-modal__lead">
              {view === "block_and_report"
                ? "This will stop them from contacting you and send a report to BamSignal for review."
                : "What happened? Choose the closest reason."}
            </p>
            <div className="safety-reason-list">
              {reasonList.map((item) => (
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
              {noteRequired ? "Tell us what happened" : "Additional details (optional)"}
              <textarea
                value={details}
                onChange={(e) => {
                  setDetails(e.target.value);
                  if (detailsError) setDetailsError("");
                }}
                placeholder={
                  noteRequired
                    ? "Please share a short note so we can review…"
                    : "Share what happened, in your own words…"
                }
                rows={3}
                maxLength={500}
              />
            </label>
            {detailsError ? (
              <p className="safety-modal__lead" role="status">
                {detailsError}
              </p>
            ) : null}
            <div className="safety-modal__actions">
              <button type="button" className="btn-secondary" onClick={() => setView("menu")}>
                Cancel
              </button>
              <button
                type="button"
                className={view === "block_and_report" ? "btn-primary safety-btn--destructive" : "btn-primary"}
                disabled={!canSubmit}
                onClick={view === "block_and_report" ? submitBlockAndReport : submitReport}
              >
                {view === "block_and_report" ? "Block & Report" : BUTTON_COPY.done}
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

        {view === "panic_done" && (
          <>
            <div className="safety-modal__icon safety-modal__icon--success">
              <ShieldCheck size={28} />
            </div>
            <h3>User blocked and reported</h3>
            <p className="safety-modal__lead">
              They can no longer contact you. Our team will review this report.
            </p>
            <div className="safety-modal__actions">
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
