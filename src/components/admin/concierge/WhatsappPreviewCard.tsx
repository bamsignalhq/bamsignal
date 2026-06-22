import {
  WHATSAPP_FUTURE_ARCHITECTURE,
  WHATSAPP_FUTURE_CAPABILITIES,
  WHATSAPP_OPERATIONAL_RULES,
  WHATSAPP_TEMPLATE_LABELS
} from "../../../constants/whatsappTemplates";
import type { ConciergeWhatsappRecord } from "../../../types/conciergeWhatsapp";
import { WhatsappStatusBadge } from "./WhatsappStatusBadge";

type WhatsappPreviewCardProps = {
  notification: ConciergeWhatsappRecord;
};

export function WhatsappPreviewCard({ notification }: WhatsappPreviewCardProps) {
  const latestStatus = notification.timeline[notification.timeline.length - 1]?.status ?? "queued";

  return (
    <article className="whatsapp-preview concierge-consultant-card--glass cc-reveal">
      <header className="whatsapp-preview__head">
        <div className="whatsapp-preview__title-row">
          <h3>{WHATSAPP_TEMPLATE_LABELS[notification.templateId]}</h3>
          <WhatsappStatusBadge status={latestStatus} />
        </div>
        <p className="whatsapp-preview__meta">
          <span>{notification.messageId}</span>
          <span>{notification.memberPhone}</span>
        </p>
      </header>
      <div className="whatsapp-preview__body">
        <p className="whatsapp-preview__copy">{notification.preview}</p>
        <p className="whatsapp-preview__rules">{WHATSAPP_OPERATIONAL_RULES}</p>
      </div>
      {notification.timeline.length > 0 ? (
        <ol className="whatsapp-preview__timeline">
          {notification.timeline.map((entry, index) => (
            <li key={`${entry.status}_${entry.at}_${index}`} className="whatsapp-preview__timeline-item">
              <WhatsappStatusBadge status={entry.status} />
              <time dateTime={entry.at}>{new Date(entry.at).toLocaleString()}</time>
              {entry.detail ? <span className="whatsapp-preview__detail">{entry.detail}</span> : null}
            </li>
          ))}
        </ol>
      ) : null}
      <footer className="whatsapp-preview__future">
        <p>Future-ready: {WHATSAPP_FUTURE_CAPABILITIES.map((item) => item.label).join(", ")}.</p>
        <p className="whatsapp-preview__future-note">{WHATSAPP_FUTURE_ARCHITECTURE.voiceNotes}</p>
      </footer>
    </article>
  );
}
