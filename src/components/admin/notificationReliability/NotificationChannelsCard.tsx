import { NOTIFICATION_CHANNEL_LABELS } from "../../../constants/notificationReliability";
import type { EnterpriseNotificationCenterBundle } from "../../../types/notificationReliability";

type NotificationChannelsCardProps = {
  channels: EnterpriseNotificationCenterBundle["channels"];
};

export function NotificationChannelsCard({ channels }: NotificationChannelsCardProps) {
  return (
    <section className="notification-channels-card concierge-consultant-card--glass cc-reveal">
      <header>
        <h3>Channels</h3>
        <p>Email, WhatsApp, Push, and In-App — with SMS and Telegram planned.</p>
      </header>
      <div className="notification-channels-card__grid">
        {channels.map((channel) => (
          <article key={channel.id} className="notification-channel-chip">
            <div className="notification-channel-chip__head">
              <strong>{NOTIFICATION_CHANNEL_LABELS[channel.id] ?? channel.label}</strong>
              <span className={channel.live ? "is-live" : "is-future"}>
                {channel.live ? "Live" : "Future"}
              </span>
            </div>
            <p>{channel.sentToday} sent today</p>
          </article>
        ))}
        <article className="notification-channel-chip notification-channel-chip--future">
          <div className="notification-channel-chip__head">
            <strong>SMS</strong>
            <span className="is-future">Future</span>
          </div>
          <p>Planned carrier integration</p>
        </article>
        <article className="notification-channel-chip notification-channel-chip--future">
          <div className="notification-channel-chip__head">
            <strong>Telegram</strong>
            <span className="is-future">Future</span>
          </div>
          <p>Planned bot channel</p>
        </article>
      </div>
    </section>
  );
}
