import { useMemo } from "react";
import { WHATSAPP_NOTIFICATION_ENGINE_BRAND, WHATSAPP_OPERATIONAL_RULES } from "../../../constants/whatsappTemplates";
import type { ConciergeMemberRecord } from "../../../types/conciergeConsultant";
import { ensureMemberWhatsappBundle } from "../../../utils/WhatsappNotificationEngine";
import { WhatsappHistoryCard } from "./WhatsappHistoryCard";
import { WhatsappPreviewCard } from "./WhatsappPreviewCard";
import { WhatsappStatusBadge } from "./WhatsappStatusBadge";

type MemberWhatsappSectionProps = {
  member: ConciergeMemberRecord;
};

export function MemberWhatsappSection({ member }: MemberWhatsappSectionProps) {
  const bundle = useMemo(() => ensureMemberWhatsappBundle(member), [member]);

  return (
    <section className="member-whatsapp">
      <header className="member-whatsapp__section-head cc-reveal">
        <h2>WhatsApp notifications</h2>
        <p>
          {WHATSAPP_NOTIFICATION_ENGINE_BRAND} — {WHATSAPP_OPERATIONAL_RULES.toLowerCase()}
        </p>
      </header>

      <div className="member-whatsapp__overview concierge-consultant-card concierge-consultant-card--glass cc-reveal">
        <dl className="member-whatsapp__grid">
          <div>
            <dt>Delivery status</dt>
            <dd>
              <WhatsappStatusBadge status={bundle.summaryStatus} />
            </dd>
          </div>
          <div>
            <dt>Recent messages</dt>
            <dd>{bundle.recent.length}</dd>
          </div>
          <div>
            <dt>History entries</dt>
            <dd>{bundle.history.length}</dd>
          </div>
        </dl>
        <p className="member-whatsapp__narrative">{bundle.narrative}</p>
      </div>

      <div className="member-whatsapp__cards">
        {bundle.recent.length > 0 ? (
          <div className="member-whatsapp__recent">
            <h3 className="member-whatsapp__recent-title">Recent WhatsApp messages</h3>
            <div className="member-whatsapp__recent-list">
              {bundle.recent.map((notification) => (
                <WhatsappPreviewCard key={notification.id} notification={notification} />
              ))}
            </div>
          </div>
        ) : null}
        <WhatsappHistoryCard history={bundle.history} />
      </div>
    </section>
  );
}
