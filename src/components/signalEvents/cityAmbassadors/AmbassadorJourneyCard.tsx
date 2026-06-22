import { COMMUNITY_AMBASSADOR_LABEL } from "../../../constants/cityAmbassadors";
import type { AmbassadorJourneyStep } from "../../../constants/cityAmbassadors";

type AmbassadorJourneyCardProps = {
  title: string;
  steps: AmbassadorJourneyStep[];
};

export function AmbassadorJourneyCard({ title, steps }: AmbassadorJourneyCardProps) {
  const sorted = [...steps].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );

  return (
    <section className="ca-journey-card signal-events-glass">
      <header className="ca-journey-card__head">
        <h3>{COMMUNITY_AMBASSADOR_LABEL}</h3>
        <p>{title} — stewardship journey prepared.</p>
      </header>

      {sorted.length ? (
        <ol className="ca-journey-card__list">
          {sorted.map((step) => (
            <li key={step.id} className="ca-journey-card__item">
              <span className="ca-journey-card__dot" aria-hidden />
              <div>
                <strong>{step.label}</strong>
                {step.note ? <p className="ca-journey-card__note">{step.note}</p> : null}
                <time dateTime={step.recordedAt}>
                  {new Date(step.recordedAt).toLocaleDateString()}
                </time>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="ca-journey-card__empty">
          Stewardship milestones will appear as ambassador pathways mature.
        </p>
      )}
    </section>
  );
}
