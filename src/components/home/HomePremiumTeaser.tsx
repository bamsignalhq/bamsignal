import { Sparkles } from "lucide-react";
import { MOMENT_SETS } from "../../constants/showcase";
import { HOME_SECTIONS } from "../../data/homeLanding";
import { ShowcaseImage } from "../ShowcaseImage";

type HomePremiumTeaserProps = {
  onUnlock: () => void;
};

export function HomePremiumTeaser({ onUnlock }: HomePremiumTeaserProps) {
  const { premium } = HOME_SECTIONS;

  return (
    <section className="home-section home-premium-teaser">
      <div className="home-premium-teaser__card">
        <div className="home-premium-teaser__media">
          <ShowcaseImage src={MOMENT_SETS.lagosRooftop[1]} alt="Premium BamSignal experience" loading="lazy" />
          <div className="home-premium-teaser__media-shade" />
        </div>
        <div className="home-premium-teaser__body">
          <p className="home-section__eyebrow">{premium.eyebrow}</p>
          <h2 className="home-section__title">{premium.title}</h2>
          <p className="home-section__lede">{premium.lede}</p>
          <ul className="home-premium-teaser__perks">
            {premium.perks.map((perk) => (
              <li key={perk}>
                <Sparkles size={14} aria-hidden />
                {perk}
              </li>
            ))}
          </ul>
          <button type="button" className="visual-btn visual-btn--primary" onClick={onUnlock}>
            {premium.cta}
          </button>
        </div>
      </div>
    </section>
  );
}
