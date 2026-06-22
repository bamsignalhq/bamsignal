import { useMemo } from "react";
import {
  GOVERNANCE_FRAMEWORK_LABEL,
  GOVERNANCE_FRAMEWORK_PURPOSE_COPY,
  GOVERNANCE_FRAMEWORK_RESERVED_COPY,
  GOVERNANCE_FRAMEWORK_SUBCOPY,
  GOVERNANCE_FRAMEWORK_TITLE,
  GOVERNANCE_FUTURE_MODULES,
  GOVERNANCE_PILLARS,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/governanceFramework";
import { getGovernanceFrameworkBundle } from "../../../utils/GovernanceFrameworkEngine";
import { GovernancePillarCard } from "./GovernancePillarCard";
import { GovernanceTimelineCard } from "./GovernanceTimelineCard";
import { InstitutionCommitmentCard } from "./InstitutionCommitmentCard";
import { StewardshipPrinciplesCard } from "./StewardshipPrinciplesCard";

export function GovernanceFrameworkPage() {
  const bundle = useMemo(() => getGovernanceFrameworkBundle(), []);

  return (
    <div className="govf-page">
      <header className="govf-page__hero institute-glass">
        <p className="bi-page__eyebrow">{GOVERNANCE_FRAMEWORK_LABEL}</p>
        <h1>{GOVERNANCE_FRAMEWORK_TITLE}</h1>
        <p>{GOVERNANCE_FRAMEWORK_SUBCOPY}</p>
        <p className="govf-page__labels">{UNDERSTANDING_RELATIONSHIPS_LABEL} · Stewardship · Institution</p>
        <p className="govf-page__purpose">{GOVERNANCE_FRAMEWORK_PURPOSE_COPY}</p>
      </header>

      <section className="govf-page__prepared institute-glass">
        <h2>Governance pillars</h2>
        <p>
          {bundle.pillarCount} stewardship pillars — architecture preview, not permissions or voting.
        </p>
        <ul className="govf-page__prepared-list">
          {GOVERNANCE_PILLARS.map((pillar) => (
            <li key={pillar.id}>
              <strong>{pillar.title}</strong>
              <span>{pillar.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="govf-page__section">
        <header className="bi-section-head">
          <h2>Stewardship pillars</h2>
          <p>Mission through Institution — documented governance, never legal implementation.</p>
        </header>
        <div className="govf-page__grid">
          {bundle.pillars.map((pillar) => (
            <GovernancePillarCard key={pillar.id} pillar={pillar} />
          ))}
        </div>
      </section>

      <section className="govf-page__section govf-page__split">
        <StewardshipPrinciplesCard principles={bundle.principles} />
        <GovernanceTimelineCard entries={bundle.timeline} />
      </section>

      <section className="govf-page__section">
        <InstitutionCommitmentCard commitments={bundle.commitments} />
      </section>

      <section className="govf-page__future institute-glass">
        <h2>Future ready</h2>
        <ul>
          {GOVERNANCE_FUTURE_MODULES.map((module) => (
            <li key={module.id}>
              <strong>{module.label}</strong>
              <span>{module.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="govf-page__reserved-note institute-glass">
        <p>{GOVERNANCE_FRAMEWORK_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
