import {
  CONCIERGE_EMAIL_FUTURE_ARCHITECTURE,
  CONCIERGE_EMAIL_FUTURE_CAPABILITIES,
  CONCIERGE_EMAIL_TEMPLATE_LABELS
} from "../../../constants/emailTemplates";
import type { ConciergeEmailRecord } from "../../../types/conciergeEmail";
import { EmailStatusBadge } from "./EmailStatusBadge";

type EmailPreviewCardProps = {
  email: ConciergeEmailRecord;
};

export function EmailPreviewCard({ email }: EmailPreviewCardProps) {
  const latestStatus = email.timeline[email.timeline.length - 1]?.status ?? "queued";

  return (
    <article className="email-preview concierge-consultant-card--glass cc-reveal">
      <header className="email-preview__head">
        <div className="email-preview__title-row">
          <h3>{CONCIERGE_EMAIL_TEMPLATE_LABELS[email.templateId]}</h3>
          <EmailStatusBadge status={latestStatus} />
        </div>
        <p className="email-preview__meta">
          <span>{email.emailId}</span>
          <span>{email.memberEmail}</span>
        </p>
      </header>
      <div className="email-preview__body">
        <p className="email-preview__subject">{email.subject}</p>
        <p className="email-preview__copy">{email.preview}</p>
      </div>
      {email.timeline.length > 0 ? (
        <ol className="email-preview__timeline">
          {email.timeline.map((entry, index) => (
            <li key={`${entry.status}_${entry.at}_${index}`} className="email-preview__timeline-item">
              <EmailStatusBadge status={entry.status} />
              <time dateTime={entry.at}>{new Date(entry.at).toLocaleString()}</time>
              {entry.detail ? <span className="email-preview__detail">{entry.detail}</span> : null}
            </li>
          ))}
        </ol>
      ) : null}
      <footer className="email-preview__future">
        <p>Future-ready: {CONCIERGE_EMAIL_FUTURE_CAPABILITIES.map((item) => item.label).join(", ")}.</p>
        <p className="email-preview__future-note">{CONCIERGE_EMAIL_FUTURE_ARCHITECTURE.aiSummaries}</p>
      </footer>
    </article>
  );
}
