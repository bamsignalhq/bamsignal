import { Heart } from "lucide-react";
import type { LikeEntry } from "../../types";
import { VerifiedBadge } from "../VerifiedBadge";

type IncomingSignalCardProps = {
  entry: LikeEntry;
  timeLabel: string;
  locked?: boolean;
  onAccept: () => void;
  onViewProfile: () => void;
};

export function IncomingSignalCard({
  entry,
  timeLabel,
  locked = false,
  onAccept,
  onViewProfile
}: IncomingSignalCardProps) {
  const displayName = locked ? "Someone nearby" : entry.name;
  const location = entry.state ? `${entry.city}, Nigeria` : `${entry.city}, Nigeria`;
  const distance =
    entry.distanceKm != null
      ? `${entry.distanceKm % 1 === 0 ? entry.distanceKm : entry.distanceKm.toFixed(1)} km away`
      : null;
  const meta = [entry.age, location, distance].filter(Boolean).join(" • ");
  const message =
    entry.message ||
    (locked ? "Someone sent you a signal. Upgrade to read their message." : "Sent you a signal.");

  return (
    <article className="signals-premium-card">
      <div className="signals-premium-card__main">
        <div className="signals-premium-card__avatar">
          <img
            src={entry.photo}
            alt=""
            className={locked ? "blurred-photo" : ""}
            loading="lazy"
            decoding="async"
          />
          {!locked ? <span className="signals-premium-card__online" aria-hidden /> : null}
        </div>

        <div className="signals-premium-card__body">
          <div className="signals-premium-card__title-row">
            <div className="signals-premium-card__identity">
              <strong>{displayName}</strong>
              {!locked && entry.verified ? <VerifiedBadge size="sm" label="Verified" /> : null}
            </div>
            <time className="signals-premium-card__time">{timeLabel}</time>
          </div>
          {!locked ? <p className="signals-premium-card__meta">{meta}</p> : null}
          <p className={`signals-premium-card__message${locked ? " signals-premium-card__message--locked" : ""}`}>
            {message}
          </p>
        </div>
      </div>

      <div className="signals-premium-card__actions">
        <button type="button" className="signals-premium-card__accept" onClick={onAccept}>
          <Heart size={16} fill="currentColor" aria-hidden />
          Accept
        </button>
        <button type="button" className="signals-premium-card__view" onClick={onViewProfile}>
          View profile
        </button>
      </div>
    </article>
  );
}
