import { Shield, Zap } from "lucide-react";
import { BRAND } from "../constants/copy";
import { momentsForProfile } from "../constants/signalMoments";
import type { DiscoverProfile } from "../types";
import type { TrustInfo } from "../utils/trust";
import type { VerificationInfo } from "../utils/verification";
import { cardActivityBadge } from "../utils/activity";
import { isNewSignalProfile } from "../utils/launchSeed";
import { ShowcaseImage } from "./ShowcaseImage";
import { SignalMoments } from "./discover/SignalMoments";
import { SignalSentEffect } from "./discover/SignalSentEffect";
import { TrustBadge } from "./TrustBadge";
import { VerificationBadge } from "./VerificationBadge";
import { VoiceIntro } from "./VoiceIntro";
import { WhyThisProfile } from "./WhyThisProfile";

type ProfileCardProps = {
  profile: DiscoverProfile;
  compatibilityPercent?: number;
  compatibilitySubtitle?: string;
  matchReasons?: string[];
  verification?: VerificationInfo;
  trust?: TrustInfo;
  onIgnore?: () => void;
  onSendSignal?: () => void;
  onPrioritySignal?: () => void;
  onSafety?: () => void;
  onViewProfile?: () => void;
  signalBlockedReason?: string;
  showActions?: boolean;
  blurred?: boolean;
  isPremium?: boolean;
  signalSent?: boolean;
  entering?: boolean;
};

export function ProfileCard({
  profile,
  compatibilityPercent,
  compatibilitySubtitle,
  matchReasons = [],
  verification,
  trust,
  onIgnore,
  onSendSignal,
  onPrioritySignal,
  onSafety,
  onViewProfile,
  signalBlockedReason,
  showActions = true,
  blurred = false,
  isPremium = false,
  signalSent = false,
  entering = true
}: ProfileCardProps) {
  const activity = cardActivityBadge(profile.lastActiveAt);
  const moments = momentsForProfile(profile.interests, profile.id);

  return (
    <article
      className={`profile-card profile-card-v2 ${blurred ? "blurred" : ""} ${signalSent ? "profile-card-v2--sent" : ""} ${entering ? "profile-card-v2--enter" : ""}`}
    >
      <div className="profile-card-v2__photo">
        {onSafety && (
          <button type="button" className="profile-card-safety-btn" onClick={onSafety} aria-label="Safety options">
            <Shield size={18} />
          </button>
        )}
        {activity && (
          <span
            className={`profile-card-v2__activity ${activity.online ? "profile-card-v2__activity--online" : ""}`}
          >
            {activity.online && "🟢 "}
            {activity.label}
          </span>
        )}
        <button
          type="button"
          className="profile-card-photo-hit"
          onClick={onViewProfile}
          aria-label={`View ${profile.name}'s profile`}
        >
          <ShowcaseImage src={profile.photo} alt={profile.name} loading="lazy" />
          <div className="profile-card-gradient" />
          <div className="profile-card-v2__overlay">
            <div className="profile-card-v2__identity">
              <h3>{profile.name}</h3>
              <span className="profile-card-v2__age">{profile.age}</span>
            </div>
            <p className="profile-card-v2__city">{profile.city}</p>
            {profile.distanceKm != null && (
              <p className="profile-card-v2__distance">{profile.distanceKm}km away</p>
            )}
            <div className="profile-card-badges">
              {isNewSignalProfile(profile) && (
                <span className="profile-badge profile-badge--new-signal">New Signal</span>
              )}
              {verification && <VerificationBadge info={verification} />}
              {trust && <TrustBadge info={trust} />}
            </div>
            {compatibilityPercent != null && (
              <div className="profile-card-compat-wrap">
                <span className="profile-card-compat">{compatibilityPercent}% Compatibility</span>
                {compatibilitySubtitle && (
                  <span className="profile-card-compat-sub">{compatibilitySubtitle}</span>
                )}
              </div>
            )}
          </div>
        </button>
        <SignalSentEffect active={signalSent} />
      </div>

      <div className="profile-card-body profile-card-v2__body">
        <WhyThisProfile reasons={matchReasons} compact />
        <VoiceIntro url={profile.voiceIntroUrl} showBadge={Boolean(profile.voiceIntroUrl)} />
        <p className="profile-card-bio">{profile.bio}</p>
        <SignalMoments moments={moments} />
        {signalBlockedReason && (
          <p className="profile-card-signal-gate" role="status">
            {signalBlockedReason}
          </p>
        )}
        {showActions && !blurred && (
          <div className="profile-card-v2__actions">
            <button type="button" className="profile-card-v2__pass" onClick={onIgnore} aria-label={BRAND.ignore}>
              Pass
            </button>
            <button
              type="button"
              className="profile-card-v2__signal"
              onClick={onSendSignal}
              aria-label={BRAND.sendSignal}
              disabled={Boolean(signalBlockedReason) || signalSent}
            >
              <Zap size={18} fill="currentColor" />
              {BRAND.sendSignal}
            </button>
            {isPremium && onPrioritySignal ? (
              <button
                type="button"
                className="profile-card-v2__priority"
                onClick={onPrioritySignal}
                aria-label={BRAND.prioritySignal}
                disabled={signalSent}
              >
                {BRAND.prioritySignal}
              </button>
            ) : (
              <button type="button" className="profile-card-v2__priority profile-card-v2__priority--locked" disabled>
                {BRAND.prioritySignal}
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
