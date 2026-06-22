import { useMemo } from "react";
import {
  FUTURE_READY_TRUST_MILESTONE_CAPABILITIES,
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  PREPARED_TRUST_MILESTONE_HONORS,
  RELATIONSHIP_WISDOM_LABEL,
  TRUST_MILESTONES_FORBIDDEN_COPY,
  TRUST_MILESTONES_FUTURE_READY_COPY,
  TRUST_MILESTONES_GOOD_COPY,
  TRUST_MILESTONES_LABEL,
  TRUST_MILESTONES_PURPOSE_COPY,
  TRUST_MILESTONES_RESERVED_COPY,
  TRUST_MILESTONES_SUBCOPY,
  TRUST_MILESTONES_TITLE,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/trustMilestones";
import { getTrustMilestonesBundle } from "../../../utils/TrustMilestonesEngine";
import { LegacyContributorCard } from "./LegacyContributorCard";
import { TrustJourneyTimeline } from "./TrustJourneyTimeline";
import { TrustMilestoneCard } from "./TrustMilestoneCard";

export function TrustMilestonesPage() {
  const bundle = useMemo(() => getTrustMilestonesBundle(), []);

  return (
    <div className="tms-page">
      <header className="tms-page__hero institute-glass">
        <p className="bi-page__eyebrow">{TRUST_MILESTONES_LABEL}</p>
        <h1>{TRUST_MILESTONES_TITLE}</h1>
        <p>{TRUST_MILESTONES_SUBCOPY}</p>
        <p className="tms-page__labels">
          {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} · {RELATIONSHIP_WISDOM_LABEL} ·{" "}
          {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="tms-page__purpose">{TRUST_MILESTONES_PURPOSE_COPY}</p>
      </header>

      <section className="tms-page__copy-rules institute-glass">
        <h2>Copy guidance</h2>
        <p>
          Use: {TRUST_MILESTONES_GOOD_COPY.join(", ")}. Avoid:{" "}
          {TRUST_MILESTONES_FORBIDDEN_COPY.join(", ")}.
        </p>
      </section>

      <section className="tms-page__prepared institute-glass">
        <h2>Prepared milestones</h2>
        <p>{bundle.honorCount} milestones — celebrate stewardship, not employee badges.</p>
        <ul className="tms-page__prepared-list">
          {PREPARED_TRUST_MILESTONE_HONORS.map((honor) => (
            <li key={honor.id}>
              <strong>{honor.title}</strong>
              <span>{honor.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="tms-page__section">
        <header className="bi-section-head">
          <h2>Trust milestones</h2>
          <p>Long-term stewardship honoured — prepared, not enabled yet.</p>
        </header>
        <div className="tms-page__grid">
          {bundle.honors.map((honor) => (
            <TrustMilestoneCard key={honor.id} honor={honor} />
          ))}
        </div>
      </section>

      <section className="tms-page__section">
        <header className="bi-section-head">
          <h2>Trust Journey timelines</h2>
          <p>Trust Journey over time — celebration, not years-worked tallies.</p>
        </header>
        <div className="tms-page__grid">
          {bundle.journeys.map((journey) => (
            <TrustJourneyTimeline key={journey.honorId} journey={journey} />
          ))}
        </div>
      </section>

      <section className="tms-page__section">
        <header className="bi-section-head">
          <h2>Legacy contributors</h2>
          <p>Legacy Contributor and Lifetime Steward — reserved profiles, not badges.</p>
        </header>
        <div className="tms-page__grid">
          {bundle.contributors.map((contributor) => (
            <LegacyContributorCard key={contributor.id} contributor={contributor} />
          ))}
        </div>
      </section>

      <section className="tms-page__future-ready institute-glass">
        <h2>Future-ready capabilities</h2>
        <p>{TRUST_MILESTONES_FUTURE_READY_COPY}</p>
        <ul className="tms-page__prepared-list">
          {FUTURE_READY_TRUST_MILESTONE_CAPABILITIES.map((capability) => (
            <li key={capability.id}>
              <strong>{capability.title}</strong>
              <span>{capability.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="tms-page__reserved-note institute-glass">
        <p>{TRUST_MILESTONES_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
