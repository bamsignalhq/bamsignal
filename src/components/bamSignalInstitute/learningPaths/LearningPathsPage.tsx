import { useMemo } from "react";
import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  LEARNING_PATHS_FUTURE_CAPABILITIES,
  LEARNING_PATHS_LABEL,
  LEARNING_PATHS_PURPOSE_COPY,
  LEARNING_PATHS_RESERVED_COPY,
  LEARNING_PATHS_SUBCOPY,
  LEARNING_PATHS_TITLE,
  PREPARED_LEARNING_PATHS,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/learningPaths";
import { getLearningPathsBundle } from "../../../utils/LearningPathsEngine";
import { LearningPathCard } from "./LearningPathCard";
import { PathMilestoneCard } from "./PathMilestoneCard";

export function LearningPathsPage() {
  const bundle = useMemo(() => getLearningPathsBundle(), []);

  return (
    <div className="lp-page">
      <header className="lp-page__hero institute-glass">
        <p className="bi-page__eyebrow">{LEARNING_PATHS_LABEL}</p>
        <h1>{LEARNING_PATHS_TITLE}</h1>
        <p>{LEARNING_PATHS_SUBCOPY}</p>
        <p className="lp-page__labels">
          {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} · {RELATIONSHIP_WISDOM_LABEL} ·{" "}
          {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="lp-page__purpose">{LEARNING_PATHS_PURPOSE_COPY}</p>
      </header>

      <section className="lp-page__prepared institute-glass">
        <h2>Prepared paths</h2>
        <p>{bundle.pathCount} paths — architecture preview, no progress tracking yet.</p>
        <ul className="lp-page__prepared-list">
          {PREPARED_LEARNING_PATHS.map((path) => (
            <li key={path.id}>
              <strong>{path.title}</strong>
              <span>{path.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="lp-page__section">
        <header className="bi-section-head">
          <h2>Learning paths</h2>
          <p>Guided journeys prepared — not enabled yet.</p>
        </header>
        <div className="lp-page__grid">
          {bundle.paths.map((path) => (
            <LearningPathCard key={path.id} path={path} />
          ))}
        </div>
      </section>

      {bundle.paths.map((path) => (
        <PathMilestoneCard key={`${path.id}-milestones`} title={path.title} milestones={path.milestones} />
      ))}

      <section className="lp-page__future institute-glass">
        <h2>Future ready</h2>
        <ul>
          {LEARNING_PATHS_FUTURE_CAPABILITIES.map((capability) => (
            <li key={capability.id}>
              <strong>{capability.label}</strong>
              <span>{capability.description}</span>
            </li>
          ))}
        </ul>
        <p className="lp-page__reserved">{LEARNING_PATHS_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
