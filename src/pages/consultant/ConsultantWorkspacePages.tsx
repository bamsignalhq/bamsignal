import { ConsultantCapabilityGate } from "../../components/consultant/ConsultantCapabilityGate";
import { ConsultantPortfolioPage } from "../../components/admin/concierge/ConsultantPortfolioPage";
import { IntroductionEnginePage } from "../../components/admin/concierge/IntroductionEnginePage";
import { RelationshipFollowUpPage } from "../../components/admin/concierge/RelationshipFollowUpPage";
import { CONCIERGE_DASHBOARD_SUBTITLE } from "../../constants/conciergeConsultant";
import { SIGNAL_CONCIERGE_STATUS_LABELS } from "../../constants/signalConcierge";
import { listConciergeMembers } from "../../utils/conciergeConsultantStore";
import { getCurrentConsultant } from "../../utils/consultantSession";

type ConsultantMembersWorkspaceProps = {
  consultantId: string;
};

export function ConsultantMembersWorkspace({ consultantId }: ConsultantMembersWorkspaceProps) {
  const members = listConciergeMembers().filter(
    (member) => member.currentConsultantId === consultantId || member.assignedConsultantId === consultantId
  );

  return (
    <ConsultantCapabilityGate
      capability={[
        "view-members",
        "legacy-members",
        "global-members",
        "view-global-members",
        "view-family-journeys",
        "review-applications"
      ]}
      title="Members"
    >
      <div className="consultant-workspace">
        <header className="consultant-workspace__head">
          <h2>Members</h2>
          <p>{CONCIERGE_DASHBOARD_SUBTITLE}</p>
        </header>
        {members.length === 0 ? (
          <p className="concierge-consultant__empty">No assigned members in your portfolio yet.</p>
        ) : (
          <ul className="consultant-workspace__member-list">
            {members.map((member) => (
              <li key={member.id} className="concierge-consultant-member-row">
                <strong>{member.aboutYou.name}</strong>
                <span>
                  {member.aboutYou.city} · {SIGNAL_CONCIERGE_STATUS_LABELS[member.status]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </ConsultantCapabilityGate>
  );
}

export function ConsultantPortfolioWorkspace() {
  const consultant = getCurrentConsultant();
  if (!consultant) return null;

  return (
    <ConsultantCapabilityGate capability="view-portfolio" title="Portfolio">
      <ConsultantPortfolioPage consultantId={consultant.consultantId} mode="portfolio" />
    </ConsultantCapabilityGate>
  );
}

export function ConsultantIntroductionsWorkspace() {
  return (
    <ConsultantCapabilityGate capability="manage-introductions" title="Introductions">
      <IntroductionEnginePage />
    </ConsultantCapabilityGate>
  );
}

export function ConsultantFollowUpsWorkspace() {
  return (
    <ConsultantCapabilityGate capability="manage-followups" title="Follow-Ups">
      <RelationshipFollowUpPage />
    </ConsultantCapabilityGate>
  );
}
