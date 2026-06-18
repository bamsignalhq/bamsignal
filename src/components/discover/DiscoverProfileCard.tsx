import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Quote,
  Send,
  X,
  AudioLines
} from "lucide-react";
import { useMemo, useState } from "react";
import { DEFAULT_PROFILE_COVER } from "../../constants/photos";
import { BRAND } from "../../constants/copy";
import type { DiscoverProfile } from "../../types";
import type { VerificationInfo } from "../../utils/verification";
import { isOnlineNow } from "../../utils/activity";
import { ShowcaseImage } from "../ShowcaseImage";
import { VerifiedBadge } from "../VerifiedBadge";

const INTEREST_ICONS: Record<string, string> = {
  Travel: "✈",
  Food: "🍴",
  Foodie: "🍴",
  Music: "🎵",
  Movies: "🎬",
  Fitness: "💪",
  Beach: "🏖",
  Fashion: "👗",
  Photography: "📷",
  Football: "⚽",
  Comedy: "🎭",
  Business: "💼"
};

function interestLabel(interest: string): string {
  const icon = INTEREST_ICONS[interest] ?? "•";
  return `${icon} ${interest}`;
}

type DiscoverProfileCardProps = {
  profile: DiscoverProfile;
  verification?: VerificationInfo;
  saved?: boolean;
  signalSent?: boolean;
  signalBlockedReason?: string;
  entering?: boolean;
  onIgnore: () => void;
  onSave: () => void;
  onSendSignal: () => void;
  onViewProfile: () => void;
};

export function DiscoverProfileCard({
  profile,
  verification,
  saved = false,
  signalSent = false,
  signalBlockedReason,
  entering = true,
  onIgnore,
  onSave,
  onSendSignal,
  onViewProfile
}: DiscoverProfileCardProps) {
  const photos = useMemo(
    () => (profile.photos?.length ? profile.photos : [profile.photo || DEFAULT_PROFILE_COVER]),
    [profile.photo, profile.photos]
  );
  const [photoIndex, setPhotoIndex] = useState(0);
  const photo = photos[photoIndex] ?? DEFAULT_PROFILE_COVER;
  const online = isOnlineNow(profile.lastActiveAt);
  const interests = profile.interests ?? [];
  const visibleInterests = interests.slice(0, 3);
  const hiddenCount = Math.max(0, interests.length - 3);
  const locationLabel = profile.state ? `${profile.city}, ${profile.state}` : `${profile.city}, Nigeria`;
  const quote =
    profile.bio?.trim() ||
    "Looking for someone who values kindness, growth and building something real.";

  const changePhoto = (delta: number) => {
    setPhotoIndex((current) => {
      const next = current + delta;
      if (next < 0) return photos.length - 1;
      if (next >= photos.length) return 0;
      return next;
    });
  };

  return (
    <article
      className={`discover-premium-card${entering ? " discover-premium-card--enter" : ""}${
        signalSent ? " discover-premium-card--sent" : ""
      }`}
    >
      <div className="discover-premium-card__media">
        <button
          type="button"
          className="discover-premium-card__photo-hit"
          onClick={onViewProfile}
          aria-label={`View ${profile.name}'s profile`}
        >
          <ShowcaseImage
            src={photo}
            alt={profile.name}
            fallbackSrc={DEFAULT_PROFILE_COVER}
            loading="eager"
            className="discover-premium-card__photo"
          />
        </button>

        {photos.length > 1 ? (
          <>
            <button
              type="button"
              className="discover-premium-card__photo-nav discover-premium-card__photo-nav--prev"
              onClick={() => changePhoto(-1)}
              aria-label="Previous photo"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className="discover-premium-card__photo-nav discover-premium-card__photo-nav--next"
              onClick={() => changePhoto(1)}
              aria-label="Next photo"
            >
              <ChevronRight size={18} />
            </button>
          </>
        ) : null}

        {online ? (
          <span className="discover-premium-card__online-pill">
            <span className="discover-premium-card__online-dot" aria-hidden />
            Online now
          </span>
        ) : null}

        <span className="discover-premium-card__photo-count">
          {photoIndex + 1} / {photos.length}
        </span>

        <div className="discover-premium-card__hero-meta">
          <div className="discover-premium-card__identity">
            <h2>
              {profile.name}, {profile.age}
            </h2>
            {verification?.tier ? <VerifiedBadge size="sm" label="Verified" /> : null}
          </div>
          <p className="discover-premium-card__location">📍 {locationLabel}</p>
          {visibleInterests.length > 0 ? (
            <div className="discover-premium-card__tags">
              {visibleInterests.map((item) => (
                <span key={item} className="discover-premium-card__tag">
                  {interestLabel(item)}
                </span>
              ))}
              {hiddenCount > 0 ? (
                <span className="discover-premium-card__tag">+{hiddenCount}</span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="discover-premium-card__quote-row">
        <div className="discover-premium-card__quote">
          <Quote size={18} className="discover-premium-card__quote-icon" aria-hidden />
          <p>{quote}</p>
        </div>
        <div className="discover-premium-card__quote-divider" aria-hidden />
        <button
          type="button"
          className="discover-premium-card__voice"
          onClick={onViewProfile}
          aria-label={profile.voiceIntroUrl ? "Play voice intro" : "Voice intro"}
        >
          <span className="discover-premium-card__voice-icon" aria-hidden>
            <AudioLines size={18} />
          </span>
          <span>Voice intro</span>
        </button>
      </div>

      {signalBlockedReason ? (
        <p className="discover-premium-card__gate" role="status">
          {signalBlockedReason}
        </p>
      ) : null}

      <div className="discover-premium-card__actions">
        <div className="discover-premium-card__action">
          <button
            type="button"
            className="discover-premium-card__circle-btn"
            onClick={onIgnore}
            aria-label={BRAND.ignore}
          >
            <X size={22} strokeWidth={2.2} />
          </button>
          <span>Not for me</span>
        </div>
        <div className="discover-premium-card__action">
          <button
            type="button"
            className={`discover-premium-card__circle-btn${saved ? " discover-premium-card__circle-btn--saved" : ""}`}
            onClick={onSave}
            aria-label={saved ? "Saved" : "Save profile"}
            aria-pressed={saved}
          >
            <Bookmark size={20} fill={saved ? "currentColor" : "none"} />
          </button>
          <span>Save</span>
        </div>
        <div className="discover-premium-card__action discover-premium-card__action--primary">
          <button
            type="button"
            className="discover-premium-card__signal-btn"
            onClick={onSendSignal}
            disabled={Boolean(signalBlockedReason) || signalSent}
            aria-label={BRAND.sendSignal}
          >
            <Send size={24} />
          </button>
          <span>Send Signal</span>
        </div>
      </div>

      <p className="discover-premium-card__swipe-hint">👋 Swipe anywhere to see next</p>
    </article>
  );
}
