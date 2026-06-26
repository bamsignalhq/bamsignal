import { ChevronRight, LogOut, Settings } from "lucide-react";
import { useEffect, useMemo } from "react";
import { profileIntentLabel } from "../../../constants/intents";
import { WHAT_BRINGS_ME_HERE_TITLE } from "../../../constants/relationshipIntent";
import { relationshipIntentsFrom } from "../../../constants/relationshipIntent";
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
import { navigateToPath } from "../../../constants/routes";
import { useSavedProfiles } from "../../../hooks/useSavedProfiles";
import { ProfileInterestsPreview } from "../ProfileInterestsPreview";
import { VoiceVibeWaveformCard } from "../../voice/VoiceVibeWaveformCard";
import { MemberMicroNudge } from "../../nudges/MemberMicroNudge";
import { ProfileFintechHero } from "./ProfileFintechHero";
import { ProfileGuidanceChip } from "./ProfileGuidanceChip";
import { ProfilePrivateCard, ProfileQuickStats, type ProfileQuickStatId } from "./ProfileQuickStats";
import { ProfileCompletionSheet } from "./ProfileCompletionSheet";
import type { EditSection } from "./profileOverviewTypes";

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
  onOpenSettings: () => void;
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

function relationshipRows(profile: DatingProfile): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [];
  if (profile.lookingFor) rows.push({ label: "Looking for", value: profile.lookingFor });
  const intents = relationshipIntentsFrom(profile.intents);
  if (intents.length) {
    rows.push({
      label: WHAT_BRINGS_ME_HERE_TITLE,
      value: intents.map((intent) => profileIntentLabel(intent)).join(", ")
    });
  }
  if (profile.religion && !isPreferNot(profile.religion)) {
    rows.push({ label: "Faith", value: profile.religion });
  }
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

export function ProfileOverviewContent({
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
  const about = getProfileAboutDisplay(profile);
  const interests = normalizeMoreAboutMeInterests(profile.interests);
  const relationship = relationshipRows(profile);
  const voiceUrl = getVoiceVibeUrl(profile);
  const { profiles: savedProfiles, refreshProfiles } = useSavedProfiles({ viewerCity: profile.city });

  useEffect(() => {
    void refreshProfiles();
  }, [refreshProfiles]);

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
        profileScore={profileScore}
        onEdit={onEdit}
        onOpenCompletion={() => onCompletionSheetOpenChange(true)}
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
        <section className="profile-fintech-section">
          <div className="profile-fintech-section__head">
            <h2>About</h2>
            <button type="button" onClick={() => onOpenEditSection("bio")}>
              Edit
            </button>
          </div>
          <p className="profile-fintech-section__text">{about.text}</p>
        </section>
      ) : null}

      {interests.length ? (
        <section className="profile-fintech-section">
          <div className="profile-fintech-section__head">
            <h2>Interests</h2>
            <button type="button" onClick={() => onOpenEditSection("interests")}>
              Edit
            </button>
          </div>
          <div className="profile-fintech-section__scroll">
            <ProfileInterestsPreview interests={profile.interests ?? []} variant="premium" />
          </div>
        </section>
      ) : null}

      {relationship.length ? (
        <section className="profile-fintech-section">
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

      <section className="profile-fintech-section profile-fintech-section--voice">
        <div className="profile-fintech-section__head">
          <h2>Voice Vibe</h2>
          {hasVoiceVibe(profile) ? (
            <button type="button" onClick={onOpenVoiceVibe}>
              Manage
            </button>
          ) : null}
        </div>
        {voiceUrl ? (
          <VoiceVibeWaveformCard
            url={voiceUrl}
            duration={getVoiceVibeDuration(profile)}
            variant="mini"
            title=""
            subtext=""
          />
        ) : (
          <MemberMicroNudge emoji="🎤" lead="Add Voice Vibe" cta="→" onAction={onOpenVoiceVibe} />
        )}
      </section>

      <section className="profile-fintech-section profile-fintech-section--private">
        <div className="profile-fintech-section__head">
          <h2>Private</h2>
        </div>
        <ProfilePrivateCard count={savedProfiles.length} onOpen={() => navigateToPath("/saved-profiles")} />
      </section>

      <footer className="profile-fintech-footer">
        <button type="button" className="profile-fintech-footer__link" onClick={onOpenSettings}>
          <Settings size={16} aria-hidden />
          Settings
        </button>
        <button type="button" className="profile-fintech-footer__link profile-fintech-footer__link--muted" onClick={onLogout}>
          <LogOut size={16} aria-hidden />
          Log out
        </button>
      </footer>

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
}
