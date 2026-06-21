import { useMemo } from "react";
import { DEFAULT_PROFILE_COVER } from "../../constants/photos";
import type { SavedDiscoverProfile } from "../../constants/savedProfiles";
import { buildCompatibilityReasons } from "../../utils/buildCompatibilityReasons";
import { getDatingProfile } from "../../utils/profile";
import { hasVoiceVibe } from "../../utils/voiceVibe";
import { isTrustedMember } from "../../utils/trustedMember";
import { ShowcaseImage } from "../ShowcaseImage";
import { TrustedMemberShieldIcon } from "../trusted/TrustedMemberBadge";
import { CompatibilityReasonsCard } from "../profile/CompatibilityReasonsCard";

type SavedProfileCardProps = {
  profile: SavedDiscoverProfile;
  onOpen: (profile: SavedDiscoverProfile) => void;
  onRemove?: (profileId: string) => void;
  staggerIndex?: number;
};

export function SavedProfileCard({
  profile,
  onOpen,
  onRemove,
  staggerIndex = 0
}: SavedProfileCardProps) {
  const viewerProfile = useMemo(() => getDatingProfile(), []);
  const compatibilityReasons = useMemo(
    () => buildCompatibilityReasons(viewerProfile, profile).slice(0, 2),
    [viewerProfile, profile]
  );
  const photo = profile.photo || profile.photos?.[0] || DEFAULT_PROFILE_COVER;
  const location = profile.state ? `${profile.city}, ${profile.state}` : profile.city;

  return (
    <article
      className="saved-profile-card"
      style={{ animationDelay: `${staggerIndex * 60}ms` }}
    >
      <button
        type="button"
        className="saved-profile-card__main"
        onClick={() => onOpen(profile)}
        aria-label={`View ${profile.name}'s profile`}
      >
        <ShowcaseImage
          src={photo}
          alt={profile.name}
          fallbackSrc={DEFAULT_PROFILE_COVER}
          loading="lazy"
          className="saved-profile-card__avatar"
        />
        <div className="saved-profile-card__body">
          <div className="saved-profile-card__identity">
            <h3>
              {profile.name}, {profile.age}
              {isTrustedMember(profile) ? <TrustedMemberShieldIcon /> : null}
            </h3>
            <p className="saved-profile-card__city">{location}</p>
          </div>
          <div className="saved-profile-card__badges">
            {hasVoiceVibe(profile) ? (
              <span className="saved-profile-card__badge" title="Voice Vibe">
                🎙
              </span>
            ) : null}
          </div>
        </div>
      </button>

      {compatibilityReasons.length ? (
        <CompatibilityReasonsCard
          reasons={compatibilityReasons}
          className="saved-profile-card__compat"
        />
      ) : null}

      {onRemove ? (
        <button
          type="button"
          className="saved-profile-card__remove"
          onClick={() => onRemove(profile.id)}
        >
          Remove
        </button>
      ) : null}
    </article>
  );
}
