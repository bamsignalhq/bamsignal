import { ShieldCheck, MessageCircleOff, BadgeCheck, HeartHandshake } from "lucide-react";
import { HOME_SECTIONS, HOME_TRUST } from "../../data/homeLanding";

const ICONS = [BadgeCheck, MessageCircleOff, ShieldCheck, HeartHandshake] as const;

export function HomeTrustStrip() {
  return (
    <section className="home-section home-trust">
      <header className="home-section__head">
        <p className="home-section__eyebrow">{HOME_SECTIONS.trust.eyebrow}</p>
        <h2 className="home-section__title">{HOME_SECTIONS.trust.title}</h2>
        <p className="home-section__lede">{HOME_SECTIONS.trust.lede}</p>
      </header>

      <div className="home-trust__grid">
        {HOME_TRUST.map((item, index) => {
          const Icon = ICONS[index] ?? ShieldCheck;
          return (
            <article key={item.title} className="home-trust__card">
              <span className="home-trust__icon" aria-hidden>
                <Icon size={20} />
              </span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
