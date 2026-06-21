import { useEffect, useState } from "react";
import { AppLogo } from "../AppLogo";
import { HERO_ACTIVITIES } from "../../data/signalWorld";
import { NIGERIA_PATH } from "../../data/nigeriaMap";

type LivingSceneProps = {
  onGetStarted: () => void;
  onExplore: () => void;
};

const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  left: `${(i * 17 + 7) % 100}%`,
  top: `${(i * 23 + 11) % 100}%`,
  delay: `${(i % 8) * 0.6}s`,
  size: 3 + (i % 4)
}));

export function LivingScene({ onGetStarted, onExplore }: LivingSceneProps) {
  const [activityIndex, setActivityIndex] = useState(0);
  const [activityVisible, setActivityVisible] = useState(true);
  const [ripple, setRipple] = useState(0);

  useEffect(() => {
    let fadeTimer: number | null = null;
    const activityTimer = window.setInterval(() => {
      setActivityVisible(false);
      fadeTimer = window.setTimeout(() => {
        setActivityIndex((i) => (i + 1) % HERO_ACTIVITIES.length);
        setActivityVisible(true);
      }, 400);
    }, 3200);
    return () => {
      window.clearInterval(activityTimer);
      if (fadeTimer !== null) window.clearTimeout(fadeTimer);
    };
  }, []);

  useEffect(() => {
    const rippleTimer = window.setInterval(() => setRipple((r) => r + 1), 3500);
    return () => window.clearInterval(rippleTimer);
  }, []);

  return (
    <section className="world-scene">
      <svg className="world-scene-map" viewBox="0 0 400 480" aria-hidden>
        <path d={NIGERIA_PATH} />
      </svg>

      <div className="world-particles" aria-hidden>
        {PARTICLES.map((p) => (
          <span
            key={p.id}
            className="world-particle"
            style={{
              left: p.left,
              top: p.top,
              animationDelay: p.delay,
              width: p.size,
              height: p.size
            }}
          />
        ))}
      </div>

      <div className="world-scene-core">
        <div className="world-logo-wrap">
          {ripple > 0 && <span key={ripple} className="world-logo-ripple" />}
          <AppLogo size="lg" showText={false} className="world-logo" />
        </div>

        <p className={`world-activity ${activityVisible ? "world-activity--in" : ""}`}>
          {HERO_ACTIVITIES[activityIndex]}
        </p>

        <h1 className="world-headline">The right connection starts with a signal.</h1>

        <div className="world-cta-row">
          <button type="button" className="world-btn-primary" onClick={onGetStarted}>
            Get Started
          </button>
          <button type="button" className="world-btn-ghost" onClick={onExplore}>
            Explore Signals
          </button>
        </div>
      </div>
    </section>
  );
}
