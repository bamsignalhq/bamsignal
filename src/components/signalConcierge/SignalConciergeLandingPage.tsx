import {
  SIGNAL_CONCIERGE_BENEFITS,
  SIGNAL_CONCIERGE_CONSULTANT_PROMISES,
  SIGNAL_CONCIERGE_CTA_PRIMARY,
  SIGNAL_CONCIERGE_CTA_SECONDARY,
  SIGNAL_CONCIERGE_EDITORIAL_IMAGES,
  SIGNAL_CONCIERGE_EXPECTED_TIMELINES,
  SIGNAL_CONCIERGE_HERO_TAG,
  SIGNAL_CONCIERGE_HOW_IT_WORKS,
  SIGNAL_CONCIERGE_LANDING_HEADLINE,
  SIGNAL_CONCIERGE_LANDING_SUBTEXT,
  SIGNAL_CONCIERGE_PRICING_BODY,
  SIGNAL_CONCIERGE_PRICING_HEADLINE,
  SIGNAL_CONCIERGE_PRICING_NOTE
} from "../../constants/signalConcierge";
import { SignalConciergeFAQ } from "./SignalConciergeFAQ";

type SignalConciergeLandingPageProps = {
  onApply: () => void;
  onSignIn: () => void;
  onLearnMore?: () => void;
};

