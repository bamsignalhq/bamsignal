import { useMemo } from "react";
import {
  BAMSIGNAL_HOUSE_LABEL,
  GROWING_TOGETHER_LABEL,
  HOUSE_INSTITUTE_LABEL,
  HOUSE_INSTITUTE_PURPOSE_COPY,
  HOUSE_INSTITUTE_RESERVED_COPY,
  HOUSE_INSTITUTE_SUBCOPY,
  HOUSE_INSTITUTE_TITLE,
  LEARNING_LABEL,
  PREPARED_HOUSE_INSTITUTE_PROGRAMS,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/houseInstitute";
import { getHouseInstituteBundle } from "../../../utils/HouseInstituteEngine";
import { PublicationCard } from "./PublicationCard";
import { ResearchCard } from "./ResearchCard";

export function HouseInstitutePage() {
  const bundle = useMemo(() => getHouseInstituteBundle(), []);

  return (
    <div className="hins-page">
      <header className="hins-page__hero institute-glass">
        <p className="bi-page__eyebrow">{HOUSE_INSTITUTE_LABEL}</p>
        <h1>{HOUSE_INSTITUTE_TITLE}</h1>
        <p>{HOUSE_INSTITUTE_SUBCOPY}</p>
        <p className="hins-page__labels">
          {BAMSIGNAL_HOUSE_LABEL} · {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} ·{" "}
          {RELATIONSHIP_WISDOM_LABEL} · {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="hins-page__purpose">{HOUSE_INSTITUTE_PURPOSE_COPY}</p>
      </header>

      <section className="hins-page__prepared institute-glass">
        <h2>Programs</h2>
        <p>{bundle.programCount} institute programs — architecture preview, not live research yet.</p>
        <ul className="hins-page__prepared-list">
          {PREPARED_HOUSE_INSTITUTE_PROGRAMS.map((program) => (
            <li key={program.id}>
              <strong>{program.title}</strong>
              <span>{program.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="hins-page__section">
        <header className="bi-section-head">
          <h2>Research</h2>
          <p>Research through Relationship Index — prepared, not enabled yet.</p>
        </header>
        <div className="hins-page__grid">
          {bundle.researchPrograms.map((research) => (
            <ResearchCard key={research.id} research={research} />
          ))}
        </div>
      </section>

      <section className="hins-page__section">
        <header className="bi-section-head">
          <h2>Publications</h2>
          <p>Reports — architecture reserved, not published yet.</p>
        </header>
        <div className="hins-page__grid">
          {bundle.publications.map((publication) => (
            <PublicationCard key={publication.id} publication={publication} />
          ))}
        </div>
      </section>

      <section className="hins-page__reserved-note institute-glass">
        <p>{HOUSE_INSTITUTE_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
