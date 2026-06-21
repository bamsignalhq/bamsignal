import { Send, X } from "lucide-react";
import { useMemo } from "react";
import { DEFAULT_PROFILE_COVER } from "../../constants/photos";
import { BRAND } from "../../constants/copy";
import { WHAT_BRINGS_ME_HERE_TITLE } from "../../constants/relationshipIntent";
import { MORE_ABOUT_ME_TITLE } from "../../constants/moreAboutMe";
import type { DiscoverProfile } from "../../types";
import type { VerificationInfo } from "../../utils/verification";
import { ShowcaseImage } from "../ShowcaseImage";
import { TrustedMemberShieldIcon } from "../trusted/TrustedMemberBadge";
import { VoiceVibeChip } from "../voice/VoiceVibeChip";
import { hasVoiceVibe } from "../../utils/voiceVibe";
import { isTrustedMember } from "../../utils/trustedMember";
import { RelationshipIntentChips } from "../relationshipIntent/RelationshipIntentChips";
import { MoreAboutMeChips } from "../moreAboutMe/MoreAboutMeChips";
import { ActivityHighlightsCard } from "../activity/ActivityHighlightsCard";
import { YourCommonGroundCard } from "../commonGround/YourCommonGroundCard";
import { buildActivityHighlights } from "../../utils/buildActivityHighlights";
import { buildCommonGroundStories } from "../../utils/buildCommonGroundStories";
import { buildCompatibilityReasons } from "../../utils/buildCompatibilityReasons";
import { buildDiscoverReasons } from "../../utils/buildDiscoverReasons";
import { getDatingProfile } from "../../utils/profile";
import { SaveProfileButton } from "../savedProfiles/SaveProfileButton";
import { DiscoverReasonCard } from "./DiscoverReasonCard";
import { DiscoverSection } from "./DiscoverSection";

type ProfileStoryCardProps = {
  profile: DiscoverProfile;
  verification?: VerificationInfo;
  signalSent?: boolean;
  signalBlockedReason?: string;
  entering?: boolean;
  staggerIndex?: number;
  onPass: () => void;
  onSaveToast?: (message: string) => void;
  onSignal: () => void;
  onViewProfile: () => void;
};

export function ProfileStoryCard({
  profile,
  verification,
  signalSent = false,
  signalBlockedReason,
  entering = true,
  staggerIndex = 0,
  onPass,
  onSaveToast,
  onSignal,
  onViewProfile
}: ProfileStoryCardProps) {
  void verification;

  const photo = profile.photo || profile.photos?.[0] || DEFAULT_PROFILE_COVER;
  const viewerProfile = useMemo(() => getDatingProfile(), []);
  const activityHighlights = useMemo(
    () => buildActivityHighlights(profile, { viewerCity: viewerProfile.city }),
    [profile, viewerProfile.city]
  );
  const compatibilityReasons = useMemo(
    () => buildCompatibilityReasons(viewerProfile, profile).slice(0, 2),
    [viewerProfile, profile]
  );
  const commonGroundStories = useMemo(
    () => buildCommonGroundStories(viewerProfile, profile),
    [viewerProfile, profile]
  );
  const discoverReasons = useMemo(
    () => buildDiscoverReasons(viewerProfile, profile, 2),
    [viewerProfile, profile]
  );
  const locationLabel = profile.state ? `${profile.city}, ${profile.state}` : `${profile.city}, Nigeria`;

  return (
    <article
      className={`profile-story-card${entering ? " profile-story-card--enter" : ""}${
        signalSent ? " profile-story-card--sent" : ""
      }`}
      style={{ animationDelay: `${staggerIndex * 70}ms` }}
    >
      <DiscoverReasonCard reasons={discoverReasons} className="profile-story-card__reasons" />

      <button
        type="button"
        className="profile-story-card__photo-hit"
        onClick={onViewProfile}
        aria-label={`View ${profile.name}'s profile`}
      >
        <ShowcaseImage
          src={photo}
          alt={profile.name}
          fallbackSrc={DEFAULT_PROFILE_COVER}
          loading="lazy"
          className="profile-story-card__photo"
        />
      </button>

      <div className="profile-story-card__identity">
        <h2>
          {profile.name}, {profile.age}
          {isTrustedMember(profile) ? <TrustedMemberShieldIcon /> : null}
        </h2>
        <p className="profile-story-card__city">{locationLabel}</p>
        {hasVoiceVibe(profile) ? <VoiceVibeChip className="profile-story-card__voice-chip" /> : null}
      </div>

      <ActivityHighlightsCard highlights={activityHighlights} variant="discover" />

      {compatibilityReasons.length ? (
        <DiscoverSection title="Why You May Connect">
          <ul className="profile-story-card__reason-list">
            {compatibilityReasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </DiscoverSection>
      ) : null}

      <YourCommonGroundCard stories={commonGroundStories} variant="discover" max={2} />

      {profile.intents?.length ? (
        <DiscoverSection title={WHAT_BRINGS_ME_HERE_TITLE}>
          <RelationshipIntentChips intents={profile.intents} variant="discover" />
        </DiscoverSection>
      ) : null}

      {profile.interests?.length ? (
        <DiscoverSection title={MORE_ABOUT_ME_TITLE}>
          <MoreAboutMeChips items={profile.interests} variant="discover" max={3} />
        </DiscoverSection>
      ) : null}

      {signalBlockedReason ? (
        <p className="profile-story-card__gate" role="status">
          {signalBlockedReason}
        </p>
      ) : null}

      <div className="profile-story-card__actions">
        <button type="button" className="profile-story-card__btn profile-story-card__btn--pass" onClick={onPass}>
          <X size={18} />
          Pass
        </button>
        <SaveProfileButton
          profileId={profile.id}
          variant="story"
          className="profile-story-card__btn profile-story-card__btn--save"
          onToast={onSaveToast}
        />
        <button
          type="button"
          className="profile-story-card__btn profile-story-card__btn--signal"
          onClick={onSignal}
          disabled={Boolean(signalBlockedReason) || signalSent}
        >
          <Send size={18} />
          {BRAND.sendSignal}
        </button>
      </div>
    </article>
  );
}