export function SignalConciergeLandingPage({
  onApply,
  onSignIn,
  onLearnMore
}: SignalConciergeLandingPageProps) {
  return (
    <div className="sc-landing sc-landing--advisory">
      <section className="sc-advisory-hero" aria-labelledby="sc-hero-title">
        <div className="sc-advisory-hero__media" aria-hidden>
          <img
            src={SIGNAL_CONCIERGE_EDITORIAL_IMAGES.hero}
            alt=""
            className="sc-advisory-hero__img"
            width={1600}
            height={900}
          />
          <div className="sc-advisory-hero__veil" />
        </div>
        <div className="sc-advisory-hero__content">
          <p className="sc-advisory-hero__tag">{SIGNAL_CONCIERGE_HERO_TAG}</p>
          <h1 id="sc-hero-title" className="sc-advisory-hero__brand">
            {SIGNAL_CONCIERGE_LANDING_HEADLINE}
          </h1>
          <p className="sc-advisory-hero__lede">{SIGNAL_CONCIERGE_LANDING_SUBTEXT}</p>
          <div className="sc-advisory-hero__actions">
            <button type="button" className="signal-concierge-btn signal-concierge-btn--primary" onClick={onApply}>
              {SIGNAL_CONCIERGE_CTA_PRIMARY}
            </button>
            <button type="button" className="signal-concierge-btn signal-concierge-btn--ghost" onClick={onSignIn}>
              {SIGNAL_CONCIERGE_CTA_SECONDARY}
            </button>
          </div>
        </div>
      </section>

      <section className="sc-section sc-section--split" aria-labelledby="sc-how-title">
        <div className="sc-section__copy">
          <p className="sc-section__eyebrow">How it works</p>
          <h2 id="sc-how-title" className="sc-section__title">
            A considered path from application to introduction
          </h2>
          <p className="sc-section__lead">
            Signal Concierge™ is not browsing. It is a private, consultant-led service for intentional relationships.
          </p>
          <ol className="sc-how-list">
            {SIGNAL_CONCIERGE_HOW_IT_WORKS.map((step) => (
              <li key={step.id} className="sc-how-list__item">
                <span className="sc-how-list__step" aria-hidden>
                  {step.step}
                </span>
                <div>
                  <p className="sc-how-list__title">{step.title}</p>
                  <p className="sc-how-list__detail">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
          {onLearnMore ? (
            <button type="button" className="signal-concierge-btn signal-concierge-btn--ghost" onClick={onLearnMore}>
              Read the process
            </button>
          ) : null}
        </div>
        <figure className="sc-section__figure">
          <img
            src={SIGNAL_CONCIERGE_EDITORIAL_IMAGES.dinner}
            alt="Elegant Lagos rooftop dinner setting"
            width={900}
            height={1100}
            loading="lazy"
          />
        </figure>
      </section>

      <section className="sc-section sc-section--band" aria-labelledby="sc-benefits-title">
        <p className="sc-section__eyebrow">Benefits</p>
        <h2 id="sc-benefits-title" className="sc-section__title sc-section__title--center">
          What you receive
        </h2>
        <ul className="sc-promise-grid">
          {SIGNAL_CONCIERGE_BENEFITS.map((item) => (
            <li key={item} className="sc-promise-grid__item signal-concierge-glass">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="sc-section" aria-labelledby="sc-timelines-title">
        <p className="sc-section__eyebrow">Expected timelines</p>
        <h2 id="sc-timelines-title" className="sc-section__title sc-section__title--center">
          A paced, considered journey
        </h2>
        <p className="sc-section__lead sc-section__lead--center">
          Timelines are guidance, not guarantees — your consultant keeps you informed at every milestone.
        </p>
        <ol className="sc-how-list sc-how-list--timelines">
          {SIGNAL_CONCIERGE_EXPECTED_TIMELINES.map((item, index) => (
            <li key={item.id} className="sc-how-list__item">
              <span className="sc-how-list__step" aria-hidden>
                {index + 1}
              </span>
              <div>
                <p className="sc-how-list__title">{item.title}</p>
                <p className="sc-how-list__detail">{item.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="sc-section sc-section--band" aria-labelledby="sc-consultant-title">
        <p className="sc-section__eyebrow">Dedicated consultant</p>
        <h2 id="sc-consultant-title" className="sc-section__title sc-section__title--center">
          One steward. Complete discretion.
        </h2>
        <p className="sc-section__lead sc-section__lead--center">
          Every client is paired with a relationship consultant who understands your values, pace, and privacy requirements.
        </p>
        <ul className="sc-promise-grid">
          {SIGNAL_CONCIERGE_CONSULTANT_PROMISES.map((item) => (
            <li key={item} className="sc-promise-grid__item signal-concierge-glass">
              {item}
            </li>
          ))}
        </ul>
        <div className="sc-photo-strip" aria-hidden>
          <img src={SIGNAL_CONCIERGE_EDITORIAL_IMAGES.conversation} alt="" loading="lazy" />
          <img src={SIGNAL_CONCIERGE_EDITORIAL_IMAGES.lounge} alt="" loading="lazy" />
          <img src={SIGNAL_CONCIERGE_EDITORIAL_IMAGES.professionals} alt="" loading="lazy" />
        </div>
      </section>

      <section className="sc-section sc-section--split sc-section--split-reverse" aria-labelledby="sc-privacy-title">
        <figure className="sc-section__figure">
          <img
            src={SIGNAL_CONCIERGE_EDITORIAL_IMAGES.lifestyle}
            alt="Private conversation in a refined setting"
            width={900}
            height={1100}
            loading="lazy"
          />
        </figure>
        <div className="sc-section__copy">
          <p className="sc-section__eyebrow">Privacy first</p>
          <h2 id="sc-privacy-title" className="sc-section__title">
            Confidential by design
          </h2>
          <p className="sc-section__lead">
            Clients are never displayed on Discover. Introductions happen only with consent. Your presence remains private until you choose otherwise.
          </p>
          <p className="sc-section__eyebrow">Tailored introductions</p>
          <p className="sc-section__lead">
            Quality over quantity. Each introduction is curated by your consultant — never swiped, never public.
          </p>
        </div>
      </section>

      <section className="sc-section sc-section--pricing" aria-labelledby="sc-pricing-title">
        <p className="sc-section__eyebrow">{SIGNAL_CONCIERGE_PRICING_HEADLINE}</p>
        <h2 id="sc-pricing-title" className="sc-section__title sc-section__title--center">
          Pricing is tailored to your requirements
        </h2>
        <p className="sc-section__lead sc-section__lead--center">{SIGNAL_CONCIERGE_PRICING_BODY}</p>
        <p className="sc-section__note sc-section__note--center">{SIGNAL_CONCIERGE_PRICING_NOTE}</p>
        <div className="sc-advisory-hero__actions sc-advisory-hero__actions--center">
          <button type="button" className="signal-concierge-btn signal-concierge-btn--primary" onClick={onApply}>
            {SIGNAL_CONCIERGE_CTA_PRIMARY}
          </button>
        </div>
      </section>

      <section className="sc-section" aria-labelledby="sc-success-title">
        <p className="sc-section__eyebrow">Success journey</p>
        <h2 id="sc-success-title" className="sc-section__title sc-section__title--center">
          Built for lasting outcomes
        </h2>
        <p className="sc-section__lead sc-section__lead--center">
          From first consultation to introduction and beyond, progress is tracked privately with your consultant — never as a public profile metric.
        </p>
        <blockquote className="sc-testimonial signal-concierge-glass">
          <p>
            “Placeholder — client testimonials appear here with consent. Stories are shared only when members choose to be featured.”
          </p>
          <footer>— Signal Concierge™ client (illustrative)</footer>
        </blockquote>
      </section>

      <SignalConciergeFAQ />

      <section className="sc-section sc-section--cta-final" aria-labelledby="sc-final-cta">
        <h2 id="sc-final-cta" className="sc-section__title sc-section__title--center">
          Begin a private conversation
        </h2>
        <div className="sc-advisory-hero__actions sc-advisory-hero__actions--center">
          <button type="button" className="signal-concierge-btn signal-concierge-btn--primary" onClick={onApply}>
            {SIGNAL_CONCIERGE_CTA_PRIMARY}
          </button>
          <button type="button" className="signal-concierge-btn signal-concierge-btn--ghost" onClick={onSignIn}>
            {SIGNAL_CONCIERGE_CTA_SECONDARY}
          </button>
        </div>
      </section>
    </div>
  );
}
