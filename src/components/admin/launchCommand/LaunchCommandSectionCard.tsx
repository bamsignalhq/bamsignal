import { LAUNCH_COMMAND_HEALTH_STATUS_LABELS } from "../../../constants/launchCommandCenter";
import type { LaunchCommandSectionSnapshot } from "../../../types/launchCommandCenter";

type LaunchCommandSectionCardProps = {
  section: LaunchCommandSectionSnapshot;
};

export function LaunchCommandSectionCard({ section }: LaunchCommandSectionCardProps) {
  return (
    <section className="launch-command-card launch-command-section-card concierge-consultant-card--glass cc-reveal">
      <header className="launch-command-card__head">
        <div className="launch-command-card__row">
          <h3>{section.headline}</h3>
          <span className={`launch-command-section-card__status launch-command-section-card__status--${section.status}`}>
            {LAUNCH_COMMAND_HEALTH_STATUS_LABELS[section.status]}
          </span>
        </div>
      </header>
      <div className="launch-command-section-card__grid">
        {section.metrics.map((metric) => (
          <article key={metric.id} className={`launch-command-metric launch-command-metric--${metric.status}`}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            {metric.detail ? <p>{metric.detail}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
