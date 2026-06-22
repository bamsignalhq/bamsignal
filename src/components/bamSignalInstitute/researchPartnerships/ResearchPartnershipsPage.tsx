import { useMemo } from "react";
import {
  COLLABORATIONS_LABEL,
  INSTITUTIONAL_RELATIONSHIPS_LABEL,
  PARTNER_CATEGORIES,
  PREPARED_INSTITUTIONS,
  RESEARCH_PARTNERSHIPS_FUTURE_CAPABILITIES,
  RESEARCH_PARTNERSHIPS_LABEL,
  RESEARCH_PARTNERSHIPS_PURPOSE_COPY,
  RESEARCH_PARTNERSHIPS_RESERVED_COPY,
  RESEARCH_PARTNERSHIPS_SUBCOPY,
  RESEARCH_PARTNERSHIPS_TITLE,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/researchPartnerships";
import { getResearchPartnershipsBundle } from "../../../utils/ResearchPartnershipsEngine";
import { InstitutionCard } from "./InstitutionCard";
import { PartnerCategoryCard } from "./PartnerCategoryCard";
import { PartnershipTimelineCard } from "./PartnershipTimelineCard";

export function ResearchPartnershipsPage() {
  const bundle = useMemo(() => getResearchPartnershipsBundle(), []);

  return (
    <div className="rp-page">
      <header className="rp-page__hero institute-glass">
        <p className="bi-page__eyebrow">{RESEARCH_PARTNERSHIPS_LABEL}</p>
        <h1>{RESEARCH_PARTNERSHIPS_TITLE}</h1>
        <p>{RESEARCH_PARTNERSHIPS_SUBCOPY}</p>
        <p className="rp-page__labels">
          {INSTITUTIONAL_RELATIONSHIPS_LABEL} · {COLLABORATIONS_LABEL} ·{" "}
          {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="rp-page__purpose">{RESEARCH_PARTNERSHIPS_PURPOSE_COPY}</p>
      </header>

      <section className="rp-page__categories">
        <header className="bi-section-head">
          <h2>Partner categories</h2>
          <p>Institutional relationships — never sponsors or affiliates.</p>
        </header>
        <div className="rp-page__grid rp-page__grid--categories">
          {bundle.categories.map((category) => (
            <PartnerCategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      <section className="rp-page__prepared institute-glass">
        <h2>Prepared partners</h2>
        <p>
          {PARTNER_CATEGORIES.length} categories · {PREPARED_INSTITUTIONS.length} institutions — architecture
          preview.
        </p>
        <ul className="rp-page__prepared-list">
          {PARTNER_CATEGORIES.map((category) => (
            <li key={category.id}>
              <strong>{category.label}</strong>
              <span>{category.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rp-page__section">
        <header className="bi-section-head">
          <h2>Institutions</h2>
          <p>Institutional relationships prepared — not enabled yet.</p>
        </header>
        <div className="rp-page__grid">
          {bundle.institutions.map((institution) => (
            <InstitutionCard key={institution.id} institution={institution} />
          ))}
        </div>
      </section>

      {bundle.institutions.map((institution) => (
        <PartnershipTimelineCard
          key={`${institution.id}-timeline`}
          title={institution.name}
          entries={institution.timeline}
        />
      ))}

      <section className="rp-page__future institute-glass">
        <h2>Future ready</h2>
        <ul>
          {RESEARCH_PARTNERSHIPS_FUTURE_CAPABILITIES.map((capability) => (
            <li key={capability.id}>
              <strong>{capability.label}</strong>
              <span>{capability.description}</span>
            </li>
          ))}
        </ul>
        <p className="rp-page__reserved">{RESEARCH_PARTNERSHIPS_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
