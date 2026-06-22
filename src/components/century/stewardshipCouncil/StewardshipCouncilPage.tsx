import { useMemo } from "react";
import {
  COUNCIL_ROLES,
  STEWARDSHIP_COUNCIL_FUTURE_MODULES,
  STEWARDSHIP_COUNCIL_LABEL,
  STEWARDSHIP_COUNCIL_PURPOSE_COPY,
  STEWARDSHIP_COUNCIL_RESERVED_COPY,
  STEWARDSHIP_COUNCIL_SUBCOPY,
  STEWARDSHIP_COUNCIL_TITLE,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/stewardshipCouncil";
import { getStewardshipCouncilBundle } from "../../../utils/StewardshipCouncilEngine";
import { CouncilMemberCard } from "./CouncilMemberCard";
import { CouncilResponsibilitiesCard } from "./CouncilResponsibilitiesCard";
import { CouncilRoleCard } from "./CouncilRoleCard";
import { CouncilTimelineCard } from "./CouncilTimelineCard";
import { StewardshipOathCard } from "./StewardshipOathCard";

export function StewardshipCouncilPage() {
  const bundle = useMemo(() => getStewardshipCouncilBundle(), []);

  return (
    <div className="stc-page">
      <header className="stc-page__hero institute-glass">
        <p className="bi-page__eyebrow">{STEWARDSHIP_COUNCIL_LABEL}</p>
        <h1>{STEWARDSHIP_COUNCIL_TITLE}</h1>
        <p>{STEWARDSHIP_COUNCIL_SUBCOPY}</p>
        <p className="stc-page__labels">
          {UNDERSTANDING_RELATIONSHIPS_LABEL} · Custodians · Century Stewardship
        </p>
        <p className="stc-page__purpose">{STEWARDSHIP_COUNCIL_PURPOSE_COPY}</p>
      </header>

      <section className="stc-page__prepared institute-glass">
        <h2>Council roles</h2>
        <p>{bundle.roleCount} council roles — architecture preview, not authority or permissions.</p>
        <ul className="stc-page__prepared-list">
          {COUNCIL_ROLES.map((role) => (
            <li key={role.id}>
              <strong>{role.title}</strong>
              <span>{role.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="stc-page__section">
        <header className="bi-section-head">
          <h2>Council roles</h2>
          <p>Chairman through Institution Steward — documented custodians, never voting.</p>
        </header>
        <div className="stc-page__grid">
          {bundle.roles.map((role) => (
            <CouncilRoleCard key={role.id} role={role} />
          ))}
        </div>
      </section>

      <section className="stc-page__section">
        <header className="bi-section-head">
          <h2>Council seats</h2>
          <p>Reserved seats — no names, no assignments, architecture only.</p>
        </header>
        <div className="stc-page__grid">
          {bundle.members.map((member) => (
            <CouncilMemberCard key={member.id} member={member} />
          ))}
        </div>
      </section>

      <section className="stc-page__section stc-page__split">
        <StewardshipOathCard oath={bundle.oath} />
        <CouncilTimelineCard entries={bundle.timeline} />
      </section>

      <section className="stc-page__section">
        <CouncilResponsibilitiesCard responsibilities={bundle.responsibilities} />
      </section>

      <section className="stc-page__future institute-glass">
        <h2>Future ready</h2>
        <ul>
          {STEWARDSHIP_COUNCIL_FUTURE_MODULES.map((module) => (
            <li key={module.id}>
              <strong>{module.label}</strong>
              <span>{module.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="stc-page__reserved-note institute-glass">
        <p>{STEWARDSHIP_COUNCIL_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
