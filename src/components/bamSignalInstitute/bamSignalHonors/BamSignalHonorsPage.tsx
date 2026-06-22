import { useMemo } from "react";
import {
  BAMSIGNAL_HONORS_FORBIDDEN_COPY,
  BAMSIGNAL_HONORS_FUTURE_READY_COPY,
  BAMSIGNAL_HONORS_GOOD_COPY,
  BAMSIGNAL_HONORS_LABEL,
  BAMSIGNAL_HONORS_PURPOSE_COPY,
  BAMSIGNAL_HONORS_RESERVED_COPY,
  BAMSIGNAL_HONORS_SUBCOPY,
  BAMSIGNAL_HONORS_TITLE,
  FUTURE_READY_HONORS_CAPABILITIES,
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  PREPARED_HONOR_CATEGORIES,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/bamSignalHonors";
import { getBamSignalHonorsBundle } from "../../../utils/BamSignalHonorsEngine";
import { HonorCategoryCard } from "./HonorCategoryCard";
import { LegacyAwardCard } from "./LegacyAwardCard";
import { RecognitionTimelineCard } from "./RecognitionTimelineCard";

export function BamSignalHonorsPage() {
  const bundle = useMemo(() => getBamSignalHonorsBundle(), []);

  return (
    <div className="bshn-page">
      <header className="bshn-page__hero institute-glass">
        <p className="bi-page__eyebrow">{BAMSIGNAL_HONORS_LABEL}</p>
        <h1>{BAMSIGNAL_HONORS_TITLE}</h1>
        <p>{BAMSIGNAL_HONORS_SUBCOPY}</p>
        <p className="bshn-page__labels">
          {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} · {RELATIONSHIP_WISDOM_LABEL} ·{" "}
          {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="bshn-page__purpose">{BAMSIGNAL_HONORS_PURPOSE_COPY}</p>
      </header>

      <section className="bshn-page__copy-rules institute-glass">
        <h2>Copy guidance</h2>
        <p>
          Use: {BAMSIGNAL_HONORS_GOOD_COPY.join(", ")}. Avoid:{" "}
          {BAMSIGNAL_HONORS_FORBIDDEN_COPY.join(", ")}.
        </p>
      </section>

      <section className="bshn-page__prepared institute-glass">
        <h2>Honor categories</h2>
        <p>
          {bundle.categoryCount} categories — celebrating legacy, not{" "}
          {BAMSIGNAL_HONORS_FORBIDDEN_COPY[0].toLowerCase()}.
        </p>
        <ul className="bshn-page__prepared-list">
          {PREPARED_HONOR_CATEGORIES.map((category) => (
            <li key={category.id}>
              <strong>{category.title}</strong>
              <span>{category.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="bshn-page__section">
        <header className="bi-section-head">
          <h2>Honor categories</h2>
          <p>People building families and communities — prepared, not enabled yet.</p>
        </header>
        <div className="bshn-page__grid">
          {bundle.categories.map((category) => (
            <HonorCategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      <section className="bshn-page__section">
        <header className="bi-section-head">
          <h2>Legacy awards</h2>
          <p>Recognition honours reserved — not celebrity awards or competitions.</p>
        </header>
        <div className="bshn-page__grid">
          {bundle.awards.map((award) => (
            <LegacyAwardCard key={award.id} award={award} />
          ))}
        </div>
      </section>

      <section className="bshn-page__section">
        <header className="bi-section-head">
          <h2>Recognition timelines</h2>
          <p>Celebrating Legacy milestones — architecture preview, not ceremonies yet.</p>
        </header>
        <div className="bshn-page__grid">
          {bundle.timelines.map((timeline) => (
            <RecognitionTimelineCard key={timeline.id} timeline={timeline} />
          ))}
        </div>
      </section>

      <section className="bshn-page__future-ready institute-glass">
        <h2>Future-ready capabilities</h2>
        <p>{BAMSIGNAL_HONORS_FUTURE_READY_COPY}</p>
        <ul className="bshn-page__prepared-list">
          {FUTURE_READY_HONORS_CAPABILITIES.map((capability) => (
            <li key={capability.id}>
              <strong>{capability.title}</strong>
              <span>{capability.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="bshn-page__reserved-note institute-glass">
        <p>{BAMSIGNAL_HONORS_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
