import { useMemo } from "react";
import {
  FAMILY_ADVISORS_LABEL,
  FAMILY_ADVISORS_PURPOSE_COPY,
  FAMILY_ADVISORS_RESERVED_COPY,
  FAMILY_ADVISORS_SUBCOPY,
  FAMILY_ADVISORS_TITLE,
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  PREPARED_FAMILY_ADVISOR_SPECIALTIES,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/familyAdvisors";
import { getFamilyAdvisorsBundle } from "../../../utils/FamilyAdvisorsEngine";
import { AdvisorProfileCard } from "./AdvisorProfileCard";
import { AdvisorTimelineCard } from "./AdvisorTimelineCard";

export function FamilyAdvisorPage() {
  const bundle = useMemo(() => getFamilyAdvisorsBundle(), []);

  return (
    <div className="fadv-page">
      <header className="fadv-page__hero institute-glass">
        <p className="bi-page__eyebrow">{FAMILY_ADVISORS_LABEL}</p>
        <h1>{FAMILY_ADVISORS_TITLE}</h1>
        <p>{FAMILY_ADVISORS_SUBCOPY}</p>
        <p className="fadv-page__labels">
          {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} · {RELATIONSHIP_WISDOM_LABEL} ·{" "}
          {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="fadv-page__purpose">{FAMILY_ADVISORS_PURPOSE_COPY}</p>
      </header>

      <section className="fadv-page__prepared institute-glass">
        <h2>Prepared specialties</h2>
        <p>{bundle.specialtyCount} specialties — architecture preview, not live yet.</p>
        <ul className="fadv-page__prepared-list">
          {PREPARED_FAMILY_ADVISOR_SPECIALTIES.map((specialty) => (
            <li key={specialty.id}>
              <strong>{specialty.title}</strong>
              <span>{specialty.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="fadv-page__section">
        <header className="bi-section-head">
          <h2>Advisor profiles</h2>
          <p>Family advisors prepared — not enabled yet.</p>
        </header>
        <div className="fadv-page__grid">
          {bundle.advisors.map((advisor) => (
            <AdvisorProfileCard key={advisor.id} advisor={advisor} />
          ))}
        </div>
      </section>

      {bundle.advisors.map((advisor) => (
        <AdvisorTimelineCard
          key={`${advisor.id}-timeline`}
          title={advisor.specialtyTitle}
          entries={advisor.timeline}
        />
      ))}

      <section className="fadv-page__reserved-note institute-glass">
        <p>{FAMILY_ADVISORS_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
