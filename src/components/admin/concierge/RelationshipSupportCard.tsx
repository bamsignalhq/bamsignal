import {
  RELATIONSHIP_ADVISORS_LABEL,
  RELATIONSHIP_GUIDANCE_LABEL,
  RELATIONSHIP_JOURNEY_SUPPORT_LABEL,
  RELATIONSHIP_SUPPORT_FUTURE_CAPABILITIES,
  RELATIONSHIP_SUPPORT_RESERVED_COPY,
  RELATIONSHIP_SUPPORT_ROLES,
  RELATIONSHIP_SUPPORT_SUBCOPY,
  RELATIONSHIP_SUPPORT_TITLE,
  type RelationshipSupportRoleId
} from "../../../constants/RelationshipSupportRole";
import { RelationshipAdvisorBadge } from "./RelationshipAdvisorBadge";
import { RelationshipSupportTimeline } from "./RelationshipSupportTimeline";

type RelationshipSupportCardProps = {
  /** Optional — highlight a mapped advisor role for a journey. */
  mappedRoleId?: RelationshipSupportRoleId;
};

export function RelationshipSupportCard({ mappedRoleId }: RelationshipSupportCardProps) {
  return (
    <div className="relationship-support">
      <section className="relationship-support-card concierge-consultant-card--glass">
        <header className="concierge-consultant-card__head">
          <h3>{RELATIONSHIP_SUPPORT_TITLE}</h3>
          <p>{RELATIONSHIP_SUPPORT_SUBCOPY}</p>
        </header>

        <p className="relationship-support-card__labels">
          {RELATIONSHIP_JOURNEY_SUPPORT_LABEL} · {RELATIONSHIP_GUIDANCE_LABEL} ·{" "}
          {RELATIONSHIP_ADVISORS_LABEL}
        </p>

        {mappedRoleId ? (
          <div className="relationship-support-card__mapped">
            <span className="relationship-support-card__mapped-label">Mapped advisor</span>
            <RelationshipAdvisorBadge role={mappedRoleId} primary />
          </div>
        ) : null}

        <div className="relationship-support-card__roles">
          <h4>Future specialists</h4>
          <ul className="relationship-support-card__role-list">
            {RELATIONSHIP_SUPPORT_ROLES.map((role) => (
              <li key={role.id}>
                <div className="relationship-support-card__role-head">
                  <RelationshipAdvisorBadge role={role.id} primary={role.id === mappedRoleId} />
                  <span className="relationship-support-card__focus">{role.journeyFocus}</span>
                </div>
                <p>{role.description}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="relationship-support-card__future">
          <h4>Future ready</h4>
          <ul>
            {RELATIONSHIP_SUPPORT_FUTURE_CAPABILITIES.map((capability) => (
              <li key={capability.id}>
                <strong>{capability.label}</strong>
                <span>{capability.description}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relationship-support-card__reserved">{RELATIONSHIP_SUPPORT_RESERVED_COPY}</p>
      </section>

      <RelationshipSupportTimeline />
    </div>
  );
}
