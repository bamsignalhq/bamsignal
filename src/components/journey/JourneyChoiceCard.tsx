import type { ReactNode } from "react";

type JourneyChoiceCardProps = {
  title: string;
  detail: string;
  selected?: boolean;
  tone?: "discover" | "discreet" | "concierge";
  onSelect: () => void;
  icon?: ReactNode;
};

export function JourneyChoiceCard({
  title,
  detail,
  selected,
  tone = "discover",
  onSelect,
  icon
}: JourneyChoiceCardProps) {
  return (
    <button
      type="button"
      className={`journey-choice journey-choice--${tone}${selected ? " journey-choice--selected" : ""}`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <span className="journey-choice__head">
        {icon ? <span className="journey-choice__icon">{icon}</span> : null}
        <span className="journey-choice__title">{title}</span>
      </span>
      <span className="journey-choice__detail">{detail}</span>
    </button>
  );
}

export function JourneyChip({
  label,
  selected,
  onSelect
}: {
  label: string;
  selected?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`journey-chip${selected ? " journey-chip--selected" : ""}`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      {label}
    </button>
  );
}
