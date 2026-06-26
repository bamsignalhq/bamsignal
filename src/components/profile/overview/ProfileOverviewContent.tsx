import { memo, useMemo } from "react";
import type { DatingProfile, PhotoReviewMeta, UserProfile } from "../../../types";
import { getProfileAboutDisplay } from "../../../utils/ownProfileOverview";
import { normalizeMoreAboutMeInterests } from "../../../utils/moreAboutMe";
import {
  normalizeEthnicities,
  normalizeLifestyleTraits,
  normalizeOccupations
} from "../../../constants/profileOptions";
import { isPreferNot } from "../../../utils/preferNot";
import { safeArray } from "../../../utils/safeProfile";
import { getVoiceVibeDuration, getVoiceVibeUrl, hasVoiceVibe } from "../../../utils/voiceVibe";
import type { VerificationInfo } from "../../../utils/verification";
import { calculateProfileStrength, getProfileStrengthImprovements } from "../../../utils/profileStrength";
import { VoiceVibeWaveformCard } from "../../voice/VoiceVibeWaveformCard";
import { ProfileFintechHero } from "./ProfileFintechHero";
import { ProfileGuidanceChip } from "./ProfileGuidanceChip";
import { ProfileInterestsStrip } from "./ProfileInterestsStrip";
import { ProfilePrivateSection } from "./ProfilePrivateSection";
import { ProfileQuickStats, type ProfileQuickStatId } from "./ProfileQuickStats";
import { ProfileCompletionSheet } from "./ProfileCompletionSheet";
import { ProfileSettingsList } from "./ProfileSettingsList";
import type { EditSection } from "./profileOverviewTypes";

type SettingsPanel = "hub" | "privacy" | "notifications";

type ProfileOverviewContentProps = {
  user: UserProfile;
  profile: DatingProfile;
  verification: VerificationInfo;
  phoneVerified: boolean;
  isPremium: boolean;
  showBoostEntry: boolean;
  completionSheetOpen: boolean;
  onCompletionSheetOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onOpenEditSection: (section: EditSection) => void;
  onOpenVoiceVibe: () => void;
  onOpenTrusted: () => void;
  onOpenBoost: () => void;
  onOpenSettings: (panel?: SettingsPanel) => void;
  onLogout: () => void;
  coverPhoto?: string;
  photoMeta?: Record<string, PhotoReviewMeta>;
  onCoverChange: (
    coverPhoto: string | undefined,
    photoMeta?: Record<string, PhotoReviewMeta>,
    coverPhotoPath?: string
  ) => void;
  onCoverModerationMessage: (message: string) => void;
  onPhotosChange: (
    photos: string[],
    photoMeta?: Record<string, PhotoReviewMeta>,
    mainPhotoUrl?: string
  ) => void;
  onPhotoModerationMessage: (message: string) => void;
};

function educationLabel(profile: DatingProfile): string | null {
  const prompt = safeArray<{ answer?: string }>(profile.profilePrompts).find(
    (row) => row.answer?.trim()
  );
  if (prompt?.answer?.trim()) return prompt.answer.trim();
  const occupations = normalizeOccupations(profile.occupations, profile.occupation);
  const educationOccupation = occupations.find((value) =>
    /education|student|lecturer|teacher|university|college/i.test(value)
  );
  return educationOccupation ?? null;
}

/** Extended relationship facts — excludes hero identity fields. */
function relationshipFacts(profile: DatingProfile): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [];
  if (profile.lookingFor) rows.push({ label: "Looking For", value: profile.lookingFor });
  const education = educationLabel(profile);
  if (education) rows.push({ label: "Education", value: education });
  const lifestyles = normalizeLifestyleTraits(
    profile.lifestyles?.length ? profile.lifestyles : profile.lifestyle ? [profile.lifestyle] : []
  ).filter((value) => !isPreferNot(value));
  if (lifestyles.length) rows.push({ label: "Lifestyle", value: lifestyles.join(", ") });
  const tribes = normalizeEthnicities(profile.ethnicities, profile.ethnicity);
  if (tribes.length && !isPreferNot(tribes[0])) {
    rows.push({ label: "Background", value: tribes.join(", ") });
  }
  return rows;
}

