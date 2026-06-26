import { LAUNCH_GO_NO_GO_LABELS } from "../../../constants/launchCommandCenter";
import type { LaunchCommandGoNoGo } from "../../../types/launchCommandCenter";

type LaunchCommandGoNoGoCardProps = {
  goNoGo: LaunchCommandGoNoGo;
};

export function LaunchCommandGoNoGoCard({ goNoGo }: LaunchCommandGoNoGoCardProps) {
  return (
    <section
      className={`launch-command-card launch-command-gonogo-card launch-command-gonogo-card--${goNoGo.recommendation} concierge-consultant-card--glass cc-reveal`}
    >
      <header className="launch-command-card__head">
        <h3>Go / No-Go</h3>
        <p>Can BamSignal safely serve 100,000 members today?</p>
      </header>
      <p className="launch-command-gonogo-card__verdict">
        {LAUNCH_GO_NO_GO_LABELS[goNoGo.recommendation]}
      </p>
      <p className="launch-command-gonogo-card__capacity">{goNoGo.capacityHeadroom}</p>
      <ul className="launch-command-gonogo-card__reasoning">
        {goNoGo.reasoning.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <p className="launch-command-card__meta">
        Evaluated {new Date(goNoGo.lastEvaluatedAt).toLocaleString()}
      </p>
    </section>
  );
}
