import { WHATSAPP_TEMPLATE_LABELS } from "../../../constants/whatsappTemplates";
import type { ConciergeWhatsappHistoryEntry } from "../../../types/conciergeWhatsapp";
import { WhatsappStatusBadge } from "./WhatsappStatusBadge";

type WhatsappHistoryCardProps = {
  history: ConciergeWhatsappHistoryEntry[];
};

export function WhatsappHistoryCard({ history }: WhatsappHistoryCardProps) {
  return (
    <section className="whatsapp-history concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>WhatsApp history</h3>
        <p>Append-only — operational reminders via Sendchamp. No coaching threads.</p>
      </header>
      {history.length === 0 ? (
        <p className="whatsapp-history__empty">No WhatsApp notifications recorded yet.</p>
      ) : (
        <ol className="whatsapp-history__list">
          {history.map((entry) => (
            <li key={entry.id} className="whatsapp-history__item">
              <div className="whatsapp-history__row">
                <strong>{WHATSAPP_TEMPLATE_LABELS[entry.templateId]}</strong>
                <WhatsappStatusBadge status={entry.status} />
              </div>
              <span className="whatsapp-history__id">{entry.messageId}</span>
              <span className="whatsapp-history__preview">{entry.preview}</span>
              <div className="whatsapp-history__footer">
                <span>Sendchamp</span>
                <time dateTime={entry.recordedAt}>{new Date(entry.recordedAt).toLocaleString()}</time>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
