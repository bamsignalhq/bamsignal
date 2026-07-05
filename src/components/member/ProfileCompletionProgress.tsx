import { formatUnlockLabels, resolveProfileMilestones } from "../../utils/profileCompletionMilestones";

type ProfileCompletionProgressProps = {
  score: number;
  compact?: boolean;
};

export function ProfileCompletionProgress({ score, compact = false }: ProfileCompletionProgressProps) {
  const milestones = resolveProfileMilestones(score);
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const next = milestones.find((m) => !m.reached);

  return (
    <div className={`profile-completion-progress${compact ? " profile-completion-progress--compact" : ""}`}>
      <div className="profile-completion-progress__head">
        <p className="profile-completion-progress__label">Profile completion</p>
        <p className="profile-completion-progress__score">{clamped}%</p>
      </div>
      <div
        className="profile-completion-progress__track"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Profile completion"
      >
        <span className="profile-completion-progress__fill" style={{ width: `${clamped}%` }} />
        {milestones.map((m) => (
          <span
            key={m.percent}
            className={`profile-completion-progress__tick${m.reached ? " is-reached" : ""}`}
            style={{ left: `${m.percent}%` }}
            title={`${m.percent}% — ${m.label}`}
          />
        ))}
      </div>
      {!compact && next ? (
        <p className="profile-completion-progress__next">
          Next at {next.percent}%: {next.example} — unlocks {formatUnlockLabels(next.unlocks)}
        </p>
      ) : null}
      {!compact ? (
        <ul className="profile-completion-progress__milestones">
          {milestones.map((m) => (
            <li key={m.percent} className={m.reached ? "is-reached" : ""}>
              <span>{m.percent}%</span>
              <span>{m.label}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
