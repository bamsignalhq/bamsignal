import {
  COMMON_GROUND_EMPTY_COPY,
  COMMON_GROUND_EMPTY_HEADLINE,
  COMMON_GROUND_LEDE,
  COMMON_GROUND_SUBTEXT,
  COMMON_GROUND_TITLE,
  DISCOVER_COMMON_GROUND_STORIES,
  MAX_COMMON_GROUND_STORIES,
  type CommonGroundStory
} from "../../utils/buildCommonGroundStories";
import { CommonGroundRow } from "./CommonGroundRow";

type YourCommonGroundCardProps = {
  stories: CommonGroundStory[];
  variant?: "profile" | "discover";
  className?: string;
  max?: number;
};

export function YourCommonGroundCard({
  stories,
  variant = "profile",
  className = "",
  max
}: YourCommonGroundCardProps) {
  const limit =
    max ??
    (variant === "discover" ? DISCOVER_COMMON_GROUND_STORIES : MAX_COMMON_GROUND_STORIES);
  const visible = stories.slice(0, limit);

  if (!visible.length && variant !== "profile") {
    return null;
  }

  if (variant === "discover") {
    if (!visible.length) return null;
    return (
      <section
        className={`common-ground common-ground--discover ${className}`.trim()}
        aria-label={COMMON_GROUND_TITLE}
      >
        <p className="common-ground__eyebrow">{COMMON_GROUND_TITLE}</p>
        <div className="common-ground__rows">
          {visible.map((story, index) => (
            <CommonGroundRow key={story.id} story={story} staggerIndex={index} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      className={`common-ground common-ground--profile ${className}`.trim()}
      aria-label={COMMON_GROUND_TITLE}
    >
      <header className="common-ground__head">
        <h3 className="common-ground__title">{COMMON_GROUND_TITLE}</h3>
        <p className="common-ground__subtext">{COMMON_GROUND_SUBTEXT}</p>
        <p className="common-ground__lede">{COMMON_GROUND_LEDE}</p>
      </header>

      {visible.length ? (
        <div className="common-ground__rows">
          {visible.map((story, index) => (
            <CommonGroundRow key={story.id} story={story} staggerIndex={index} />
          ))}
        </div>
      ) : (
        <div className="common-ground__empty">
          <p className="common-ground__empty-title">{COMMON_GROUND_EMPTY_HEADLINE}</p>
          <p className="common-ground__empty-copy">{COMMON_GROUND_EMPTY_COPY}</p>
        </div>
      )}
    </section>
  );
}
