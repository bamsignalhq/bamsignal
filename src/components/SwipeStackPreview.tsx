import { useState } from "react";
import { Heart, MapPin, X, Zap } from "lucide-react";
import { LANDING_PREVIEW_PROFILES, type LandingPreviewProfile } from "../data/landingProfiles";
import { TrustedMemberBadge } from "./trusted/TrustedMemberBadge";
import { isTrustedMember } from "../utils/trustedMember";

type SwipeStackPreviewProps = {
  onGuestAction: () => void;
  compact?: boolean;
};

export function SwipeStackPreview({ onGuestAction, compact }: SwipeStackPreviewProps) {
  const [index, setIndex] = useState(0);
  const [anim, setAnim] = useState<"pass" | "like" | "signal" | null>(null);

  const profile = LANDING_PREVIEW_PROFILES[index % LANDING_PREVIEW_PROFILES.length];
  const behind = LANDING_PREVIEW_PROFILES[(index + 1) % LANDING_PREVIEW_PROFILES.length];

  const act = (action: "pass" | "like" | "signal") => {
    setAnim(action);
    window.setTimeout(() => {
      setAnim(null);
      setIndex((i) => i + 1);
      if (action !== "pass") onGuestAction();
    }, 320);
  };

  return (
    <div className={`swipe-stack ${compact ? "swipe-stack--compact" : ""}`}>
      <div className="swipe-stack-stage">
        <PreviewCard profile={behind} stacked />
        <PreviewCard
          profile={profile}
          active
          anim={anim}
          onPass={() => act("pass")}
          onLike={() => act("like")}
          onSignal={() => act("signal")}
        />
      </div>
    </div>
  );
}

function PreviewCard({
  profile,
  stacked,
  active,
  anim,
  onPass,
  onLike,
  onSignal
}: {
  profile: LandingPreviewProfile;
  stacked?: boolean;
  active?: boolean;
  anim?: "pass" | "like" | "signal" | null;
  onPass?: () => void;
  onLike?: () => void;
  onSignal?: () => void;
}) {
  return (
    <article
      className={`swipe-card ${stacked ? "swipe-card--stacked" : ""} ${active ? "swipe-card--active" : ""} ${anim ? `swipe-card--${anim}` : ""}`}
    >
      <div className="swipe-card-photo">
        <img src={profile.photo} alt="" />
        <div className="swipe-card-shade" />
        {profile.online && <span className="swipe-card-online">Online</span>}
        <div className="swipe-card-meta">
          <h3>
            {profile.name}
            {isTrustedMember(profile) ? <TrustedMemberBadge size="sm" /> : null}
          </h3>
          <p className="swipe-card-age-city">
            {profile.age} · {profile.city}
          </p>
          <p className="swipe-card-distance">
            <MapPin size={12} /> {profile.distance}
          </p>
          <p className="swipe-card-active">{profile.lastActive}</p>
        </div>
      </div>
      {active && (
        <>
          <div className="swipe-card-tags">
            {profile.interests.slice(0, 3).map((tag) => (
              <span key={tag} className="intent-tag">
                {tag}
              </span>
            ))}
          </div>
          <div className="swipe-card-actions swipe-card-actions--glass">
            <button type="button" className="swipe-glass-btn swipe-glass-btn--pass" onClick={onPass}>
              <X size={22} />
              <span>Pass</span>
            </button>
            <button type="button" className="swipe-glass-btn swipe-glass-btn--like" onClick={onLike}>
              <Heart size={22} />
              <span>Like</span>
            </button>
            <button type="button" className="swipe-glass-btn swipe-glass-btn--signal" onClick={onSignal}>
              <Zap size={22} />
              <span>BamSignal</span>
            </button>
          </div>
        </>
      )}
    </article>
  );
}
