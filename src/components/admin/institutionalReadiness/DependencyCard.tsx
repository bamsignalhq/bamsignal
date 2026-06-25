import {
  READINESS_RESULT_LABELS,
  READINESS_SUBSYSTEM_LABELS
} from "../../../constants/institutionalReadiness";
import type { ReadinessDependencyLink } from "../../../types/institutionalReadiness";

type DependencyCardProps = {
  dependencies: ReadinessDependencyLink[];
};

export function DependencyCard({ dependencies }: DependencyCardProps) {
  const surfaced = dependencies.filter((item) => item.surfaced);

  return (
    <section className="readiness-verification-card dependency-card concierge-consultant-card--glass cc-reveal">
      <header className="readiness-verification-card__head">
        <h3>Dependency graph</h3>
        <p>Every failed dependency surfaces upstream — no Ready if critical deps are failing.</p>
      </header>

      {surfaced.length ? (
        <p className="readiness-verification-card__alert">
          {surfaced.length} failed dependency link(s) propagated downstream.
        </p>
      ) : null}

      <ul className="readiness-verification-card__list">
        {dependencies.map((dep) => (
          <li key={dep.id} className={dep.surfaced ? "dependency-card__item--surfaced" : ""}>
            <div className="readiness-verification-card__row">
              <strong>
                {READINESS_SUBSYSTEM_LABELS[dep.upstreamId]} →{" "}
                {READINESS_SUBSYSTEM_LABELS[dep.downstreamId]}
              </strong>
              {dep.critical ? <span className="readiness-verification-card__tag">Critical</span> : null}
            </div>
            <div className="readiness-verification-card__meta">
              <span>{dep.dependencyRef}</span>
              <span>↑ {READINESS_RESULT_LABELS[dep.upstreamStatus]}</span>
              <span>↓ {READINESS_RESULT_LABELS[dep.downstreamStatus]}</span>
              {dep.surfaced ? <span>Surfaced</span> : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
