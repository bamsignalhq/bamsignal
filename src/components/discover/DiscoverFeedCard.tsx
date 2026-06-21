import { DEFAULT_PROFILE_COVER } from "../../constants/photos";
import { isSampleHomeProfile } from "../../utils/homeFeedSamples";
import { isRecentlyActive } from "../../utils/launchSeed";
import { Send, MapPin } from "lucide-react";
import type { DiscoverProfile } from "../../types";
import type { VerificationInfo } from "../../utils/verification";
import { ShowcaseImage } from "../ShowcaseImage";
import { TrustedMemberShieldIcon } from "../trusted/TrustedMemberBadge";
import { isTrustedMember } from "../../utils/trustedMember";

export type DiscoverFeedCardProps = {
  profile: DiscoverProfile;
  verification?: VerificationInfo;
  signaling?: boolean;
  onOpen: () => void;
  onSignal: () => void;
  variant?: "default" | "dashboard";
};

/** Compact portrait grid card — photo-first, minimal text, signal CTA. */
export function DiscoverFeedCard({
  profile,
  verification,
  signaling,
  onOpen,
  onSignal,
  variant = "default"
}: DiscoverFeedCardProps) {
  const preview = isSampleHomeProfile(profile);
  const isDashboard = variant === "dashboard";
  const isOnline = isDashboard && isRecentlyActive(profile);

  return (
    <article
      className={`discover-feed-card${isDashboard ? " discover-feed-card--dashboard" : ""}${
        preview && !isDashboard ? " discover-feed-card--preview" : ""
      }`}
    >
      <button type="button" className="discover-feed-card__open" onClick={onOpen} aria-label={`View ${profile.name}`}>
        <div className="discover-feed-card__media">
          {isOnline ? <span className="discover-feed-card__online" aria-label="Recently active" /> : null}
          <ShowcaseImage
            src={profile.photo || DEFAULT_PROFILE_COVER}
            alt=""
            fallbackSrc={DEFAULT_PROFILE_COVER}
            className="discover-feed-card__photo"
            loading="lazy"
          />
          {isTrustedMember(profile) ? (
            <span className="discover-feed-card__verify">
              <TrustedMemberShieldIcon />
            </span>
          ) : null}
          {!isDashboard && preview ? <span className="discover-feed-card__preview">Preview</span> : null}
          <div
            className={`discover-feed-card__overlay${
              isDashboard ? " discover-feed-card__overlay--dashboard" : ""
            }`}
          >
            <h3 className="discover-feed-card__name">
              {profile.name}
              <span>, {profile.age}</span>
            </h3>
            <p className="discover-feed-card__city">
              {isDashboard ? (
                <>📍 {profile.city}</>
              ) : (
                <>
                  <MapPin size={10} aria-hidden />
                  {profile.city}
                </>
              )}
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
        <Send size={isDashboard ? 12 : 12} aria-hidden />
        Signal
      </button>
    </article>
  );
}
