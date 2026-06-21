import type { DiscoverReason } from "../../utils/buildDiscoverReasons";
import { DISCOVER_WHY_APPEARS_TITLE } from "../../constants/discoverExperience";

type DiscoverReasonCardProps = {
  reasons: DiscoverReason[];
  className?: string;
};

export function DiscoverReasonCard({ reasons, className = "" }: DiscoverReasonCardProps) {
  if (!reasons.length) return null;

  return (
    <aside className={`discover-reason-card ${className}`.trim()} aria-label={DISCOVER_WHY_APPEARS_TITLE}>
      <p className="discover-reason-card__eyebrow">{DISCOVER_WHY_APPEARS_TITLE}</p>
      <ul className="discover-reason-card__list">
        {reasons.map((reason, index) => (
          <li
            key={reason.id}
            className="discover-reason-card__item"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {reason.text}
          </li>
        ))}
      </ul>
    </aside>
  );
}
