import {
  ACTIVITY_HIGHLIGHTS_EMPTY_COPY,
  ACTIVITY_HIGHLIGHTS_EMPTY_HEADLINE,
  ACTIVITY_HIGHLIGHTS_TITLE,
  DISCOVER_ACTIVITY_HIGHLIGHTS,
  MAX_ACTIVITY_HIGHLIGHTS,
  type ActivityHighlight
} from "../../utils/buildActivityHighlights";
import { ActivityHighlightChip } from "./ActivityHighlightChip";

type ActivityHighlightsCardProps = {
  highlights: ActivityHighlight[];
  variant?: "profile" | "hero" | "discover";
  className?: string;
  max?: number;
};

export function ActivityHighlightsCard({
  highlights,
  variant = "profile",
  className = "",
  max
}: ActivityHighlightsCardProps) {
  const limit =
    max ??
    (variant === "discover"
      ? DISCOVER_ACTIVITY_HIGHLIGHTS
      : variant === "hero"
        ? MAX_ACTIVITY_HIGHLIGHTS
        : MAX_ACTIVITY_HIGHLIGHTS);

  const visible = highlights.slice(0, limit);

  if (!visible.length && variant !== "profile") {
    return null;
  }

  if (variant === "hero" || variant === "discover") {
    if (!visible.length) return null;
    return (
      <div
        className={`activity-highlights activity-highlights--${variant} ${className}`.trim()}
        aria-label={ACTIVITY_HIGHLIGHTS_TITLE}
      >
        <div className="activity-highlights__chips" role="list">
          {visible.map((highlight, index) => (
            <ActivityHighlightChip
              key={highlight.id}
              highlight={highlight}
              staggerIndex={index}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section
      className={`activity-highlights activity-highlights--profile ${className}`.trim()}
      aria-label={ACTIVITY_HIGHLIGHTS_TITLE}
    >
      <h3 className="activity-highlights__title">{ACTIVITY_HIGHLIGHTS_TITLE}</h3>
      {visible.length ? (
        <div className="activity-highlights__chips" role="list">
          {visible.map((highlight, index) => (
            <ActivityHighlightChip
              key={highlight.id}
              highlight={highlight}
              staggerIndex={index}
            />
          ))}
        </div>
      ) : (
        <div className="activity-highlights__empty">
          <p className="activity-highlights__empty-title">{ACTIVITY_HIGHLIGHTS_EMPTY_HEADLINE}</p>
          <p className="activity-highlights__empty-copy">{ACTIVITY_HIGHLIGHTS_EMPTY_COPY}</p>
        </div>
      )}
    </section>
  );
}
