import { useMemo } from "react";
import {
  BAMSIGNAL_HOUSE_LABEL,
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  LEGACY_GARDEN_LABEL,
  LEGACY_GARDEN_PURPOSE_COPY,
  LEGACY_GARDEN_RESERVED_COPY,
  LEGACY_GARDEN_SUBCOPY,
  LEGACY_GARDEN_TITLE,
  PREPARED_LEGACY_GARDEN_PURPOSES,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/legacyGarden";
import { getLegacyGardenBundle } from "../../../utils/LegacyGardenEngine";
import { GardenExperienceCard } from "./GardenExperienceCard";
import { MemoryTreeCard } from "./MemoryTreeCard";

export function LegacyGardenPage() {
  const bundle = useMemo(() => getLegacyGardenBundle(), []);

  return (
    <div className="lgdn-page">
      <header className="lgdn-page__hero institute-glass">
        <p className="bi-page__eyebrow">{LEGACY_GARDEN_LABEL}</p>
        <h1>{LEGACY_GARDEN_TITLE}</h1>
        <p>{LEGACY_GARDEN_SUBCOPY}</p>
        <p className="lgdn-page__labels">
          {BAMSIGNAL_HOUSE_LABEL} · {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} ·{" "}
          {RELATIONSHIP_WISDOM_LABEL} · {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="lgdn-page__purpose">{LEGACY_GARDEN_PURPOSE_COPY}</p>
      </header>

      <section className="lgdn-page__prepared institute-glass">
        <h2>Purpose</h2>
        <p>{bundle.purposeCount} pillars — outdoor Legacy architecture at the House.</p>
        <ul className="lgdn-page__prepared-list">
          {PREPARED_LEGACY_GARDEN_PURPOSES.map((purpose) => (
            <li key={purpose.id}>
              <strong>{purpose.title}</strong>
              <span>{purpose.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="lgdn-page__section">
        <header className="bi-section-head">
          <h2>Garden experiences</h2>
          <p>Reflection, celebration, and photography — prepared, not open yet.</p>
        </header>
        <div className="lgdn-page__grid">
          {bundle.gardenExperiences.map((experience) => (
            <GardenExperienceCard key={experience.id} experience={experience} />
          ))}
        </div>
      </section>

      <section className="lgdn-page__section">
        <header className="bi-section-head">
          <h2>Memory trees</h2>
          <p>Quiet conversations — architecture preview only.</p>
        </header>
        <div className="lgdn-page__grid">
          {bundle.memoryTrees.map((memory) => (
            <MemoryTreeCard key={memory.id} memory={memory} />
          ))}
        </div>
      </section>

      <section className="lgdn-page__reserved-note institute-glass">
        <p>{LEGACY_GARDEN_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
