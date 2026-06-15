import { HOME_SECTIONS, HOME_TRUST } from "../../data/homeLanding";

export function HomeTrustStrip() {
  return (
    <section className="home-section home-trust home-trust--compact" aria-label="Safety">
      <h2 className="home-trust__heading">{HOME_SECTIONS.trust.title}</h2>
      <ul className="home-trust__list">
        {HOME_TRUST.map((item) => (
          <li key={item.title}>{item.title}</li>
        ))}
      </ul>
    </section>
  );
}
