import { useMemo } from "react";
import {
  BAMSIGNAL_ACADEMY_FUTURE_CAPABILITIES,
  BAMSIGNAL_ACADEMY_PURPOSE_COPY,
  BAMSIGNAL_ACADEMY_RESERVED_COPY,
  BAMSIGNAL_ACADEMY_SUBCOPY,
  BAMSIGNAL_ACADEMY_TITLE,
  BUILDING_STRONG_FAMILIES_LABEL,
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  PREPARED_ACADEMY_PROGRAMS,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/bamSignalAcademy";
import { bamSignalInstitutePathForRoute } from "../../../constants/bamSignalInstituteRoutes";
import { navigateToPath } from "../../../constants/routes";
import { getBamSignalAcademyBundle } from "../../../utils/BamSignalAcademyEngine";
import { AcademyTimeline } from "./AcademyTimeline";
import { LearningPathCard } from "./LearningPathCard";

export function BamSignalAcademyPage() {
  const bundle = useMemo(() => getBamSignalAcademyBundle(), []);

  return (
    <div className="bsa-page">
      <header className="bsa-page__hero institute-glass">
        <p className="bi-page__eyebrow">{LEARNING_LABEL}</p>
        <h1>{BAMSIGNAL_ACADEMY_TITLE}</h1>
        <p>{BAMSIGNAL_ACADEMY_SUBCOPY}</p>
        <p className="bsa-page__labels">
          {GROWING_TOGETHER_LABEL} · {RELATIONSHIP_WISDOM_LABEL} · {BUILDING_STRONG_FAMILIES_LABEL} ·{" "}
          {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="bsa-page__purpose">{BAMSIGNAL_ACADEMY_PURPOSE_COPY}</p>
        <div className="bi-page__actions">
          <button
            type="button"
            className="bi-page__btn bi-page__btn--primary"
            onClick={() => navigateToPath(bamSignalInstitutePathForRoute("academyPrograms"))}
          >
            Academy programs
          </button>
        </div>
      </header>

      <section className="bsa-page__prepared institute-glass">
        <h2>Prepared programs</h2>
        <p>{bundle.programCount} programs — architecture preview, never training or lessons.</p>
        <ul className="bsa-page__prepared-list">
          {PREPARED_ACADEMY_PROGRAMS.map((program) => (
            <li key={program.id}>
              <strong>{program.title}</strong>
              <span>{program.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="bsa-page__section">
        <header className="bi-section-head">
          <h2>Learning paths</h2>
          <p>{GROWING_TOGETHER_LABEL} — prepared, not enabled.</p>
        </header>
        <div className="bsa-page__grid">
          {bundle.learningPaths.map((path) => (
            <LearningPathCard key={path.id} path={path} />
          ))}
        </div>
      </section>

      <AcademyTimeline entries={bundle.timeline} />

      <section className="bsa-page__future institute-glass">
        <h2>Future ready</h2>
        <ul>
          {BAMSIGNAL_ACADEMY_FUTURE_CAPABILITIES.map((capability) => (
            <li key={capability.id}>
              <strong>{capability.label}</strong>
              <span>{capability.description}</span>
            </li>
          ))}
        </ul>
        <p className="bsa-page__reserved">{BAMSIGNAL_ACADEMY_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
