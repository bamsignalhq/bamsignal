import { X } from "lucide-react";
import { intentDisplay } from "../constants/intents";
import { momentsForProfile } from "../constants/signalMoments";
import type { DiscoverProfile } from "../types";
import type { TrustInfo } from "../utils/trust";
import type { VerificationInfo } from "../utils/verification";
import { cardActivityBadge } from "../utils/activity";
import { ActivityStatus } from "./ActivityStatus";
import { ShowcaseImage } from "./ShowcaseImage";
import { SignalMoments } from "./discover/SignalMoments";
import { TrustBadge } from "./TrustBadge";
import { VerificationBadge } from "./VerificationBadge";
import { VoiceIntro } from "./VoiceIntro";
import { WhyThisProfile } from "./WhyThisProfile";

type ProfileDetailSheetProps = {
  profile: DiscoverProfile;
  open: boolean;
  onClose: () => void;
  matchReasons: string[];
  compatibilityPercent?: number;
  compatibilitySubtitle?: string;
  verification?: VerificationInfo;
  trust?: TrustInfo;
};

export function ProfileDetailSheet({
  profile,
  open,
  onClose,
  matchReasons,
  compatibilityPercent,
  compatibilitySubtitle,
  verification,
  trust
}: ProfileDetailSheetProps) {
  if (!open) return null;

  const activity = cardActivityBadge(profile.lastActiveAt);
  const moments = momentsForProfile(profile.interests, profile.id);
  const gallery = [profile.photo, ...moments.map((m) => m.image)].slice(0, 4);

  return (
    <div className="profile-detail-sheet" role="dialog" aria-modal="true" aria-label={`${profile.name}'s profile`}>
      <button type="button" className="profile-detail-sheet__backdrop" onClick={onClose} aria-label="Close profile" />
      <article className="profile-detail-sheet__panel">
        <header className="profile-detail-sheet__hero">
          <ShowcaseImage src={profile.photo} alt={profile.name} />
          <div className="profile-detail-sheet__shade" />
          <button type="button" className="profile-detail-sheet__close icon-btn" onClick={onClose} aria-label="Close">
            <X size={22} />
          </button>
          {activity && (
            <span
              className={`profile-card-v2__activity ${activity.online ? "profile-card-v2__activity--online" : ""}`}
              style={{ top: "3.5rem", right: "1rem" }}
            >
              {activity.online && "🟢 "}
              {activity.label}
            </span>
          )}
          <div className="profile-detail-sheet__meta">
            <h2>{profile.name}</h2>
            <p>
              {profile.age} · {profile.city}
              {profile.distanceKm != null && ` · ${profile.distanceKm}km away`}
            </p>
            <div className="profile-detail-sheet__badges">
              {verification && <VerificationBadge info={verification} />}
              {trust && <TrustBadge info={trust} />}
            </div>
          </div>
        </header>

        <div className="profile-detail-sheet__body">
          {compatibilityPercent != null && (
            <div className="profile-detail-sheet__compat">
              <strong>{compatibilityPercent}% Compatibility</strong>
              {compatibilitySubtitle && <p>{compatibilitySubtitle}</p>}
            </div>
          )}

          <div className="profile-detail-sheet__section">
            <h3>Photos</h3>
            <div className="profile-detail-sheet__photos">
              {gallery.map((src, i) => (
                <ShowcaseImage key={`${src}-${i}`} src={src} alt="" />
              ))}
            </div>
          </div>

          <WhyThisProfile reasons={matchReasons} />

          <div className="profile-detail-sheet__section">
            <h3>Bio</h3>
            <p className="profile-detail-sheet__bio">{profile.bio}</p>
          </div>

          <VoiceIntro url={profile.voiceIntroUrl} />

          {profile.interests?.length ? (
            <div className="profile-detail-sheet__section">
              <h3>Interests</h3>
              <div className="intent-tags">
                {profile.interests.map((tag) => (
                  <span key={tag} className="intent-tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <SignalMoments moments={moments} />

          <div className="profile-detail-sheet__section">
            <h3>Intent</h3>
            <div className="intent-tags">
              {profile.intents.map((tag) => (
                <span key={tag} className="intent-tag">
                  {intentDisplay(tag)}
                </span>
              ))}
            </div>
          </div>

          {profile.lifestyle && (
            <div className="profile-detail-sheet__section">
              <h3>Lifestyle</h3>
              <p>{profile.lifestyle}</p>
            </div>
          )}

          <div className="profile-detail-sheet__section">
            <h3>About Me</h3>
            <p>
              Based in {profile.city}
              {profile.distanceKm != null && ` · ${profile.distanceKm}km from you`}
            </p>
            {profile.lifestyle && <p>{profile.lifestyle}</p>}
          </div>
        </div>
      </article>
    </div>
  );
}
