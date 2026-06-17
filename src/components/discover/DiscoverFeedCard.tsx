import { DEFAULT_PROFILE_COVER } from "../../constants/photos";
import { isSampleHomeProfile } from "../../utils/homeFeedSamples";
import { MapPin, Send } from "lucide-react";
import type { DiscoverProfile } from "../../types";
import type { VerificationInfo } from "../../utils/verification";
import { ShowcaseImage } from "../ShowcaseImage";
import { VerificationBadge } from "../VerificationBadge";

export type DiscoverFeedCardProps = {
  profile: DiscoverProfile;
  verification?: VerificationInfo;
  signaling?: boolean;
  onOpen: () => void;
  onSignal: () => void;
};

/** Compact portrait grid card — photo-first, minimal text, signal CTA. */
export function DiscoverFeedCard({
  profile,
  verification,
  signaling,
  onOpen,
  onSignal
}: DiscoverFeedCardProps) {
  const preview = isSampleHomeProfile(profile);

  return (
    <article className={`discover-feed-card${preview ? " discover-feed-card--preview" : ""}`}>
      <button type="button" className="discover-feed-card__open" onClick={onOpen} aria-label={`View ${profile.name}`}>
        <div className="discover-feed-card__media">
          <ShowcaseImage
            src={profile.photo || DEFAULT_PROFILE_COVER}
            alt=""
            fallbackSrc={DEFAULT_PROFILE_COVER}
            className="discover-feed-card__photo"
            loading="lazy"
          />
          {verification?.tier ? (
            <span className="discover-feed-card__verify" aria-label={verification.label}>
              <VerificationBadge info={verification} />
            </span>
          ) : null}
          {preview ? <span className="discover-feed-card__preview">Preview</span> : null}
          <div className="discover-feed-card__overlay">
            <h3 className="discover-feed-card__name">
              {profile.name}
              <span>, {profile.age}</span>
            </h3>
            <p className="discover-feed-card__city">
              <MapPin size={10} aria-hidden />
              {profile.city}
            </p>
          </div>
        </div>
      </button>
      <button
        type="button"
        className="discover-feed-card__signal"
        disabled={signaling}
        onClick={(e) => {
          e.stopPropagation();
          onSignal();
        }}
      >
        <Send size={12} aria-hidden />
        Signal
      </button>
    </article>
  );
}
