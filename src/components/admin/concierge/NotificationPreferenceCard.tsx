import {
  NOTIFICATION_CHANNELS,
  NOTIFICATION_PRIVACY_COPY
} from "../../../constants/notificationEvents";
import type { NotificationPreference } from "../../../types/notificationEvents";

type NotificationPreferenceCardProps = {
  preferences: NotificationPreference;
};

export function NotificationPreferenceCard({ preferences }: NotificationPreferenceCardProps) {
  return (
    <section className="notification-preferences concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Notification preferences</h3>
        <p>{NOTIFICATION_PRIVACY_COPY}</p>
      </header>
      <ul className="notification-preferences__channels">
        {NOTIFICATION_CHANNELS.map((channel) => (
          <li
            key={channel.id}
            className={`notification-preferences__channel${
              preferences.channels[channel.id] ? " is-enabled" : ""
            }`}
          >
            <div>
              <strong>{channel.label}</strong>
              <span>{channel.hint}</span>
            </div>
            <span className="notification-preferences__state">
              {preferences.channels[channel.id] ? "Enabled" : "Off"}
            </span>
          </li>
        ))}
      </ul>
      <dl className="notification-preferences__flags">
        <div>
          <dt>Quiet hours</dt>
          <dd>{preferences.quietHoursEnabled ? "Respected" : "Not set"}</dd>
        </div>
        <div>
          <dt>Steward copy</dt>
          <dd>{preferences.stewardCopyOnly ? "Human-reviewed only" : "Standard"}</dd>
        </div>
      </dl>
    </section>
  );
}
