import { ChevronRight, X } from "lucide-react";

type MemberMicroNudgeProps = {
  emoji?: string;
  lead: string;
  cta: string;
  onAction: () => void;
  onDismiss?: () => void;
  dismissLabel?: string;
  className?: string;
  exiting?: boolean;
};

export function MemberMicroNudge({
  emoji,
  lead,
  cta,
  onAction,
  onDismiss,
  dismissLabel = "Dismiss nudge",
  className = "",
  exiting = false
}: MemberMicroNudgeProps) {
  return (
    <div
      className={`member-micro-nudge${exiting ? " member-micro-nudge--exit" : ""} ${className}`.trim()}
      role="status"
    >
      <button type="button" className="member-micro-nudge__main" onClick={onAction}>
        <span className="member-micro-nudge__lead">
          {emoji ? <span className="member-micro-nudge__emoji">{emoji}</span> : null}
          {lead}
        </span>
        <span className="member-micro-nudge__cta">
          {cta}
          <ChevronRight size={14} aria-hidden />
        </span>
      </button>
      {onDismiss ? (
        <button
          type="button"
          className="member-micro-nudge__dismiss"
          onClick={onDismiss}
          aria-label={dismissLabel}
        >
          <X size={14} />
        </button>
      ) : null}
    </div>
  );
}
