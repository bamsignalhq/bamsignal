import { useMemo } from "react";
import {
  AFRICAN_RELATIONSHIP_CURRICULUM_FUTURE_PARTNERS,
  AFRICAN_RELATIONSHIP_CURRICULUM_LABEL,
  AFRICAN_RELATIONSHIP_CURRICULUM_PURPOSE_COPY,
  AFRICAN_RELATIONSHIP_CURRICULUM_RESERVED_COPY,
  AFRICAN_RELATIONSHIP_CURRICULUM_SUBCOPY,
  AFRICAN_RELATIONSHIP_CURRICULUM_TITLE,
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  PRESERVED_CURRICULUM_THEMES,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/africanRelationshipCurriculum";
import { getAfricanRelationshipCurriculumBundle } from "../../../utils/AfricanRelationshipCurriculumEngine";
import { CultureModuleCard } from "./CultureModuleCard";
import { DiasporaModuleCard } from "./DiasporaModuleCard";
import { FaithModuleCard } from "./FaithModuleCard";

export function RelationshipCurriculumPage() {
  const bundle = useMemo(() => getAfricanRelationshipCurriculumBundle(), []);

  return (
    <div className="arcur-page">
      <header className="arcur-page__hero institute-glass">
        <p className="bi-page__eyebrow">{AFRICAN_RELATIONSHIP_CURRICULUM_LABEL}</p>
        <h1>{AFRICAN_RELATIONSHIP_CURRICULUM_TITLE}</h1>
        <p>{AFRICAN_RELATIONSHIP_CURRICULUM_SUBCOPY}</p>
        <p className="arcur-page__labels">
          {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} · {RELATIONSHIP_WISDOM_LABEL} ·{" "}
          {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="arcur-page__purpose">{AFRICAN_RELATIONSHIP_CURRICULUM_PURPOSE_COPY}</p>
      </header>

      <section className="arcur-page__prepared institute-glass">
        <h2>Preserved themes</h2>
        <p>{bundle.themeCount} themes — architecture preview, not delivered yet.</p>
        <ul className="arcur-page__prepared-list">
          {PRESERVED_CURRICULUM_THEMES.map((theme) => (
            <li key={theme.id}>
              <strong>{theme.title}</strong>
              <span>{theme.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="arcur-page__section">
        <header className="bi-section-head">
          <h2>Culture modules</h2>
          <p>African values and traditions — prepared, not enabled yet.</p>
        </header>
        <div className="arcur-page__grid">
          {bundle.cultureModules.map((module) => (
            <CultureModuleCard key={module.id} module={module} />
          ))}
        </div>
      </section>

      <section className="arcur-page__section">
        <header className="bi-section-head">
          <h2>Faith modules</h2>
          <p>Faith influences — respectful framing prepared.</p>
        </header>
        <div className="arcur-page__grid">
          {bundle.faithModules.map((module) => (
            <FaithModuleCard key={module.id} module={module} />
          ))}
        </div>
      </section>

      <section className="arcur-page__section">
        <header className="bi-section-head">
          <h2>Diaspora modules</h2>
          <p>Diaspora experiences — Journey Across Borders preserved.</p>
        </header>
        <div className="arcur-page__grid">
          {bundle.diasporaModules.map((module) => (
            <DiasporaModuleCard key={module.id} module={module} />
          ))}
        </div>
      </section>

      <section className="arcur-page__future institute-glass">
        <h2>Future ready</h2>
        <ul>
          {AFRICAN_RELATIONSHIP_CURRICULUM_FUTURE_PARTNERS.map((partner) => (
            <li key={partner.id}>
              <strong>{partner.label}</strong>
              <span>{partner.description}</span>
            </li>
          ))}
        </ul>
        <p className="arcur-page__reserved">{AFRICAN_RELATIONSHIP_CURRICULUM_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
