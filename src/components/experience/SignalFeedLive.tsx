import { useEffect, useState } from "react";
import { SIGNAL_FEED_ITEMS } from "../../data/signalWorld";

export function SignalFeedLive() {
  const [items, setItems] = useState<string[]>(() => SIGNAL_FEED_ITEMS.slice(0, 4));

  useEffect(() => {
    let index = 4;
    const timer = window.setInterval(() => {
      const next = SIGNAL_FEED_ITEMS[index % SIGNAL_FEED_ITEMS.length];
      index += 1;
      setItems((prev) => [next, ...prev.slice(0, 3)]);
    }, 2600);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="world-feed" id="signal-feed">
      <div className="world-feed-glow" aria-hidden />
      <h2 className="world-feed-label">Live signals</h2>
      <ul className="world-feed-list">
        {items.map((item, i) => (
          <li key={`${item}-${i}`} className={`world-feed-item ${i === 0 ? "world-feed-item--new" : ""}`}>
            ✓ {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
