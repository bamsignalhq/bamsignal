import { Camera } from "lucide-react";
import { Zap } from "lucide-react";
import { BRAND } from "../../constants/copy";
import type { DiscoverProfile } from "../../types";
import type { VerificationInfo } from "../../utils/verification";
import { cardActivityBadge } from "../../utils/activity";
import { canShowActivityStatus } from "../../utils/activityPrivacy";
import { ShowcaseImage } from "../ShowcaseImage";
import { VerificationBadge } from "../VerificationBadge";

type HomeFeedCardProps = {
  profile: DiscoverProfile;
  verification?: VerificationInfo;
  signaling?: boolean;
  onOpen: () => void;
  onSignal: () => void;
};

export function HomeFeedCard({ profile, verification, signaling, onOpen, onSignal }: HomeFeedCardProps) {
  const photoCount = (profile.photos?.length ? profile.photos : [profile.photo]).filter(Boolean).length;
  const activity =
    canShowActivityStatus(profile) ? cardActivityBadge(profile.lastActiveAt) : null;
  const isPremium = Boolean(profile.premium);
  const premiumVerified = verification?.tier === 3;

  return (
    <article
      className={`home-feed-card ${isPremium ? "home-feed-card--premium" : ""} ${premiumVerified ? "home-feed-card--premium-verified" : ""}`}
    >
      <button type="button" className="home-feed-card__main" onClick={onOpen} aria-label={`View ${profile.name}`}>
        <div className="home-feed-card__photo-wrap">
          <ShowcaseImage src={profile.photo} alt="" className="home-feed-card__photo" loading="lazy" />
          {activity ? (
            <span
              className={`home-feed-card__activity ${activity.online ? "home-feed-card__activity--live" : ""}`}
              title={activity.label}
            >
              <span className="home-feed-card__activity-dot" aria-hidden />
            </span>
          ) : null}
          {photoCount > 1 ? (
            <span className="home-feed-card__photos" aria-label={`${photoCount} photos`}>
              <Camera size={11} aria-hidden />
              {photoCount}
            </span>
          ) : null}
        </div>
        <div className="home-feed-card__body">
          <h3 className="home-feed-card__name">
            {profile.name}
            <span>, {profile.age}</span>
          </h3>
          <p className="home-feed-card__city">{profile.city}</p>
          {verification?.tier ? (
            <div className="home-feed-card__badge">
              <VerificationBadge info={verification} />
            </div>
          ) : null}
        </div>
      </button>
      <button
        type="button"
        className="home-feed-card__signal"
        disabled={signaling}
        onClick={(e) => {
          e.stopPropagation();
          onSignal();
        }}
      >
        <Zap size={14} fill="currentColor" aria-hidden />
        {BRAND.sendSignal}
      </button>
    </article>
  );
}
