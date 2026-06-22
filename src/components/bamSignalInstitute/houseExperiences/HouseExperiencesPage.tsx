import { useMemo } from "react";
import {
  BAMSIGNAL_HOUSE_LABEL,
  FUTURE_READY_HOUSE_EXPERIENCE_CAPABILITIES,
  GROWING_TOGETHER_LABEL,
  HOUSE_EXPERIENCES_FUTURE_READY_COPY,
  HOUSE_EXPERIENCES_LABEL,
  HOUSE_EXPERIENCES_PURPOSE_COPY,
  HOUSE_EXPERIENCES_RESERVED_COPY,
  HOUSE_EXPERIENCES_SUBCOPY,
  HOUSE_EXPERIENCES_TITLE,
  LEARNING_LABEL,
  PREPARED_HOUSE_EXPERIENCE_ITEMS,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/houseExperiences";
import { getHouseExperiencesBundle } from "../../../utils/HouseExperiencesEngine";
import { CelebrationCard } from "./CelebrationCard";
import { ExperienceCard } from "./ExperienceCard";
import { PrivateDiningCard } from "./PrivateDiningCard";

export function HouseExperiencesPage() {
  const bundle = useMemo(() => getHouseExperiencesBundle(), []);

  return (
    <div className="hexp-page">
      <header className="hexp-page__hero institute-glass">
        <p className="bi-page__eyebrow">{HOUSE_EXPERIENCES_LABEL}</p>
        <h1>{HOUSE_EXPERIENCES_TITLE}</h1>
        <p>{HOUSE_EXPERIENCES_SUBCOPY}</p>
        <p className="hexp-page__labels">
          {BAMSIGNAL_HOUSE_LABEL} · {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} ·{" "}
          {RELATIONSHIP_WISDOM_LABEL} · {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="hexp-page__purpose">{HOUSE_EXPERIENCES_PURPOSE_COPY}</p>
      </header>

      <section className="hexp-page__prepared institute-glass">
        <h2>Prepared experiences</h2>
        <p>{bundle.experienceCount} experiences — curated at the House, not bookings yet.</p>
        <ul className="hexp-page__prepared-list">
          {PREPARED_HOUSE_EXPERIENCE_ITEMS.map((item) => (
            <li key={item.id}>
              <strong>{item.title}</strong>
              <span>{item.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="hexp-page__section">
        <header className="bi-section-head">
          <h2>Experiences</h2>
          <p>Gatherings and workshops — prepared, not enabled yet.</p>
        </header>
        <div className="hexp-page__grid">
          {bundle.experiences.map((experience) => (
            <ExperienceCard key={experience.id} experience={experience} />
          ))}
        </div>
      </section>

      <section className="hexp-page__section">
        <header className="bi-section-head">
          <h2>Private dining</h2>
          <p>{bundle.privateDining.length} dining experiences — reserved, not reservations yet.</p>
        </header>
        <div className="hexp-page__grid">
          {bundle.privateDining.map((dining) => (
            <PrivateDiningCard key={dining.id} dining={dining} />
          ))}
        </div>
      </section>

      <section className="hexp-page__section">
        <header className="bi-section-head">
          <h2>Celebrations</h2>
          <p>Legacy and anniversary — architecture preview only.</p>
        </header>
        <div className="hexp-page__grid">
          {bundle.celebrations.map((celebration) => (
            <CelebrationCard key={celebration.id} celebration={celebration} />
          ))}
        </div>
      </section>

      <section className="hexp-page__section">
        <header className="bi-section-head">
          <h2>All House experiences</h2>
          <p>Complete prepared catalogue — alphabetical preview.</p>
        </header>
        <div className="hexp-page__grid">
          {bundle.allExperiences.map((experience) => (
            <ExperienceCard key={`all_${experience.id}`} experience={experience} />
          ))}
        </div>
      </section>

      <section className="hexp-page__future-ready institute-glass">
        <h2>Future-ready capabilities</h2>
        <p>{HOUSE_EXPERIENCES_FUTURE_READY_COPY}</p>
        <ul className="hexp-page__prepared-list">
          {FUTURE_READY_HOUSE_EXPERIENCE_CAPABILITIES.map((capability) => (
            <li key={capability.id}>
              <strong>{capability.title}</strong>
              <span>{capability.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="hexp-page__reserved-note institute-glass">
        <p>{HOUSE_EXPERIENCES_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
