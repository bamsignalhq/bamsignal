import { useMemo } from "react";
import { SIGNAL_CONCIERGE_EMAIL_ENGINE_BRAND } from "../../../constants/emailTemplates";
import type { ConciergeMemberRecord } from "../../../types/conciergeConsultant";
import { ensureMemberEmailBundle } from "../../../utils/EmailNotificationEngine";
import { EmailHistoryCard } from "./EmailHistoryCard";
import { EmailPreviewCard } from "./EmailPreviewCard";
import { EmailStatusBadge } from "./EmailStatusBadge";

type MemberEmailSectionProps = {
  member: ConciergeMemberRecord;
};

export function MemberEmailSection({ member }: MemberEmailSectionProps) {
  const bundle = useMemo(() => ensureMemberEmailBundle(member), [member]);

  return (
    <section className="member-emails">
      <header className="member-emails__section-head cc-reveal">
        <h2>Journey emails</h2>
        <p>{SIGNAL_CONCIERGE_EMAIL_ENGINE_BRAND} — dignified Resend delivery for member journey updates.</p>
      </header>

      <div className="member-emails__overview concierge-consultant-card concierge-consultant-card--glass cc-reveal">
        <dl className="member-emails__grid">
          <div>
            <dt>Delivery status</dt>
            <dd>
              <EmailStatusBadge status={bundle.summaryStatus} />
            </dd>
          </div>
          <div>
            <dt>Recent emails</dt>
            <dd>{bundle.recent.length}</dd>
          </div>
          <div>
            <dt>History entries</dt>
            <dd>{bundle.history.length}</dd>
          </div>
        </dl>
        <p className="member-emails__narrative">{bundle.narrative}</p>
      </div>

      <div className="member-emails__cards">
        {bundle.recent.length > 0 ? (
          <div className="member-emails__recent">
            <h3 className="member-emails__recent-title">Recent emails</h3>
            <div className="member-emails__recent-list">
              {bundle.recent.map((email) => (
                <EmailPreviewCard key={email.id} email={email} />
              ))}
            </div>
          </div>
        ) : null}
        <EmailHistoryCard history={bundle.history} />
      </div>
    </section>
  );
}
