import { WEBHOOK_PROVIDERS } from "../../../constants/apiPlatform";
import type { ApiWebhookRecord } from "../../../types/apiPlatform";

type WebhookCardProps = {
  webhooks: ApiWebhookRecord[];
};

const PROVIDER_LABELS = Object.fromEntries(
  WEBHOOK_PROVIDERS.map((item) => [item.id, item.label])
) as Record<ApiWebhookRecord["providerId"], string>;

export function WebhookCard({ webhooks }: WebhookCardProps) {
  return (
    <section className="api-platform-card webhook-card concierge-consultant-card--glass cc-reveal">
      <header className="api-platform-card__head">
        <h3>Webhooks</h3>
        <p>Paystack, Google Calendar, Zoom, Resend, Sendchamp — standardized inbound callbacks.</p>
      </header>
      {webhooks.length ? (
        <ul className="api-platform-card__list">
          {webhooks.map((webhook) => (
            <li key={webhook.id}>
              <div className="api-platform-card__row">
                <strong>{PROVIDER_LABELS[webhook.providerId]}</strong>
                <span className={`webhook-card__status${webhook.active ? " is-active" : ""}`}>
                  {webhook.active ? "Active" : "Inactive"}
                </span>
              </div>
              <p>{webhook.endpoint}</p>
              <p>{webhook.events.join(", ")}</p>
              <div className="api-platform-card__meta">
                <span>{webhook.webhookRef}</span>
                {webhook.failureCount > 0 ? <span>{webhook.failureCount} failures</span> : null}
                {webhook.lastDeliveryAt ? (
                  <span>Last {new Date(webhook.lastDeliveryAt).toLocaleString()}</span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="api-platform-card__empty">No webhooks configured.</p>
      )}
    </section>
  );
}
