import { Camera, Check, Mic, Shield, Zap } from "lucide-react";
import { memo } from "react";
import type { ReactElement } from "react";
import type { DatingProfile } from "../../../types";
import { MAX_PROFILE_PHOTOS } from "../../../constants/photos";
import { safeArray } from "../../../utils/safeProfile";
import { getVoiceVibeUrl } from "../../../utils/voiceVibe";
import { isTrustedMember, isTrustedMemberPending } from "../../../utils/trustedMember";
import { ProfileCompletionRing } from "./ProfileCompletionRing";

export type ProfileQuickStatId = "profile" | "trusted" | "photos" | "voice" | "visibility";

type ProfileQuickStatsProps = {
  profile: DatingProfile;
  profileScore: number;
  showVisibility?: boolean;
  onStat: (id: ProfileQuickStatId) => void;
  className?: string;
};

function photoCount(profile: DatingProfile): number {
  return safeArray<string>(profile.photos).filter(Boolean).length;
}

function trustedDisplay(profile: DatingProfile): { icon: ReactElement; label: string } {
  if (isTrustedMember(profile)) {
    return { icon: <Check size={15} aria-hidden />, label: "Trusted" };
  }
  if (isTrustedMemberPending(profile)) {
    return { icon: <Shield size={15} aria-hidden />, label: "Pending" };
  }
  return { icon: <Shield size={15} aria-hidden />, label: "Build" };
}

export const ProfileQuickStats = memo(function ProfileQuickStats({
  profile,
  profileScore,
  showVisibility = false,
  onStat,
  className = ""
}: ProfileQuickStatsProps) {
  const photos = photoCount(profile);
  const photoTarget = Math.min(6, MAX_PROFILE_PHOTOS);
  const hasVoice = Boolean(getVoiceVibeUrl(profile));
  const trusted = trustedDisplay(profile);

  return (
    <section className={`profile-quick-stats ${className}`.trim()} aria-label="Profile stats">
      <div className="profile-quick-stats__track">
        <button type="button" className="profile-quick-stats__pass" onClick={() => onStat("profile")}>
          <span className="profile-quick-stats__icon">
            <ProfileCompletionRing score={profileScore} size="sm" animated />
          </span>
          <span className="profile-quick-stats__value">{profileScore}%</span>
          <span className="profile-quick-stats__label">Profile</span>
        </button>

        <button type="button" className="profile-quick-stats__pass" onClick={() => onStat("trusted")}>
          <span className="profile-quick-stats__icon profile-quick-stats__icon--muted">{trusted.icon}</span>
          <span className="profile-quick-stats__value">{trusted.label}</span>
          <span className="profile-quick-stats__label">Trusted</span>
        </button>

        <button type="button" className="profile-quick-stats__pass" onClick={() => onStat("photos")}>
          <span className="profile-quick-stats__icon profile-quick-stats__icon--muted">
            <Camera size={15} aria-hidden />
          </span>
          <span className="profile-quick-stats__value">
            {photos}/{photoTarget}
          </span>
          <span className="profile-quick-stats__label">Photos</span>
        </button>

        <button type="button" className="profile-quick-stats__pass" onClick={() => onStat("voice")}>
          <span className="profile-quick-stats__icon profile-quick-stats__icon--muted">
            <Mic size={15} aria-hidden />
          </span>
          <span className="profile-quick-stats__value">{hasVoice ? "Added" : "Add"}</span>
          <span className="profile-quick-stats__label">Voice</span>
        </button>

        {showVisibility ? (
          <button type="button" className="profile-quick-stats__pass" onClick={() => onStat("visibility")}>
            <span className="profile-quick-stats__icon profile-quick-stats__icon--boost">
              <Zap size={15} aria-hidden />
            </span>
            <span className="profile-quick-stats__value">Boost</span>
            <span className="profile-quick-stats__label">Visibility</span>
          </button>
        ) : null}
      </div>
    </section>
  );
});
