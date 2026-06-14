import { useEffect, useState } from "react";
import { LIVE_ACTIVITY_MESSAGES } from "../data/landingProfiles";

export function LiveActivityPill() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % LIVE_ACTIVITY_MESSAGES.length);
        setVisible(true);
      }, 280);
    }, 4500);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <p className={`landing-live-pill ${visible ? "landing-live-pill--visible" : ""}`}>
      {LIVE_ACTIVITY_MESSAGES[index]}
    </p>
  );
}
