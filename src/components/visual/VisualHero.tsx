import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { ShowcaseImage } from "../ShowcaseImage";
import { LANDING } from "../../constants/copy";
import { getCms } from "../../constants/cms";
import { HOME_HERO } from "../../data/homeLanding";
import { HERO_SLIDES } from "../../data/visualLanding";

const SLIDE_MS = 5500;
const DESKTOP_MQ = "(min-width: 900px)";

type VisualHeroProps = {
  onGetStarted: () => void;
  onExplore?: () => void;
};

export function VisualHero({ onGetStarted }: VisualHeroProps) {
  const cms = getCms();
  const [slideIndex, setSlideIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(DESKTOP_MQ).matches : false
  );

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MQ);
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (isDesktop) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const timer = window.setInterval(() => {
      setSlideIndex((i) => (i + 1) % HERO_SLIDES.length);
    }, SLIDE_MS);

    return () => window.clearInterval(timer);
  }, [isDesktop]);

  const headline = cms.heroHeadline || HOME_HERO.headline;
  const subheadline = cms.heroSubheadline || HOME_HERO.subheadline || LANDING.heroSubheadline;
  const primarySlide = HERO_SLIDES[slideIndex] ?? HERO_SLIDES[0];

  const copyBlock = (
    <div className="visual-hero__copy visual-hero__copy--split">
      <h1>{headline}</h1>
      {subheadline ? <p className="visual-hero__sub">{subheadline}</p> : null}
      <div className="visual-hero__actions">
        <button type="button" className="visual-btn visual-btn--primary" onClick={onGetStarted}>
          {cms.heroCta || HOME_HERO.primaryCta}
          <ArrowRight size={18} aria-hidden />
        </button>
      </div>
    </div>
  );

  const mobileCarousel = (
    <div className="visual-hero__mobile-shell" aria-hidden={isDesktop}>
      <div className="visual-hero__media">
        <div className="visual-hero__track" style={{ transform: `translateX(-${slideIndex * 100}%)` }}>
          {HERO_SLIDES.map((slide, index) => (
            <div key={slide.id} className="visual-hero__slide">
              <ShowcaseImage
                src={slide.src}
                alt={slide.alt}
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : undefined}
                progressive={false}
                width={1086}
                height={1448}
                objectPosition={"objectPosition" in slide ? slide.objectPosition : undefined}
              />
            </div>
          ))}
        </div>
        <div className="visual-hero__shade visual-hero__shade--minimal" />
        <div className="visual-hero__grain" />
      </div>
      <div className="visual-hero__layout visual-hero__layout--minimal">
        {copyBlock}
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
    </div>
  );

  const desktopImage = (
    <div className="visual-hero__desktop-image" aria-hidden={!isDesktop}>
      <ShowcaseImage
        src={primarySlide.src}
        alt={primarySlide.alt}
        loading="eager"
        fetchPriority="high"
        progressive={false}
        width={1086}
        height={1448}
        objectPosition={"objectPosition" in primarySlide ? primarySlide.objectPosition : undefined}
      />
    </div>
  );

  return (
    <section className="visual-hero visual-hero--premium visual-hero--split">
      <div className="visual-hero__inner">
        <div className="visual-hero__desktop-copy">{copyBlock}</div>
        {desktopImage}
      </div>
      {mobileCarousel}
    </section>
  );
}
