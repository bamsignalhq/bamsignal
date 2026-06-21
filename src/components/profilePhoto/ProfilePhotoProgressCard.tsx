import {
  PHOTO_PSYCHOLOGY_CTA,
  PHOTO_PSYCHOLOGY_EMPTY_HEADLINE,
  PHOTO_PSYCHOLOGY_HEADLINE,
  PHOTO_PSYCHOLOGY_SUBTEXT,
  PHOTO_PSYCHOLOGY_SUCCESS_HEADLINE,
  PHOTO_PSYCHOLOGY_SUCCESS_SUBTEXT,
  PHOTO_PSYCHOLOGY_VISIBILITY,
  PHOTO_TIPS_AVOID,
  PHOTO_TIPS_GOOD
} from "../../constants/photoPsychology";
import { usePhotoProgress } from "../../hooks/usePhotoProgress";
import type { DatingProfile } from "../../types";
import { PhotoSlotCard } from "./PhotoSlotCard";
import { PhotoTipsCarousel } from "./PhotoTipsCarousel";

type ProfilePhotoProgressCardProps = {
  profile: DatingProfile;
  variant?: "full" | "home";
  onAddPhotos: () => void;
  className?: string;
};

export function ProfilePhotoProgressCard({
  profile,
  variant = "full",
  onAddPhotos,
  className = ""
}: ProfilePhotoProgressCardProps) {
  const { slots, level, benefit, progressPercent, isEmpty, isOutstanding, photoCount } =
    usePhotoProgress(profile);

  const isHome = variant === "home";

  if (isHome && !isEmpty && photoCount >= 4) return null;

  const headline = isOutstanding
    ? PHOTO_PSYCHOLOGY_SUCCESS_HEADLINE
    : isEmpty
      ? PHOTO_PSYCHOLOGY_EMPTY_HEADLINE
      : PHOTO_PSYCHOLOGY_HEADLINE;

  const subtext = isOutstanding
    ? PHOTO_PSYCHOLOGY_SUCCESS_SUBTEXT
    : isEmpty
      ? PHOTO_PSYCHOLOGY_SUBTEXT
      : `${PHOTO_PSYCHOLOGY_SUBTEXT} ${PHOTO_PSYCHOLOGY_VISIBILITY}`;

  return (
    <section
      className={`profile-photo-progress-card profile-photo-progress-card--${variant}${
        isOutstanding ? " profile-photo-progress-card--outstanding" : ""
      } ${className}`.trim()}
      aria-label="Make Your Profile Shine"
    >
      <header className="profile-photo-progress-card__head">
        <h2>{headline}</h2>
        <p>{subtext}</p>
      </header>

      {!isHome ? (
        <>
          {level ? (
            <div className="profile-photo-progress-card__level-row">
              <span
                className={`profile-photo-progress-card__level profile-photo-progress-card__level--${level.id}`}
              >
                {level.label}
              </span>
              <span className="profile-photo-progress-card__count">{photoCount} of 6</span>
            </div>
          ) : null}

          <div
            className="profile-photo-progress-card__progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPercent}
            aria-label="Photo progress"
          >
            <span
              className={`profile-photo-progress-card__progress-fill${
                isOutstanding ? " profile-photo-progress-card__progress-fill--gold" : ""
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="profile-photo-progress-card__slots">
            {slots.map((slot, index) => (
              <PhotoSlotCard
                key={slot.label}
                label={slot.label}
                filled={slot.filled}
                url={slot.url}
                isMain={slot.isMain}
                staggerIndex={index}
                onClick={!slot.filled ? onAddPhotos : undefined}
              />
            ))}
          </div>

          {benefit && !isOutstanding ? (
            <p className="profile-photo-progress-card__benefit">{benefit}</p>
          ) : null}

          <PhotoTipsCarousel className="profile-photo-progress-card__carousel" />

          <div className="profile-photo-progress-card__tips-grid">
            <div className="profile-photo-progress-card__tips-col">
              <h3>Good</h3>
              <ul>
                {PHOTO_TIPS_GOOD.map((tip) => (
                  <li key={tip}>✓ {tip}</li>
                ))}
              </ul>
            </div>
            <div className="profile-photo-progress-card__tips-col profile-photo-progress-card__tips-col--avoid">
              <h3>Avoid</h3>
              <ul>
                {PHOTO_TIPS_AVOID.map((tip) => (
                  <li key={tip}>✗ {tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </>
      ) : null}

      {!isOutstanding ? (
        <button type="button" className="btn-primary btn-full profile-photo-progress-card__cta" onClick={onAddPhotos}>
          {PHOTO_PSYCHOLOGY_CTA}
        </button>
      ) : null}
    </section>
  );
}
