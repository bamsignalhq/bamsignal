import type { SystemOverviewCardViewModel } from "../../../types/houseOperatingSystem";

type SystemOverviewCardProps = {
  system: SystemOverviewCardViewModel;
};

export function SystemOverviewCard({ system }: SystemOverviewCardProps) {
  return (
    <article className="hos-system-card institute-glass">
      <header className="hos-system-card__head">
        <h3>{system.title}</h3>
        <span className="hos-system-card__badge">{system.systemLabel}</span>
      </header>
      <p className="hos-system-card__order">System {system.systemOrder}</p>
      <p className="hos-system-card__description">{system.description}</p>
      <p className="hos-system-card__status">{system.statusLabel}</p>
    </article>
  );
}
