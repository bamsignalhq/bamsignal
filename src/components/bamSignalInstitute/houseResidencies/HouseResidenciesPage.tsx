import { useMemo } from "react";
import {
  BAMSIGNAL_HOUSE_LABEL,
  GROWING_TOGETHER_LABEL,
  HOUSE_RESIDENCIES_LABEL,
  HOUSE_RESIDENCIES_PURPOSE_COPY,
  HOUSE_RESIDENCIES_RESERVED_COPY,
  HOUSE_RESIDENCIES_SUBCOPY,
  HOUSE_RESIDENCIES_TITLE,
  LEARNING_LABEL,
  PREPARED_HOUSE_RESIDENCIES,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/houseResidencies";
import { getHouseResidenciesBundle } from "../../../utils/HouseResidenciesEngine";
import { FamilyResidenceCard } from "./FamilyResidenceCard";
import { ResidencyCard } from "./ResidencyCard";

export function HouseResidenciesPage() {
  const bundle = useMemo(() => getHouseResidenciesBundle(), []);

  return (
    <div className="hres-page">
      <header className="hres-page__hero institute-glass">
        <p className="bi-page__eyebrow">{HOUSE_RESIDENCIES_LABEL}</p>
        <h1>{HOUSE_RESIDENCIES_TITLE}</h1>
        <p>{HOUSE_RESIDENCIES_SUBCOPY}</p>
        <p className="hres-page__labels">
          {BAMSIGNAL_HOUSE_LABEL} · {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} ·{" "}
          {RELATIONSHIP_WISDOM_LABEL} · {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="hres-page__purpose">{HOUSE_RESIDENCIES_PURPOSE_COPY}</p>
      </header>

      <section className="hres-page__prepared institute-glass">
        <h2>Programs</h2>
        <p>{bundle.programCount} residency programs — architecture preview, not applications yet.</p>
        <ul className="hres-page__prepared-list">
          {PREPARED_HOUSE_RESIDENCIES.map((program) => (
            <li key={program.id}>
              <strong>{program.title}</strong>
              <span>{program.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="hres-page__section">
        <header className="bi-section-head">
          <h2>Residencies</h2>
          <p>Visiting Scholars through Artists — prepared, not enabled yet.</p>
        </header>
        <div className="hres-page__grid">
          {bundle.residencies.map((residency) => (
            <ResidencyCard key={residency.id} residency={residency} />
          ))}
        </div>
      </section>

      <section className="hres-page__section">
        <header className="bi-section-head">
          <h2>Family residences</h2>
          <p>Relationship Fellows and Family Mentors — architecture reserved, not placements yet.</p>
        </header>
        <div className="hres-page__grid">
          {bundle.familyResidences.map((residence) => (
            <FamilyResidenceCard key={residence.id} residence={residence} />
          ))}
        </div>
      </section>

      <section className="hres-page__reserved-note institute-glass">
        <p>{HOUSE_RESIDENCIES_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
