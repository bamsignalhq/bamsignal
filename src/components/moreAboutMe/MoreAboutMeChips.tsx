import {
  MORE_ABOUT_ME_DISCOVER_PREVIEW,
  MORE_ABOUT_ME_HERO_PREVIEW,
  formatMoreAboutMeChip
} from "../../constants/moreAboutMe";
import { normalizeMoreAboutMeInterests } from "../../utils/moreAboutMe";

type MoreAboutMeChipsProps = {
  items: string[] | undefined;
  variant?: "hero" | "discover" | "profile";
  className?: string;
  max?: number;
  onMoreClick?: () => void;
};

export function MoreAboutMeChips({
  items,
  variant = "profile",
  className = "",
  max,
  onMoreClick
}: MoreAboutMeChipsProps) {
  const normalized = normalizeMoreAboutMeInterests(items);
  if (!normalized.length) return null;

  const limit =
    max ?? (variant === "hero" ? MORE_ABOUT_ME_HERO_PREVIEW : MORE_ABOUT_ME_DISCOVER_PREVIEW);
  const visible = normalized.slice(0, limit);
  const hiddenCount = normalized.length - visible.length;
  const premium = variant === "profile";

  return (
    <div
      className={`more-about-me-chips more-about-me-chips--${variant} ${className}`.trim()}
      aria-label="More about me"
    >
      {visible.map((id) => (
        <span
          key={id}
          className={
            premium
              ? "more-about-me-chip more-about-me-chip--profile"
              : "more-about-me-chip more-about-me-chip--compact"
          }
        >
          {formatMoreAboutMeChip(id)}
        </span>
      ))}
      {hiddenCount > 0 ? (
        onMoreClick ? (
          <button type="button" className="more-about-me-chip more-about-me-chip--more" onClick={onMoreClick}>
            +{hiddenCount} more
          </button>
        ) : (
          <span className="more-about-me-chip more-about-me-chip--more">+{hiddenCount}</span>
        )
      ) : null}
    </div>
  );
}
