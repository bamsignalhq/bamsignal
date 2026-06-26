import { NOTIFICATION_CHANNEL_LABELS } from "../../../constants/notificationReliability";
import type { NotificationTemplateRecord } from "../../../types/notificationReliability";

type NotificationTemplatesCardProps = {
  templates: NotificationTemplateRecord[];
};

export function NotificationTemplatesCard({ templates }: NotificationTemplatesCardProps) {
  return (
    <section className="notification-templates-card concierge-consultant-card--glass cc-reveal">
      <header>
        <h3>Templates</h3>
        <p>OTP, Welcome, Verification, Consultation, Signal, Message, Payment, Reminder, Relationship, and System.</p>
      </header>
      <div className="notification-templates-card__list">
        {templates.map((template) => (
          <article key={template.id} className="notification-template-row">
            <div className="notification-template-row__head">
              <strong>{template.label}</strong>
              <span className={template.enabled ? "is-enabled" : "is-disabled"}>
                {template.enabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <p className="notification-template-row__preview">{template.preview}</p>
            <dl className="notification-template-row__meta">
              <div>
                <dt>Channels</dt>
                <dd>{template.channels.map((ch) => NOTIFICATION_CHANNEL_LABELS[ch]).join(", ")}</dd>
              </div>
              <div>
                <dt>Sent</dt>
                <dd>{template.sentCount.toLocaleString()}</dd>
              </div>
              <div>
                <dt>Last used</dt>
                <dd>{new Date(template.lastUsedAt).toLocaleString()}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
