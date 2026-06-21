import { Mic, Send } from "lucide-react";
import { DEFAULT_PROFILE_COVER } from "../../constants/photos";
import { BRAND } from "../../constants/copy";
import type { DiscoverProfile } from "../../types";
import { ShowcaseImage } from "../ShowcaseImage";
import { TrustedMemberBadge } from "../trusted/TrustedMemberBadge";
import { isTrustedMember } from "../../utils/trustedMember";

type ChatProfileMiniCardProps = {
  profile: DiscoverProfile;
  compatibilityReasons: string[];
  hasVoiceVibe?: boolean;
  sending?: boolean;
  signalSent?: boolean;
  onSendSignal: () => void;
  onOpenProfile?: () => void;
  staggerIndex?: number;
};

export function ChatProfileMiniCard({
  profile,
  compatibilityReasons,
  hasVoiceVibe = false,
  sending = false,
  signalSent = false,
  onSendSignal,
  onOpenProfile,
  staggerIndex = 0
}: ChatProfileMiniCardProps) {
  const photo = profile.photo || DEFAULT_PROFILE_COVER;
  const badges = compatibilityReasons.slice(0, 3);

  return (
    <article
      className="chat-profile-mini-card empty-chat-stagger"
      style={{ animationDelay: `${staggerIndex * 70}ms` }}
    >
      <button
        type="button"
        className="chat-profile-mini-card__top"
        onClick={onOpenProfile}
        aria-label={`View ${profile.name}'s profile`}
      >
        <span className="chat-profile-mini-card__avatar-wrap">
          <ShowcaseImage
            src={photo}
            alt=""
            fallbackSrc={DEFAULT_PROFILE_COVER}
            className="chat-profile-mini-card__avatar"
          />
          {hasVoiceVibe ? (
            <span className="chat-profile-mini-card__voice" aria-label="Voice Vibe available">
              <Mic size={12} aria-hidden />
            </span>
          ) : null}
        </span>

        <span className="chat-profile-mini-card__meta">
          <strong className="chat-profile-mini-card__name">
            {profile.name}
            <span className="chat-profile-mini-card__age">, {profile.age}</span>
          </strong>
          <span className="chat-profile-mini-card__city">{profile.city}</span>
          {isTrustedMember(profile) ? <TrustedMemberBadge size="sm" /> : null}
        </span>
      </button>

      {badges.length ? (
        <div className="chat-profile-mini-card__compat" aria-label="Why you may connect">
          <span className="chat-profile-mini-card__compat-label">Why You May Connect</span>
          <div className="chat-profile-mini-card__compat-chips">
            {badges.map((reason) => (
              <span key={reason} className="chat-profile-mini-card__compat-chip">
                {reason}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        className="btn-secondary btn-sm chat-profile-mini-card__signal"
        onClick={onSendSignal}
        disabled={sending || signalSent}
      >
        <Send size={14} aria-hidden />
        {signalSent ? "Signal sent" : sending ? "Sending…" : BRAND.sendSignal}
      </button>
    </article>
  );
}
