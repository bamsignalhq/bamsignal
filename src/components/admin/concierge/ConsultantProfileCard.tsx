import {
  CONCIERGE_CONSULTANT_ROLE_LABELS,
  CONCIERGE_CONSULTANT_ROLES
} from "../../../constants/conciergeConsultantRoles";
import type { ConciergeConsultantMetrics } from "../../../types/conciergeConsultantDirectory";
import type { ConciergeConsultantRecord } from "../../../types/conciergeConsultantDirectory";
import { CONCIERGE_CONSULTANT_METRIC_LABELS } from "../../../constants/conciergeConsultantCommunication";
import { ConsultantRoleBadge } from "./ConsultantRoleBadge";

type ConsultantProfileCardProps = {
  consultant: ConciergeConsultantRecord;
  metrics: ConciergeConsultantMetrics;
  memberCount: number;
  selected?: boolean;
  onSelect?: () => void;
  onActivate?: () => void;
  onDeactivate?: () => void;
  onFreeze?: () => void;
};

function statusLabel(status: ConciergeConsultantRecord["status"]): string {
  if (status === "active") return "Active";
  if (status === "invited") return "Invited";
  if (status === "frozen") return "Frozen";
  return "Inactive";
}

export function ConsultantProfileCard({
  consultant,
  metrics,
  memberCount,
  selected = false,
  onSelect,
  onActivate,
  onDeactivate,
  onFreeze
}: ConsultantProfileCardProps) {
  const roleMeta = CONCIERGE_CONSULTANT_ROLES.find((role) => role.id === consultant.primaryRole);

  return (
    <article
      className={`consultant-profile-card concierge-consultant-card--glass cc-reveal${
        selected ? " consultant-profile-card--selected" : ""
      }`}
    >
      <button type="button" className="consultant-profile-card__main" onClick={onSelect}>
        <div className="consultant-profile-card__head">
          <div>
            <h3>{consultant.name}</h3>
            <p>{consultant.email}</p>
          </div>
          <span className={`consultant-profile-card__status consultant-profile-card__status--${consultant.status}`}>
            {statusLabel(consultant.status)}
          </span>
        </div>
        <div className="consultant-profile-card__roles">
          <ConsultantRoleBadge role={consultant.primaryRole} primary />
          {consultant.roles
            .filter((role) => role !== consultant.primaryRole)
            .map((role) => (
              <ConsultantRoleBadge key={role} role={role} />
            ))}
        </div>
        {roleMeta?.description ? (
          <p className="consultant-profile-card__bio">{roleMeta.description}</p>
        ) : consultant.bio ? (
          <p className="consultant-profile-card__bio">{consultant.bio}</p>
        ) : null}
        <div className="consultant-profile-card__stats">
          <div>
            <strong>{memberCount}</strong>
            <span>Members</span>
          </div>
          <div>
            <strong>{metrics.introductionsMade}</strong>
            <span>Introductions</span>
          </div>
          <div>
            <strong>{metrics.consultationsCompleted}</strong>
            <span>Consultations</span>
          </div>
        </div>
      </button>
      <div className="consultant-profile-card__actions">
        {consultant.status !== "active" ? (
          <button type="button" className="concierge-consultant-btn" onClick={onActivate}>
            Activate
          </button>
        ) : (
          <button type="button" className="concierge-consultant-btn" onClick={onDeactivate}>
            Deactivate
          </button>
        )}
        {consultant.status === "active" ? (
          <button type="button" className="concierge-consultant-btn" onClick={onFreeze}>
            Freeze access
          </button>
        ) : null}
      </div>
      <p className="consultant-profile-card__metrics-hint">
        Primary role: {CONCIERGE_CONSULTANT_ROLE_LABELS[consultant.primaryRole]} ·{" "}
        {CONCIERGE_CONSULTANT_METRIC_LABELS.matchesFormed}: {metrics.matchesFormed}
      </p>
    </article>
  );
}
