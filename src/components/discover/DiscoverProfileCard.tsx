import {
  ChevronLeft,
  ChevronRight,
  Quote,
  Send,
  X
} from "lucide-react";
import { useMemo, useState } from "react";
import { DEFAULT_PROFILE_COVER } from "../../constants/photos";
import { BRAND } from "../../constants/copy";
import type { DiscoverProfile } from "../../types";
import type { VerificationInfo } from "../../utils/verification";
import { ShowcaseImage } from "../ShowcaseImage";
import { TrustedMemberShieldIcon } from "../trusted/TrustedMemberBadge";
import { VoiceVibeWaveformCard } from "../voice/VoiceVibeWaveformCard";
import { getVoiceVibeDuration, getVoiceVibeUrl, hasVoiceVibe } from "../../utils/voiceVibe";
import { isTrustedMember } from "../../utils/trustedMember";
import { RelationshipIntentChips } from "../relationshipIntent/RelationshipIntentChips";
import { MoreAboutMeChips } from "../moreAboutMe/MoreAboutMeChips";
import { ActivityHighlightsCard } from "../activity/ActivityHighlightsCard";
import { YourCommonGroundCard } from "../commonGround/YourCommonGroundCard";
import { buildActivityHighlights } from "../../utils/buildActivityHighlights";
import { buildCommonGroundStories } from "../../utils/buildCommonGroundStories";
import { getDatingProfile } from "../../utils/profile";
import { SaveProfileButton } from "../savedProfiles/SaveProfileButton";

type DiscoverProfileCardProps = {
  profile: DiscoverProfile;
  verification?: VerificationInfo;
  signalSent?: boolean;
  signalBlockedReason?: string;
  entering?: boolean;
  onIgnore: () => void;
  onSaveToast?: (message: string) => void;
  onSendSignal: () => void;
  onViewProfile: () => void;
};

export function DiscoverProfileCard({
  profile,
  verification,
  signalSent = false,
  signalBlockedReason,
  entering = true,
  onIgnore,
  onSaveToast,
  onSendSignal,
  onViewProfile
}: DiscoverProfileCardProps) {
  const photos = useMemo(
    () => (profile.photos?.length ? profile.photos : [profile.photo || DEFAULT_PROFILE_COVER]),
    [profile.photo, profile.photos]
  );
  const [photoIndex, setPhotoIndex] = useState(0);
  const photo = photos[photoIndex] ?? DEFAULT_PROFILE_COVER;
  const viewerProfile = useMemo(() => getDatingProfile(), []);
  const activityHighlights = useMemo(
    () => buildActivityHighlights(profile, { viewerCity: viewerProfile.city }),
    [profile, viewerProfile.city]
  );
  const commonGroundStories = useMemo(
    () => buildCommonGroundStories(viewerProfile, profile),
    [viewerProfile, profile]
  );
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

        <span className="discover-premium-card__photo-count">
          {photoIndex + 1} / {photos.length}
        </span>

        <div className="discover-premium-card__hero-meta">
          <div className="discover-premium-card__identity">
            <h2>
              {profile.name}, {profile.age}
              {isTrustedMember(profile) ? <TrustedMemberShieldIcon /> : null}
            </h2>
            <RelationshipIntentChips intents={profile.intents} variant="discover" />
            <MoreAboutMeChips items={profile.interests} variant="discover" />
            <ActivityHighlightsCard highlights={activityHighlights} variant="discover" />
          </div>
          <p className="discover-premium-card__location">📍 {locationLabel}</p>
        </div>
      </div>

      <div className="discover-premium-card__quote-row">
        <div className="discover-premium-card__quote">
          <Quote size={18} className="discover-premium-card__quote-icon" aria-hidden />
          <p>{quote}</p>
        </div>
        <div className="discover-premium-card__quote-divider" aria-hidden />
        {hasVoiceVibe(profile) && getVoiceVibeUrl(profile) ? (
          <VoiceVibeWaveformCard
            url={getVoiceVibeUrl(profile)!}
            duration={getVoiceVibeDuration(profile)}
            variant="mini"
          />
        ) : null}
      </div>

      <YourCommonGroundCard stories={commonGroundStories} variant="discover" />

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
          <SaveProfileButton
            profileId={profile.id}
            variant="discover"
            className="discover-premium-card__circle-btn"
            onToast={onSaveToast}
          />
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
