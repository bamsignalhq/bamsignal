import { ChevronRight, Zap } from "lucide-react";
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

function trustedLabel(profile: DatingProfile): { value: string; tone: "done" | "pending" | "open" } {
  if (isTrustedMember(profile)) return { value: "Trusted", tone: "done" };
  if (isTrustedMemberPending(profile)) return { value: "Pending", tone: "pending" };
  return { value: "Build", tone: "open" };
}

export function ProfileQuickStats({
  profile,
  profileScore,
  showVisibility = false,
  onStat,
  className = ""
}: ProfileQuickStatsProps) {
  const photos = photoCount(profile);
  const photoTarget = Math.min(6, MAX_PROFILE_PHOTOS);
  const hasVoice = Boolean(getVoiceVibeUrl(profile));
  const trusted = trustedLabel(profile);

  return (
    <section className={`profile-quick-stats ${className}`.trim()} aria-label="Profile stats">
      <button type="button" className="profile-quick-stats__cell" onClick={() => onStat("profile")}>
        <ProfileCompletionRing score={profileScore} size="sm" />
        <span className="profile-quick-stats__label">Profile</span>
      </button>

      <span className="profile-quick-stats__divider" aria-hidden />

      <button type="button" className="profile-quick-stats__cell" onClick={() => onStat("trusted")}>
        <span className={`profile-quick-stats__value profile-quick-stats__value--${trusted.tone}`}>
          {trusted.tone === "done" ? "✓ " : ""}
          {trusted.value}
        </span>
        <span className="profile-quick-stats__label">Trusted</span>
      </button>

      <span className="profile-quick-stats__divider" aria-hidden />

      <button type="button" className="profile-quick-stats__cell" onClick={() => onStat("photos")}>
        <span className="profile-quick-stats__value">
          {photos}/{photoTarget}
        </span>
        <span className="profile-quick-stats__label">Photos</span>
      </button>

      <span className="profile-quick-stats__divider" aria-hidden />

      <button type="button" className="profile-quick-stats__cell" onClick={() => onStat("voice")}>
        <span className={`profile-quick-stats__value${hasVoice ? " profile-quick-stats__value--done" : ""}`}>
          {hasVoice ? "Added" : "Missing"}
        </span>
        <span className="profile-quick-stats__label">Voice</span>
      </button>

      {showVisibility ? (
        <>
          <span className="profile-quick-stats__divider" aria-hidden />
          <button type="button" className="profile-quick-stats__cell" onClick={() => onStat("visibility")}>
            <span className="profile-quick-stats__value profile-quick-stats__value--boost">
              <Zap size={14} aria-hidden />
            </span>
            <span className="profile-quick-stats__label">Visibility</span>
          </button>
        </>
      ) : null}
    </section>
  );
}

type ProfilePrivateCardProps = {
  count: number;
  onOpen: () => void;
  className?: string;
};

export function ProfilePrivateCard({ count, onOpen, className = "" }: ProfilePrivateCardProps) {
  return (
    <button type="button" className={`profile-private-card ${className}`.trim()} onClick={onOpen}>
      <span className="profile-private-card__copy">
        <strong>Saved Profiles</strong>
        <small>Hidden from others</small>
      </span>
      <span className="profile-private-card__meta">
        {count > 0 ? `${count} saved` : "Private"}
        <ChevronRight size={16} aria-hidden />
      </span>
    </button>
  );
}