export const ProfileOverviewContent = memo(function ProfileOverviewContent({
  user,
  profile,
  verification,
  phoneVerified,
  isPremium,
  showBoostEntry,
  completionSheetOpen,
  onCompletionSheetOpenChange,
  onEdit,
  onOpenEditSection,
  onOpenVoiceVibe,
  onOpenTrusted,
  onOpenBoost,
  onOpenSettings,
  onLogout,
  coverPhoto,
  photoMeta,
  onCoverChange,
  onCoverModerationMessage,
  onPhotosChange,
  onPhotoModerationMessage
}: ProfileOverviewContentProps) {
  const options = useMemo(() => ({ phoneVerified, isPremium }), [phoneVerified, isPremium]);
  const profileScore = useMemo(() => calculateProfileStrength(profile, options), [profile, options]);
  const missing = useMemo(
    () => getProfileStrengthImprovements(profile, options).slice(0, 6),
    [profile, options]
  );
  const about = useMemo(() => getProfileAboutDisplay(profile), [profile]);
  const interests = useMemo(
    () => normalizeMoreAboutMeInterests(profile.interests),
    [profile.interests]
  );
  const relationship = useMemo(() => relationshipFacts(profile), [profile]);
  const voiceUrl = getVoiceVibeUrl(profile);
  const hasVoice = Boolean(voiceUrl && hasVoiceVibe(profile));

  const handleStat = (id: ProfileQuickStatId) => {
    switch (id) {
      case "profile":
        onCompletionSheetOpenChange(true);
        break;
      case "trusted":
        onOpenTrusted();
        break;
      case "photos":
        onOpenEditSection("photos");
        break;
      case "voice":
        onOpenVoiceVibe();
        break;
      case "visibility":
        onOpenBoost();
        break;
    }
  };

  return (
    <div className="profile-fintech-overview">
      <ProfileFintechHero
        user={user}
        profile={profile}
        verification={verification}
        onEdit={onEdit}
        coverPhoto={coverPhoto}
        photoMeta={photoMeta}
        onCoverChange={onCoverChange}
        onCoverModerationMessage={onCoverModerationMessage}
        onPhotosChange={onPhotosChange}
        onPhotoModerationMessage={onPhotoModerationMessage}
      />

      <ProfileQuickStats
        profile={profile}
        profileScore={profileScore}
        showVisibility={showBoostEntry}
        onStat={handleStat}
      />

      <ProfileGuidanceChip
        profile={profile}
        phoneVerified={phoneVerified}
        isPremium={isPremium}
        onPhotos={() => onOpenEditSection("photos")}
        onVoice={onOpenVoiceVibe}
        onTrusted={onOpenTrusted}
      />

      {about ? (
        <section className="profile-fintech-about">
          <div className="profile-fintech-about__head">
            <h2>About</h2>
            <button type="button" onClick={() => onOpenEditSection("bio")}>
              Edit
            </button>
          </div>
          <p className="profile-fintech-about__text">{about.text}</p>
        </section>
      ) : null}

      {interests.length ? (
        <section className="profile-fintech-section profile-fintech-section--flat">
          <div className="profile-fintech-section__head">
            <h2>Interests</h2>
            <button type="button" onClick={() => onOpenEditSection("interests")}>
              Edit
            </button>
          </div>
          <ProfileInterestsStrip interests={profile.interests ?? []} />
        </section>
      ) : null}

      {relationship.length ? (
        <section className="profile-fintech-section profile-fintech-section--flat">
          <div className="profile-fintech-section__head">
            <h2>Relationship</h2>
            <button type="button" onClick={() => onOpenEditSection("details")}>
              Edit
            </button>
          </div>
          <dl className="profile-fintech-facts">
            {relationship.map((row) => (
              <div key={row.label} className="profile-fintech-facts__row">
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {hasVoice ? (
        <section className="profile-fintech-section profile-fintech-section--flat profile-fintech-section--voice">
          <div className="profile-fintech-section__head">
            <h2>Voice Vibe</h2>
            <button type="button" onClick={onOpenVoiceVibe}>
              Manage
            </button>
          </div>
          <VoiceVibeWaveformCard
            url={voiceUrl!}
            duration={getVoiceVibeDuration(profile)}
            variant="mini"
            title=""
            subtext=""
          />
        </section>
      ) : (
        <button type="button" className="profile-voice-row" onClick={onOpenVoiceVibe}>
          <span className="profile-voice-row__lead">🎤 Add Voice Vibe</span>
          <span className="profile-voice-row__cta">→</span>
        </button>
      )}

      <ProfilePrivateSection viewerCity={profile.city} />

      <ProfileSettingsList onEdit={onEdit} onOpenSettings={onOpenSettings} onLogout={onLogout} />

      <ProfileCompletionSheet
        open={completionSheetOpen}
        score={profileScore}
        missing={missing}
        onClose={() => onCompletionSheetOpenChange(false)}
        onEdit={() => {
          onCompletionSheetOpenChange(false);
          onEdit();
        }}
      />
    </div>
  );
});
