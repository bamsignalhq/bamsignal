import { SeoHead } from "../../pages/seo/SeoHead";
import {
  CAREERS_CLOSING_HEADING,
  CAREERS_COMPANIES_HEADING,
  CAREERS_JOIN_BODY,
  CAREERS_JOIN_HEADING,
  CAREERS_PORTFOLIO_COMPANIES,
  CAREERS_PRIMARY_CTA,
  CAREERS_SECONDARY_CTA,
  CAREERS_SEO,
  CAREERS_TITLE,
  STANKINGS_COMPANY_NAME
} from "../../constants/careers";
import { CAREERS_BASE_PATH } from "../../constants/careersRoutes";
import { buildWebPageJsonLd } from "../../utils/seoHead";

export function CareersLandingPage() {
  return (
    <div className="careers-page careers-landing careers-landing--stankings">
      <SeoHead
        title={CAREERS_SEO.title}
        description={CAREERS_SEO.description}
        canonicalPath={CAREERS_BASE_PATH}
        keywords={[
          "BamSignal careers",
          "Stankings Legacy Ltd careers",
          "jobs Nigeria",
          "join BamSignal team",
          "Yike careers",
          "BayRight careers"
        ]}
        jsonLd={buildWebPageJsonLd({
          title: CAREERS_SEO.title,
          description: CAREERS_SEO.description,
          canonicalPath: CAREERS_BASE_PATH
        })}
      />

      <section className="careers-hero careers-hero--join cc-reveal" aria-labelledby="careers-join-title">
        <p className="careers-hero__eyebrow">{CAREERS_TITLE}</p>
        <h1 id="careers-join-title">{CAREERS_JOIN_HEADING}</h1>
        <div className="careers-hero__body">
          {CAREERS_JOIN_BODY.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="careers-hero__actions">
          <a
            className="careers-btn"
            href={CAREERS_PRIMARY_CTA.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {CAREERS_PRIMARY_CTA.label}
          </a>
          <a
            className="careers-btn careers-btn--ghost"
            href={CAREERS_SECONDARY_CTA.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {CAREERS_SECONDARY_CTA.label}
          </a>
        </div>
      </section>

      <section
        className="careers-section careers-section--companies cc-reveal"
        aria-labelledby="careers-companies-title"
      >
        <h2 id="careers-companies-title">{CAREERS_COMPANIES_HEADING}</h2>
        <p className="careers-section__lead">
          Applicants join {STANKINGS_COMPANY_NAME} and contribute across a growing technology portfolio —
          not a single-product startup.
        </p>
        <div className="careers-company-grid">
          {CAREERS_PORTFOLIO_COMPANIES.map((company) => (
            <a
              key={company.name}
              className="careers-company-card"
              href={company.href}
              {...(company.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              <h3>{company.name}</h3>
              <p>{company.tagline}</p>
            </a>
          ))}
        </div>
      </section>

      <section
        className="careers-section careers-section--closing cc-reveal"
        aria-labelledby="careers-closing-title"
      >
        <h2 id="careers-closing-title">{CAREERS_CLOSING_HEADING}</h2>
        <div className="careers-hero__actions">
          <a
            className="careers-btn"
            href={CAREERS_PRIMARY_CTA.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {CAREERS_PRIMARY_CTA.label}
          </a>
        </div>
      </section>
    </div>
  );
}
