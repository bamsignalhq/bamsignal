import { CONCIERGE_EMAIL_TEMPLATE_LABELS } from "../../../constants/emailTemplates";
import type { ConciergeEmailHistoryEntry } from "../../../types/conciergeEmail";
import { EmailStatusBadge } from "./EmailStatusBadge";

type EmailHistoryCardProps = {
  history: ConciergeEmailHistoryEntry[];
};

export function EmailHistoryCard({ history }: EmailHistoryCardProps) {
  return (
    <section className="email-history concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Email history</h3>
        <p>Append-only — permanent journey email records via Resend.</p>
      </header>
      {history.length === 0 ? (
        <p className="email-history__empty">No journey emails recorded yet.</p>
      ) : (
        <ol className="email-history__list">
          {history.map((entry) => (
            <li key={entry.id} className="email-history__item">
              <div className="email-history__row">
                <strong>{CONCIERGE_EMAIL_TEMPLATE_LABELS[entry.templateId]}</strong>
                <EmailStatusBadge status={entry.status} />
              </div>
              <span className="email-history__id">{entry.emailId}</span>
              <span className="email-history__subject">{entry.subject}</span>
              <span className="email-history__preview">{entry.preview}</span>
              <div className="email-history__footer">
                <span>Resend</span>
                <time dateTime={entry.recordedAt}>{new Date(entry.recordedAt).toLocaleString()}</time>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
