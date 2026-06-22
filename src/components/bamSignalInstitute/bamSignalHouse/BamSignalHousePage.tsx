import { useMemo } from "react";
import {
  BAMSIGNAL_HOUSE_FORBIDDEN_COPY,
  BAMSIGNAL_HOUSE_LABEL,
  BAMSIGNAL_HOUSE_PURPOSE_COPY,
  BAMSIGNAL_HOUSE_RESERVED_COPY,
  BAMSIGNAL_HOUSE_SUBCOPY,
  BAMSIGNAL_HOUSE_TITLE,
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  PREPARED_FOUNDING_HOUSES,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/bamSignalHouse";
import { getBamSignalHouseBundle } from "../../../utils/BamSignalHouseEngine";
import { HouseExperienceCard } from "./HouseExperienceCard";
import { HouseLocationCard } from "./HouseLocationCard";
import { HousePrinciplesPage } from "./HousePrinciplesPage";
import { HouseTimelinePage } from "./HouseTimelinePage";

export function BamSignalHousePage() {
  const bundle = useMemo(() => getBamSignalHouseBundle(), []);

  return (
    <div className="bsho-page">
      <header className="bsho-page__hero institute-glass">
        <p className="bi-page__eyebrow">{BAMSIGNAL_HOUSE_LABEL}</p>
        <h1>{BAMSIGNAL_HOUSE_TITLE}</h1>
        <p>{BAMSIGNAL_HOUSE_SUBCOPY}</p>
        <p className="bsho-page__labels">
          {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} · {RELATIONSHIP_WISDOM_LABEL} ·{" "}
          {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="bsho-page__purpose">{BAMSIGNAL_HOUSE_PURPOSE_COPY}</p>
      </header>

      <section className="bsho-page__prepared institute-glass">
        <h2>Founding Houses</h2>
        <p>
          {bundle.foundingHouseCount} locations — physical Home to Gather, not{" "}
          {BAMSIGNAL_HOUSE_FORBIDDEN_COPY[0].toLowerCase()}.
        </p>
        <ul className="bsho-page__prepared-list">
          {PREPARED_FOUNDING_HOUSES.map((house) => (
            <li key={house.id}>
              <strong>{house.title}</strong>
              <span>{house.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="bsho-page__section">
        <header className="bi-section-head">
          <h2>House locations</h2>
          <p>Founding Houses around the world — prepared, not opened yet.</p>
        </header>
        <div className="bsho-page__grid">
          {bundle.locations.map((location) => (
            <HouseLocationCard key={location.id} location={location} />
          ))}
        </div>
      </section>

      <section className="bsho-page__section">
        <header className="bi-section-head">
          <h2>House experiences</h2>
          <p>Home, Gather, Celebrate — reserved, not a campus or office.</p>
        </header>
        <div className="bsho-page__grid">
          {bundle.experiences.map((experience) => (
            <HouseExperienceCard key={experience.id} experience={experience} />
          ))}
        </div>
      </section>

      <HouseTimelinePage timelines={bundle.timelines} />
      <HousePrinciplesPage principles={bundle.principles} />

      <section className="bsho-page__reserved-note institute-glass">
        <p>{BAMSIGNAL_HOUSE_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
