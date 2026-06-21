import type { ActivityHighlight } from "../../utils/buildActivityHighlights";

type ActivityHighlightChipProps = {
  highlight: ActivityHighlight;
  className?: string;
  staggerIndex?: number;
};

export function ActivityHighlightChip({
  highlight,
  className = "",
  staggerIndex = 0
}: ActivityHighlightChipProps) {
  return (
    <span
      className={`activity-highlight-chip ${className}`.trim()}
      style={{ animationDelay: `${staggerIndex * 50}ms` }}
    >
      {highlight.label}
    </span>
  );
}
