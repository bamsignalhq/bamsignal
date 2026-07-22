import {
  SIGNAL_CONCIERGE_BENEFITS,
  SIGNAL_CONCIERGE_CONSULTANT_PROMISES,
  SIGNAL_CONCIERGE_EDITORIAL_IMAGES,
  SIGNAL_CONCIERGE_HOW_IT_WORKS,
  SIGNAL_CONCIERGE_LANDING_SUBTEXT,
  SIGNAL_CONCIERGE_PRICING_BODY,
  SIGNAL_CONCIERGE_PRICING_HEADLINE,
  SIGNAL_CONCIERGE_PRICING_NOTE
} from "../../constants/signalConcierge";
import { SignalConciergeFAQ } from "../signalConcierge/SignalConciergeFAQ";
import { CONCIERGE_ROUTES } from "../../constants/conciergeRoutes";
import { navigateToPath } from "../../constants/routes";

/**
 * Premium Concierge landing — dedicated IA, not Discover signup marketing.
 */
export function ConciergeLandingPage() {
  return (
    <div className="sc-landing sc-landing--advisory concierge-landing">
      <section className="sc-advisory-hero" aria-labelledby="concierge-hero-title">
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
          <p className="sc-advisory-hero__tag">Private relationship advisory · By application</p>
          <h1 id="concierge-hero-title" className="sc-advisory-hero__brand">
            Signal Concierge™
          </h1>
          <p className="sc-advisory-hero__lede">{SIGNAL_CONCIERGE_LANDING_SUBTEXT}</p>
          <div className="sc-advisory-hero__actions">
            <button
              type="button"
              className="signal-concierge-btn signal-concierge-btn--primary"
              onClick={() => navigateToPath(CONCIERGE_ROUTES.signup)}
            >
              Become a Concierge
            </button>
            <button
              type="button"
              className="signal-concierge-btn signal-concierge-btn--ghost"
              onClick={() => navigateToPath(CONCIERGE_ROUTES.login)}
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      <section className="sc-section" id="how" aria-labelledby="concierge-how-title">
        <p className="sc-section__eyebrow">How Concierge works</p>
        <h2 id="concierge-how-title" className="sc-section__title">
          A considered path from application to introduction
        </h2>
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
      </section>

      <section className="sc-section" id="who" aria-labelledby="concierge-who-title">
        <p className="sc-section__eyebrow">Who it&apos;s for</p>
        <h2 id="concierge-who-title" className="sc-section__title">
          Discerning clients who value discretion
        </h2>
        <p className="sc-section__lead">
          Professionals, diaspora families, and intentional singles who prefer consultant-led
          introductions over public browsing.
        </p>
      </section>

      <section className="sc-section" id="benefits" aria-labelledby="concierge-benefits-title">
        <p className="sc-section__eyebrow">Benefits</p>
        <h2 id="concierge-benefits-title" className="sc-section__title">
          What Concierge clients receive
        </h2>
        <ul className="sc-benefit-grid">
          {SIGNAL_CONCIERGE_BENEFITS.map((item) => (
            <li key={item} className="sc-benefit-card signal-concierge-glass">
              <p className="sc-benefit-card__body">{item}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="sc-section" id="privacy" aria-labelledby="concierge-privacy-title">
        <p className="sc-section__eyebrow">Privacy &amp; safety</p>
        <h2 id="concierge-privacy-title" className="sc-section__title">
          Private by design
        </h2>
        <ul className="sc-promise-list">
          {SIGNAL_CONCIERGE_CONSULTANT_PROMISES.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <button
          type="button"
          className="signal-concierge-header__link"
          onClick={() => navigateToPath(CONCIERGE_ROUTES.privacy)}
        >
          Read Concierge privacy details
        </button>
      </section>

      <section className="sc-section" id="stories" aria-labelledby="concierge-stories-title">
        <p className="sc-section__eyebrow">Success stories</p>
        <h2 id="concierge-stories-title" className="sc-section__title">
          Outcomes worth waiting for
        </h2>
        <p className="sc-section__lead">
          Client stories appear here with consent. Placeholder — real testimonials publish after
          approval.
        </p>
        <div className="concierge-story-placeholder signal-concierge-glass" role="status">
          Stories coming soon
        </div>
      </section>

      <section className="sc-section" id="pricing" aria-labelledby="concierge-pricing-title">
        <p className="sc-section__eyebrow">{SIGNAL_CONCIERGE_PRICING_HEADLINE}</p>
        <h2 id="concierge-pricing-title" className="sc-section__title">
          Tailored engagement
        </h2>
        <p className="sc-section__lead">{SIGNAL_CONCIERGE_PRICING_BODY}</p>
        <p className="sc-section__note">{SIGNAL_CONCIERGE_PRICING_NOTE}</p>
      </section>

      <section className="sc-section" id="faq" aria-labelledby="concierge-faq-title">
        <h2 id="concierge-faq-title" className="sc-section__title">
          FAQs
        </h2>
        <SignalConciergeFAQ />
      </section>

      <section className="sc-section sc-section--cta" aria-label="Get started">
        <h2 className="sc-section__title">Ready for a private consultation?</h2>
        <div className="sc-advisory-hero__actions">
          <button
            type="button"
            className="signal-concierge-btn signal-concierge-btn--primary"
            onClick={() => navigateToPath(CONCIERGE_ROUTES.signup)}
          >
            Become a Concierge
          </button>
          <button
            type="button"
            className="signal-concierge-btn signal-concierge-btn--ghost"
            onClick={() => navigateToPath(CONCIERGE_ROUTES.login)}
          >
            Sign In
          </button>
        </div>
      </section>
    </div>
  );
}
