import { useMemo } from "react";
import {
  BAMSIGNAL_INSTITUTE_RESERVED_COPY,
  INSIGHTS_LABEL,
  RESEARCH_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../constants/bamSignalInstitute";
import { getBamSignalInstituteBundle } from "../../utils/BamSignalInstituteEngine";
import { ResearchCategoryCard } from "./ResearchCategoryCard";

export function ResearchProgramsPage() {
  const bundle = useMemo(() => getBamSignalInstituteBundle(), []);

  return (
    <div className="bi-page">
      <header className="bi-page__hero institute-glass">
        <p className="bi-page__eyebrow">{RESEARCH_LABEL}</p>
        <h1>Research Programs</h1>
        <p>{UNDERSTANDING_RELATIONSHIPS_LABEL} — prepared with dignity.</p>
        <p className="bi-page__labels">{INSIGHTS_LABEL} · {RESEARCH_LABEL}</p>
      </header>

      <section className="bi-page__section">
        <header className="bi-section-head">
          <h2>All research areas</h2>
          <p>Alphabetical — never a statistics dashboard.</p>
        </header>
        <div className="bi-page__grid">
          {bundle.areas.map((area) => (
            <ResearchCategoryCard key={area.id} area={area} />
          ))}
        </div>
      </section>

      <p className="bi-page__reserved institute-glass">{BAMSIGNAL_INSTITUTE_RESERVED_COPY}</p>
    </div>
  );
}
