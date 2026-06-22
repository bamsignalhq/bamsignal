import { useMemo } from "react";
import {
  AFRICAN_RELATIONSHIP_CULTURE_LABEL,
  BAMSIGNAL_INSTITUTE_PURPOSE_COPY,
  BAMSIGNAL_INSTITUTE_RESERVED_COPY,
  BAMSIGNAL_INSTITUTE_SUBCOPY,
  BAMSIGNAL_INSTITUTE_TITLE,
  INSTITUTE_FUTURE_CAPABILITIES,
  INSIGHTS_LABEL,
  RESEARCH_AREAS,
  RESEARCH_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../constants/bamSignalInstitute";
import { bamSignalInstitutePathForRoute } from "../../constants/bamSignalInstituteRoutes";
import { navigateToPath } from "../../constants/routes";
import { getBamSignalInstituteBundle } from "../../utils/BamSignalInstituteEngine";
import { ResearchCategoryCard } from "./ResearchCategoryCard";

export function BamSignalInstitutePage() {
  const bundle = useMemo(() => getBamSignalInstituteBundle(), []);

  return (
    <div className="bi-page">
      <header className="bi-page__hero institute-glass">
        <p className="bi-page__eyebrow">{INSIGHTS_LABEL}</p>
        <h1>{BAMSIGNAL_INSTITUTE_TITLE}</h1>
        <p>{BAMSIGNAL_INSTITUTE_SUBCOPY}</p>
        <p className="bi-page__labels">
          {RESEARCH_LABEL} · {UNDERSTANDING_RELATIONSHIPS_LABEL} · {AFRICAN_RELATIONSHIP_CULTURE_LABEL}
        </p>
        <p className="bi-page__purpose">{BAMSIGNAL_INSTITUTE_PURPOSE_COPY}</p>
        <div className="bi-page__actions">
          <button
            type="button"
            className="bi-page__btn bi-page__btn--primary"
            onClick={() => navigateToPath(bamSignalInstitutePathForRoute("programs"))}
          >
            Research programs
          </button>
          <button
            type="button"
            className="bi-page__btn"
            onClick={() => navigateToPath(bamSignalInstitutePathForRoute("annualInsights"))}
          >
            Annual insights
          </button>
          <button
            type="button"
            className="bi-page__btn"
            onClick={() => navigateToPath(bamSignalInstitutePathForRoute("annualRelationshipReports"))}
          >
            Annual reports
          </button>
          <button
            type="button"
            className="bi-page__btn"
            onClick={() => navigateToPath(bamSignalInstitutePathForRoute("relationshipLab"))}
          >
            Relationship Lab
          </button>
          <button
            type="button"
            className="bi-page__btn"
            onClick={() => navigateToPath(bamSignalInstitutePathForRoute("bamSignalInsights"))}
          >
            BamSignal Insights
          </button>
          <button
            type="button"
            className="bi-page__btn"
            onClick={() => navigateToPath(bamSignalInstitutePathForRoute("researchPartnerships"))}
          >
            Research Partnerships
          </button>
          <button
            type="button"
            className="bi-page__btn"
            onClick={() => navigateToPath(bamSignalInstitutePathForRoute("relationshipIndex"))}
          >
            Relationship Index
          </button>
        </div>
      </header>

      <section className="bi-page__preview institute-glass">
        <h2>Research areas</h2>
        <p>{bundle.areaCount} areas — architecture preview, alphabetical.</p>
        <ul className="bi-page__area-list">
          {RESEARCH_AREAS.map((area) => (
            <li key={area.id}>
              <strong>{area.title}</strong>
              <span>{area.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="bi-page__section">
        <header className="bi-section-head">
          <h2>Featured areas</h2>
          <p>Understanding relationships — never analytics or data mining.</p>
        </header>
        <div className="bi-page__grid">
          {bundle.areas.slice(0, 4).map((area) => (
            <ResearchCategoryCard key={area.id} area={area} />
          ))}
        </div>
      </section>

      <section className="bi-page__future institute-glass">
        <h2>Future ready</h2>
        <ul>
          {INSTITUTE_FUTURE_CAPABILITIES.map((capability) => (
            <li key={capability.id}>
              <strong>{capability.label}</strong>
              <span>{capability.description}</span>
            </li>
          ))}
        </ul>
        <p className="bi-page__reserved">{BAMSIGNAL_INSTITUTE_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
