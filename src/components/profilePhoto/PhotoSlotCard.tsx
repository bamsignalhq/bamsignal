import { Check } from "lucide-react";
import { DEFAULT_PROFILE_COVER } from "../../constants/photos";
import { ShowcaseImage } from "../ShowcaseImage";

type PhotoSlotCardProps = {
  label: string;
  filled: boolean;
  url?: string;
  isMain?: boolean;
  staggerIndex?: number;
  onClick?: () => void;
};

export function PhotoSlotCard({
  label,
  filled,
  url,
  isMain = false,
  staggerIndex = 0,
  onClick
}: PhotoSlotCardProps) {
  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      type={onClick ? "button" : undefined}
      className={`photo-slot-card${filled ? " photo-slot-card--filled" : " photo-slot-card--empty"}${
        isMain ? " photo-slot-card--main" : ""
      }`}
      style={{ animationDelay: `${staggerIndex * 50}ms` }}
      onClick={onClick}
      aria-label={filled ? `${label} added` : `Add ${label.toLowerCase()}`}
    >
      <div className="photo-slot-card__frame">
        {filled && url ? (
          <ShowcaseImage
            src={url}
            alt=""
            fallbackSrc={DEFAULT_PROFILE_COVER}
            className="photo-slot-card__image"
            loading="lazy"
          />
        ) : (
          <span className="photo-slot-card__placeholder" aria-hidden>
            +
          </span>
        )}
        {filled ? (
          <span className="photo-slot-card__check" aria-hidden>
            <Check size={12} strokeWidth={3} />
          </span>
        ) : null}
      </div>
      <span className="photo-slot-card__label">
        {label}
        {filled ? <span className="photo-slot-card__done"> ✓</span> : null}
      </span>
    </Tag>
  );
}
