import { useEffect, useState } from "react";
import { getGrowthStats } from "../../constants/growthStats";
import { HOME_CITY_MARQUEE } from "../../data/homeLanding";

export function HomePulseBar() {
  const stats = getGrowthStats();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTick((value) => (value + 1) % HOME_CITY_MARQUEE.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="home-pulse" aria-label="BamSignal community activity">
      <div className="home-pulse__inner">
        <div className="home-pulse__stats">
          {stats.map((item) => (
            <div key={item.label} className="home-pulse__stat">
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
        <div className="home-pulse__live" aria-live="polite">
          <span className="home-pulse__dot" aria-hidden />
          <span>{HOME_CITY_MARQUEE[tick]}</span>
        </div>
      </div>
    </section>
  );
}
