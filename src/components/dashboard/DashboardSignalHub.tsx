import { ArrowRight, Compass } from "lucide-react";
import { useCountUp } from "../../hooks/useCountUp";
import type { DiscoverProfile } from "../../types";

type DashboardSignalHubProps = {
  profileViews: number;
  viewsToday: number;
  signalsReceived: number;
  signalsSent: number;
  streakCount: number;
  nearbyCount: number;
  nearbyProfiles: DiscoverProfile[];
  onDiscover: () => void;
  onOpenProfileViews: () => void;
  onOpenLikes: () => void;
  pulseLines: string[];
  isNewMember?: boolean;
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function DashboardSignalHub({
  profileViews,
  viewsToday,
  signalsReceived,
  signalsSent,
  streakCount,
  nearbyCount,
  nearbyProfiles,
  onDiscover,
  onOpenProfileViews,
  onOpenLikes,
  pulseLines,
  isNewMember = false
}: DashboardSignalHubProps) {
  const animatedNearby = useCountUp(nearbyCount, 600, nearbyCount > 0);
  const viewDisplay = viewsToday > 0 ? viewsToday : profileViews;
  const animatedViews = useCountUp(viewDisplay, 600, viewDisplay > 0);

  const streakLabel = streakCount >= 7 ? "7d" : streakCount > 0 ? `${streakCount}d` : "—";

  return (
    <section className="signal-hub dash-animate" aria-label="Your signal hub">
      <div className="signal-hub__metrics">
        <button type="button" className="signal-hub__metric" onClick={onOpenProfileViews}>
          <strong>{profileViews > 0 ? animatedViews : "—"}</strong>
          <span>Views</span>
        </button>
        <button type="button" className="signal-hub__metric" onClick={onOpenLikes}>
          <strong>{signalsReceived > 0 ? signalsReceived : "—"}</strong>
          <span>Likes</span>
        </button>
        <div className="signal-hub__metric signal-hub__metric--static" aria-label="Signals sent">
          <strong>{signalsSent > 0 ? signalsSent : "—"}</strong>
          <span>Sent</span>
        </div>
        <div className="signal-hub__metric signal-hub__metric--static" aria-label="Streak">
          <strong>{streakLabel}</strong>
          <span>Streak</span>
        </div>
      </div>

      <div className="signal-hub__panel">
        <div className="signal-hub__discover-copy">
          {nearbyProfiles.length > 0 ? (
            <div className="signal-hub__avatars" aria-hidden>
              {nearbyProfiles.slice(0, 5).map((profile, index) => (
                <span
                  key={profile.id}
                  className="signal-hub__avatar"
                  style={{ zIndex: 5 - index }}
                  title={profile.name}
                >
                  {initials(profile.name)}
                </span>
              ))}
            </div>
          ) : (
            <span className="signal-hub__radar" aria-hidden />
          )}
          <div>
            <p className="signal-hub__eyebrow">Discover</p>
            <p className="signal-hub__headline">
              {isNewMember
                ? "Your first connection is one signal away."
                : nearbyCount > 0
                  ? `${animatedNearby} signal${animatedNearby === 1 ? "" : "s"} in your radius`
                  : "Expanding your discovery radius"}
            </p>
          </div>
        </div>
        <button type="button" className="signal-hub__cta" onClick={onDiscover}>
          <Compass size={18} aria-hidden />
          {isNewMember ? "Start Discovering" : "Open Discover"}
          <ArrowRight size={16} className="signal-hub__cta-arrow" aria-hidden />
        </button>
      </div>

      {pulseLines.length > 0 && (
        <ul className="signal-hub__pulse">
          {pulseLines.slice(0, 3).map((line) => (
            <li key={line}>
              <span className="signal-hub__pulse-dot" aria-hidden />
              {line}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
