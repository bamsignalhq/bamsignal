import { useEffect, useState } from "react";
import { RECENT_ACTIVITY } from "../data/landingProfiles";

export function ActivityFeed() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % RECENT_ACTIVITY.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, []);

  const item = RECENT_ACTIVITY[index];

  return (
    <div className="activity-feed" aria-live="polite">
      <div className="activity-feed-track" style={{ transform: `translateY(calc(-${index} * 44px))` }}>
        {RECENT_ACTIVITY.map((entry) => (
          <p key={entry} className="activity-feed-item">
            ✓ {entry}
          </p>
        ))}
      </div>
    </div>
  );
}
