import { Send } from "lucide-react";
import type { DiscoverProfile } from "../../types";
import { VerifiedBadge } from "../VerifiedBadge";

type SignalsMayLikeSectionProps = {
  profiles: DiscoverProfile[];
  onViewAll?: () => void;
  onOpenProfile: (profile: DiscoverProfile) => void;
  onSignal: (profile: DiscoverProfile) => void;
  signalingId?: string | null;
};

export function SignalsMayLikeSection({
  profiles,
  onViewAll,
  onOpenProfile,
  onSignal,
  signalingId
}: SignalsMayLikeSectionProps) {
  if (!profiles.length) return null;

  return (
    <section className="signals-premium-maylike" aria-label="People you may like">
      <div className="signals-premium-maylike__head">
        <h2>People you may like</h2>
        {onViewAll ? (
          <button type="button" className="signals-premium-maylike__view-all" onClick={onViewAll}>
            View all &gt;
          </button>
        ) : null}
      </div>
      <div className="signals-premium-maylike__scroll">
        {profiles.map((profile) => (
          <article key={profile.id} className="signals-premium-maylike-card">
            <button
              type="button"
              className="signals-premium-maylike-card__open"
              onClick={() => onOpenProfile(profile)}
            >
              <img src={profile.photo} alt="" loading="lazy" decoding="async" />
              <span className="signals-premium-maylike-card__online" aria-hidden />
              <div className="signals-premium-maylike-card__meta">
                <span className="signals-premium-maylike-card__name">
                  {profile.name}
                  {profile.verified ? <VerifiedBadge size="sm" label="Verified" /> : null}
                </span>
                <span>
                  {profile.age} • {profile.city}
                </span>
              </div>
            </button>
            <button
              type="button"
              className="signals-premium-maylike-card__signal"
              disabled={signalingId === profile.id}
              onClick={() => onSignal(profile)}
              aria-label={`Signal ${profile.name}`}
            >
              <Send size={14} aria-hidden />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
