import { useMemo } from "react";
import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  PREMARITAL_JOURNEY_FUTURE_CAPABILITIES,
  PREMARITAL_JOURNEY_FOUNDATION_COPY,
  PREMARITAL_JOURNEY_HERO_COPY,
  PREMARITAL_JOURNEY_LABEL,
  PREMARITAL_JOURNEY_PURPOSE_COPY,
  PREMARITAL_JOURNEY_RESERVED_COPY,
  PREMARITAL_JOURNEY_SUBCOPY,
  PREMARITAL_JOURNEY_TITLE,
  PREPARED_PREMARITAL_MODULES,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/premaritalJourney";
import { getPremaritalJourneyBundle } from "../../../utils/PremaritalJourneyEngine";
import { JourneyMilestoneCard } from "./JourneyMilestoneCard";
import { PremaritalModuleCard } from "./PremaritalModuleCard";

export function PremaritalJourneyPage() {
  const bundle = useMemo(() => getPremaritalJourneyBundle(), []);

  return (
    <div className="pj-page">
      <header className="pj-page__hero institute-glass">
        <p className="bi-page__eyebrow">{PREMARITAL_JOURNEY_LABEL}</p>
        <h1>{PREMARITAL_JOURNEY_TITLE}</h1>
        <p>{PREMARITAL_JOURNEY_HERO_COPY}</p>
        <p>{PREMARITAL_JOURNEY_SUBCOPY}</p>
        <p className="pj-page__labels">
          {PREMARITAL_JOURNEY_FOUNDATION_COPY} · {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} ·{" "}
          {RELATIONSHIP_WISDOM_LABEL} · {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="pj-page__purpose">{PREMARITAL_JOURNEY_PURPOSE_COPY}</p>
      </header>

      <section className="pj-page__prepared institute-glass">
        <h2>Prepared modules</h2>
        <p>{bundle.moduleCount} modules — architecture preview, not enabled yet.</p>
        <ul className="pj-page__prepared-list">
          {PREPARED_PREMARITAL_MODULES.map((module) => (
            <li key={module.id}>
              <strong>
                {module.order}. {module.title}
              </strong>
              <span>{module.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="pj-page__section">
        <header className="bi-section-head">
          <h2>Journey modules</h2>
          <p>{PREMARITAL_JOURNEY_FOUNDATION_COPY} — prepared, not enabled yet.</p>
        </header>
        <div className="pj-page__grid">
          {bundle.modules.map((module) => (
            <PremaritalModuleCard key={module.id} module={module} />
          ))}
        </div>
      </section>

      {bundle.modules.map((module) => (
        <JourneyMilestoneCard
          key={`${module.id}-milestones`}
          title={module.title}
          milestones={module.milestones}
        />
      ))}

      <section className="pj-page__future institute-glass">
        <h2>Future ready</h2>
        <ul>
          {PREMARITAL_JOURNEY_FUTURE_CAPABILITIES.map((capability) => (
            <li key={capability.id}>
              <strong>{capability.label}</strong>
              <span>{capability.description}</span>
            </li>
          ))}
        </ul>
        <p className="pj-page__reserved">{PREMARITAL_JOURNEY_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
