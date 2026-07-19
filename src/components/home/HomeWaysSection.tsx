import { ArrowRight } from "lucide-react";
import { navigateToPath } from "../../constants/routePath";
import { HOME_WAYS, HOME_WAY_CARDS } from "../../data/productLandings";

/**
 * Homepage triad: Discover, Discreet Mode, Signal Concierge™.
 * Each section is a destination — not decorative cards.
 */
export function HomeWaysSection() {
  return (
    <section className="home-ways" id="how-it-works" aria-labelledby="home-ways-title">
      <div className="home-ways__intro">
        <p className="home-ways__eyebrow">{HOME_WAYS.eyebrow}</p>
        <h2 id="home-ways-title" className="home-ways__title">
          {HOME_WAYS.title}
        </h2>
        <p className="home-ways__lede">{HOME_WAYS.lede}</p>
      </div>

      <div className="home-ways__list">
        {HOME_WAY_CARDS.map((way) => (
          <article key={way.id} className={`home-ways__item home-ways__item--${way.tone}`}>
            <div className="home-ways__copy">
              <p className="home-ways__intent">{way.intent}</p>
              <h3 className="home-ways__item-title">{way.title}</h3>
              <p className="home-ways__item-lede">{way.lede}</p>
            </div>
            <a
              className="home-ways__cta"
              href={way.href}
              onClick={(event) => {
                event.preventDefault();
                navigateToPath(way.href);
              }}
            >
              {way.cta}
              <ArrowRight size={18} aria-hidden />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
