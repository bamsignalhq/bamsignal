import { useMemo } from "react";
import {
  BAMSIGNAL_SUMMIT_FORBIDDEN_COPY,
  BAMSIGNAL_SUMMIT_FUTURE_READY_COPY,
  BAMSIGNAL_SUMMIT_GOOD_COPY,
  BAMSIGNAL_SUMMIT_LABEL,
  BAMSIGNAL_SUMMIT_PURPOSE_COPY,
  BAMSIGNAL_SUMMIT_RESERVED_COPY,
  BAMSIGNAL_SUMMIT_SUBCOPY,
  BAMSIGNAL_SUMMIT_TITLE,
  FUTURE_READY_SUMMIT_CAPABILITIES,
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  PREPARED_SUMMIT_EXPERIENCES,
  PREPARED_SUMMIT_SPEAKERS,
  PREPARED_SUMMIT_THEMES,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/bamSignalSummit";
import { getBamSignalSummitBundle } from "../../../utils/BamSignalSummitEngine";
import { SummitAgendaCard } from "./SummitAgendaCard";
import { SummitExperienceCard } from "./SummitExperienceCard";
import { SummitSpeakerCard } from "./SummitSpeakerCard";
import { SummitThemeCard } from "./SummitThemeCard";

export function BamSignalSummitPage() {
  const bundle = useMemo(() => getBamSignalSummitBundle(), []);

  return (
    <div className="bsmt-page">
      <header className="bsmt-page__hero institute-glass">
        <p className="bi-page__eyebrow">{BAMSIGNAL_SUMMIT_LABEL}</p>
        <h1>{BAMSIGNAL_SUMMIT_TITLE}</h1>
        <p>{BAMSIGNAL_SUMMIT_SUBCOPY}</p>
        <p className="bsmt-page__labels">
          {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} · {RELATIONSHIP_WISDOM_LABEL} ·{" "}
          {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="bsmt-page__purpose">{BAMSIGNAL_SUMMIT_PURPOSE_COPY}</p>
      </header>

      <section className="bsmt-page__copy-rules institute-glass">
        <h2>Copy guidance</h2>
        <p>
          Use: {BAMSIGNAL_SUMMIT_GOOD_COPY.join(", ")}. Avoid:{" "}
          {BAMSIGNAL_SUMMIT_FORBIDDEN_COPY.join(", ")}.
        </p>
      </section>

      <section className="bsmt-page__prepared institute-glass">
        <h2>Annual themes</h2>
        <p>{bundle.themeCount} themes — summit gathering, not {BAMSIGNAL_SUMMIT_FORBIDDEN_COPY[0].toLowerCase()}.</p>
        <ul className="bsmt-page__prepared-list">
          {PREPARED_SUMMIT_THEMES.map((theme) => (
            <li key={theme.id}>
              <strong>{theme.title}</strong>
              <span>{theme.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="bsmt-page__section">
        <header className="bi-section-head">
          <h2>Summit themes</h2>
          <p>Annual relationship and family themes — prepared, not scheduled yet.</p>
        </header>
        <div className="bsmt-page__grid">
          {bundle.themes.map((theme) => (
            <SummitThemeCard key={theme.id} theme={theme} />
          ))}
        </div>
      </section>

      <section className="bsmt-page__section">
        <header className="bi-section-head">
          <h2>Event experiences</h2>
          <p>{bundle.experienceCount} experiences — gathering wisdom, not a trade show.</p>
        </header>
        <div className="bsmt-page__grid">
          {bundle.experiences.map((experience) => (
            <SummitExperienceCard key={experience.id} experience={experience} />
          ))}
        </div>
      </section>

      <section className="bsmt-page__section">
        <header className="bi-section-head">
          <h2>Summit agenda</h2>
          <p>Theme and experience pairings — architecture preview, not live scheduling.</p>
        </header>
        <div className="bsmt-page__grid">
          {bundle.agenda.map((item) => (
            <SummitAgendaCard key={item.id} agenda={item} />
          ))}
        </div>
      </section>

      <section className="bsmt-page__section">
        <header className="bi-section-head">
          <h2>Speakers</h2>
          <p>{bundle.speakerCount} speaker types — experts reserved, not expo booths.</p>
        </header>
        <div className="bsmt-page__grid">
          {bundle.speakers.map((speaker) => (
            <SummitSpeakerCard key={speaker.id} speaker={speaker} />
          ))}
        </div>
      </section>

      <section className="bsmt-page__prepared institute-glass">
        <h2>Prepared experiences</h2>
        <ul className="bsmt-page__prepared-list">
          {PREPARED_SUMMIT_EXPERIENCES.map((experience) => (
            <li key={experience.id}>
              <strong>{experience.title}</strong>
              <span>{experience.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="bsmt-page__prepared institute-glass">
        <h2>Prepared speakers</h2>
        <ul className="bsmt-page__prepared-list">
          {PREPARED_SUMMIT_SPEAKERS.map((speaker) => (
            <li key={speaker.id}>
              <strong>{speaker.title}</strong>
              <span>{speaker.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="bsmt-page__future-ready institute-glass">
        <h2>Future-ready capabilities</h2>
        <p>{BAMSIGNAL_SUMMIT_FUTURE_READY_COPY}</p>
        <ul className="bsmt-page__prepared-list">
          {FUTURE_READY_SUMMIT_CAPABILITIES.map((capability) => (
            <li key={capability.id}>
              <strong>{capability.title}</strong>
              <span>{capability.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="bsmt-page__reserved-note institute-glass">
        <p>{BAMSIGNAL_SUMMIT_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
