import { useMemo } from "react";
import {
  BAMSIGNAL_ACADEMY_LABEL,
  BUILDING_STRONG_FAMILIES_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "../../../constants/bamSignalAcademy";
import { getBamSignalAcademyBundle } from "../../../utils/BamSignalAcademyEngine";
import { CourseCard } from "./CourseCard";
import { LearningPathCard } from "./LearningPathCard";

export function AcademyProgramsPage() {
  const bundle = useMemo(() => getBamSignalAcademyBundle(), []);

  return (
    <div className="bsa-page">
      <header className="bsa-page__hero institute-glass">
        <p className="bi-page__eyebrow">{BAMSIGNAL_ACADEMY_LABEL}</p>
        <h1>Academy programs</h1>
        <p>{LEARNING_LABEL} — relationship wisdom for building strong families.</p>
        <p className="bsa-page__labels">
          {RELATIONSHIP_WISDOM_LABEL} · {BUILDING_STRONG_FAMILIES_LABEL}
        </p>
      </header>

      <section className="bsa-page__section">
        <header className="bi-section-head">
          <h2>Programs</h2>
          <p>{bundle.programCount} programs prepared — not a course catalog.</p>
        </header>
        <div className="bsa-page__grid">
          {bundle.programs.map((program) => (
            <CourseCard key={program.id} program={program} />
          ))}
        </div>
      </section>

      <section className="bsa-page__section">
        <header className="bi-section-head">
          <h2>Learning paths</h2>
          <p>Grouped pathways — growing together with dignity.</p>
        </header>
        <div className="bsa-page__grid">
          {bundle.learningPaths.map((path) => (
            <LearningPathCard key={path.id} path={path} />
          ))}
        </div>
      </section>
    </div>
  );
}
