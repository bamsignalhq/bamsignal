import { HOME_HERO_TRUST } from "../../data/homeLanding";

export function HomeHeroTrustStrip() {
  if (!HOME_HERO_TRUST.length) return null;
  return (
    <section className="home-hero-trust" aria-label="BamSignal trust highlights">
      <ul className="home-hero-trust__row">
        {HOME_HERO_TRUST.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
