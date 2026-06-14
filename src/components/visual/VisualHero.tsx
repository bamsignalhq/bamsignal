import { useEffect, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { ShowcaseImage } from "../ShowcaseImage";
import { getCms } from "../../constants/cms";
import { HOME_HERO } from "../../data/homeLanding";
import { HERO_SLIDES } from "../../data/visualLanding";

const SLIDE_MS = 5500;

type VisualHeroProps = {
  onGetStarted: () => void;
};

export function VisualHero({ onGetStarted }: VisualHeroProps) {
  const cms = getCms();
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const timer = window.setInterval(() => {
      setSlideIndex((i) => (i + 1) % HERO_SLIDES.length);
    }, SLIDE_MS);

    return () => window.clearInterval(timer);
  }, []);

  const scrollToHow = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const headline = cms.heroHeadline || HOME_HERO.headline;
  const subheadline = cms.heroSubheadline || HOME_HERO.subheadline;

  return (
    <section className="visual-hero visual-hero--premium">
      <div className="visual-hero__media" aria-hidden>
        <div className="visual-hero__track" style={{ transform: `translateX(-${slideIndex * 100}%)` }}>
          {HERO_SLIDES.map((slide, index) => (
            <div key={slide.id} className="visual-hero__slide">
              <ShowcaseImage src={slide.src} alt={slide.alt} loading={index === 0 ? "eager" : "lazy"} />
            </div>
          ))}
        </div>
        <div className="visual-hero__shade" />
        <div className="visual-hero__grain" />
      </div>

      <div className="visual-hero__layout">
        <div className="visual-hero__copy">
          <span className="visual-hero__badge">{HOME_HERO.badge}</span>
          <h1>{headline}</h1>
          {subheadline ? <p>{subheadline}</p> : null}
          <div className="visual-hero__actions">
            <button type="button" className="visual-btn visual-btn--primary" onClick={onGetStarted}>
              {cms.heroCta || HOME_HERO.primaryCta}
              <ArrowRight size={18} aria-hidden />
            </button>
            <button type="button" className="visual-btn visual-btn--ghost" onClick={scrollToHow}>
              {HOME_HERO.secondaryCta}
              <ChevronDown size={18} aria-hidden />
            </button>
          </div>
          <ul className="visual-hero__chips">
            <li>Verified profiles</li>
            <li>Safer chats</li>
            <li>Lagos · Abuja · PH+</li>
          </ul>
        </div>

        <div className="visual-hero__dots" aria-label="Hero slides">
          {HERO_SLIDES.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              className={`visual-hero__dot${index === slideIndex ? " visual-hero__dot--active" : ""}`}
              aria-label={`Show slide ${index + 1} of ${HERO_SLIDES.length}`}
              aria-current={index === slideIndex ? "true" : undefined}
              onClick={() => setSlideIndex(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
