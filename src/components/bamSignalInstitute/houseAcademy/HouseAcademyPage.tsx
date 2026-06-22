import { useMemo } from "react";
import {
  BAMSIGNAL_HOUSE_LABEL,
  GROWING_TOGETHER_LABEL,
  HOUSE_ACADEMY_LABEL,
  HOUSE_ACADEMY_PURPOSE_COPY,
  HOUSE_ACADEMY_RESERVED_COPY,
  HOUSE_ACADEMY_SUBCOPY,
  HOUSE_ACADEMY_TITLE,
  LEARNING_LABEL,
  PREPARED_HOUSE_ACADEMY_PROGRAMS,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/houseAcademy";
import { getHouseAcademyBundle } from "../../../utils/HouseAcademyEngine";
import { MasterclassCard } from "./MasterclassCard";
import { WorkshopCard } from "./WorkshopCard";

export function HouseAcademyPage() {
  const bundle = useMemo(() => getHouseAcademyBundle(), []);

  return (
    <div className="hacd-page">
      <header className="hacd-page__hero institute-glass">
        <p className="bi-page__eyebrow">{HOUSE_ACADEMY_LABEL}</p>
        <h1>{HOUSE_ACADEMY_TITLE}</h1>
        <p>{HOUSE_ACADEMY_SUBCOPY}</p>
        <p className="hacd-page__labels">
          {BAMSIGNAL_HOUSE_LABEL} · {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} ·{" "}
          {RELATIONSHIP_WISDOM_LABEL} · {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="hacd-page__purpose">{HOUSE_ACADEMY_PURPOSE_COPY}</p>
      </header>

      <section className="hacd-page__prepared institute-glass">
        <h2>Programs</h2>
        <p>{bundle.programCount} academy programs — architecture preview, not enrollment yet.</p>
        <ul className="hacd-page__prepared-list">
          {PREPARED_HOUSE_ACADEMY_PROGRAMS.map((program) => (
            <li key={program.id}>
              <strong>{program.title}</strong>
              <span>{program.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="hacd-page__section">
        <header className="bi-section-head">
          <h2>Masterclasses</h2>
          <p>Relationship Courses — prepared, not enabled yet.</p>
        </header>
        <div className="hacd-page__grid">
          {bundle.masterclasses.map((masterclass) => (
            <MasterclassCard key={masterclass.id} masterclass={masterclass} />
          ))}
        </div>
      </section>

      <section className="hacd-page__section">
        <header className="bi-section-head">
          <h2>Workshops</h2>
          <p>Marriage Workshops through Diaspora Programs — architecture reserved, not live yet.</p>
        </header>
        <div className="hacd-page__grid">
          {bundle.workshops.map((workshop) => (
            <WorkshopCard key={workshop.id} workshop={workshop} />
          ))}
        </div>
      </section>

      <section className="hacd-page__reserved-note institute-glass">
        <p>{HOUSE_ACADEMY_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
