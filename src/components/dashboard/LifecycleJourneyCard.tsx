import { Compass, Sparkles } from "lucide-react";
import { useMemo } from "react";
import type { DatingProfile, UserProfile } from "../../types";
import { navigateToPath } from "../../constants/routes";
import { LIFECYCLE_STAGES } from "../../constants/userLifecycle";
import { getLifecycle, recommendNextStep } from "../../utils/userLifecycle";

type LifecycleJourneyCardProps = {
  user: UserProfile;
  profile?: DatingProfile | null;
};

export function LifecycleJourneyCard({ user, profile }: LifecycleJourneyCardProps) {
  const snapshot = useMemo(
    () => getLifecycle({ user, profile: profile ?? null }),
    [user, profile],
  );

  const action = snapshot.nextRecommendedAction;

  return (
    <section className="card lifecycle-journey-card dash-animate">
      <header className="lifecycle-journey-card__head">
        <Sparkles size={20} aria-hidden />
        <div>
          <h2>Your journey</h2>
          <p>
            {snapshot.stageLabel} · {snapshot.progressPercent}% along the lifecycle
          </p>
        </div>
      </header>

      <div
        className="lifecycle-journey-card__bar"
        role="progressbar"
        aria-valuenow={snapshot.progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div style={{ width: `${snapshot.progressPercent}%` }} />
      </div>

      <ul className="lifecycle-journey-card__stages">
        {LIFECYCLE_STAGES.filter((s) => !["dormant", "reactivated"].includes(s.id)).map((stage) => (
          <li
            key={stage.id}
            className={
              stage.id === snapshot.stage ? "lifecycle-journey-card__stage is-active" : "lifecycle-journey-card__stage"
            }
          >
            {stage.label}
          </li>
        ))}
      </ul>

      <p className="lifecycle-journey-card__milestones">
        {snapshot.milestonesCompleted.length} milestones completed
      </p>

      <button
        type="button"
        className="btn-secondary lifecycle-journey-card__cta"
        onClick={() => {
          recommendNextStep();
          if (action.path) navigateToPath(action.path, true);
        }}
      >
        <Compass size={16} aria-hidden />
        {action.label}
      </button>
      <p className="lifecycle-journey-card__hint">{action.description}</p>
    </section>
  );
}
