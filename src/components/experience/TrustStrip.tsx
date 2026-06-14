import { TRUST_PILLARS } from "../../data/signalWorld";

export function TrustStrip() {
  return (
    <section className="world-trust">
      <ul className="world-trust-list">
        {TRUST_PILLARS.map((item) => (
          <li key={item}>✓ {item}</li>
        ))}
      </ul>
    </section>
  );
}
