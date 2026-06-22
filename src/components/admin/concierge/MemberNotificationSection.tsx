import { useMemo } from "react";
import { SIGNAL_CONCIERGE_NOTIFICATION_ENGINE_BRAND } from "../../../constants/notificationEvents";
import type { ConciergeMemberRecord } from "../../../types/conciergeConsultant";
import { ensureMemberNotificationBundle } from "../../../utils/SignalConciergeNotificationEngine";
import { NotificationCard } from "./NotificationCard";
import { NotificationHistoryCard } from "./NotificationHistoryCard";
import { NotificationPreferenceCard } from "./NotificationPreferenceCard";
import { NotificationStatusBadge } from "./NotificationStatusBadge";

type MemberNotificationSectionProps = {
  member: ConciergeMemberRecord;
};

export function MemberNotificationSection({ member }: MemberNotificationSectionProps) {
  const bundle = useMemo(() => ensureMemberNotificationBundle(member), [member]);

  return (
    <section className="member-notifications">
      <header className="member-notifications__section-head cc-reveal">
        <h2>Notifications</h2>
        <p>{SIGNAL_CONCIERGE_NOTIFICATION_ENGINE_BRAND} — dignified, private journey communications.</p>
      </header>

      <div className="member-notifications__overview concierge-consultant-card concierge-consultant-card--glass cc-reveal">
        <dl className="member-notifications__grid">
          <div>
            <dt>Status</dt>
            <dd>
              <NotificationStatusBadge status={bundle.summaryStatus} />
            </dd>
          </div>
          <div>
            <dt>Recent notifications</dt>
            <dd>{bundle.recent.length}</dd>
          </div>
          <div>
            <dt>History entries</dt>
            <dd>{bundle.history.length}</dd>
          </div>
        </dl>
        <p className="member-notifications__narrative">{bundle.narrative}</p>
      </div>

      <div className="member-notifications__cards">
        <NotificationPreferenceCard preferences={bundle.preferences} />
        {bundle.recent.length > 0 ? (
          <div className="member-notifications__recent">
            <h3 className="member-notifications__recent-title">Recent notifications</h3>
            <div className="member-notifications__recent-list">
              {bundle.recent.map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))}
            </div>
          </div>
        ) : null}
        <NotificationHistoryCard history={bundle.history} />
      </div>
    </section>
  );
}
