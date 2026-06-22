import {
  Heart,
  MapPin,
  Scale,
  Shield,
  ShieldCheck,
  Users,
  UserX
} from "lucide-react";
import type { LegalPath } from "../constants/footer";
import { Link } from "../components/Link";
import { ShowcaseImage } from "../components/ShowcaseImage";
import { GrowthStatsStrip } from "../components/GrowthStatsStrip";
import { AUTH_SIGNUP_PATH } from "../constants/routes";
import { LEGAL_PAGES } from "../data/legalPages";
import type { StatHighlight } from "../constants/growthStats";

type LegalPageProps = {
  path: LegalPath;
};

const PAGE_ICONS: Record<LegalPath, typeof Heart> = {
  "/about": Heart,
  "/safety-policy": Shield,
  "/privacy": ShieldCheck,
  "/terms": Scale,
  "/delete-account": UserX
};

function HighlightCell({
  item,
  row
}: {
  item: StatHighlight;
  row: boolean;
}) {
  const className = `info-highlight${row ? " info-highlight--row" : ""}${item.href ? " info-highlight--link" : ""}`;
  const inner = (
    <>
      <span className="info-highlight__value">{item.value}</span>
      <span className="info-highlight__label">{item.label}</span>
    </>
  );

  if (item.href) {
    return (
      <a href={item.href} className={className} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }

  return <div className={className}>{inner}</div>;
}

export function LegalPage({ path }: LegalPageProps) {
  const page = LEGAL_PAGES[path];
  const Icon = PAGE_ICONS[path];
  const isAbout = path === "/about";
  const isPrivacy = path === "/privacy";
  const isTerms = path === "/terms";
  const useRowLayout = isAbout || isPrivacy || isTerms;
  const highlights = isAbout ? null : page.highlights;

  return (
    <div
      className={`info-page${isAbout ? " info-page--about" : ""}${isPrivacy ? " info-page--privacy" : ""}${isTerms ? " info-page--terms" : ""}`}
    >
      <header className="info-hero">
        <ShowcaseImage src={page.heroImage} alt={page.heroAlt} loading="eager" className="info-hero__image" />
        <div className="info-hero__shade" />
        <div className="info-hero__copy">
          <span className="info-hero__eyebrow">
            <Icon size={14} aria-hidden />
            {page.eyebrow}
          </span>
          <h1>{page.title}</h1>
          <p>{page.lede}</p>
        </div>
      </header>

      {isAbout ? (
        <GrowthStatsStrip variant="info" eyebrow="" />
      ) : path === "/safety-policy" ? (
        <div className="safety-pillars">
          {page.highlights.map((item) => (
            <article key={item.label} className="safety-pillar">
              <h2>{item.value}</h2>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className={`info-highlights${useRowLayout ? " info-highlights--row" : ""}`}>
          {highlights?.map((item) => (
            <HighlightCell key={item.label} item={item} row={useRowLayout} />
          ))}
        </div>
      )}

      {page.gallery && page.gallery.length > 0 && (
        <div className="info-gallery" aria-hidden>
          {page.gallery.map((shot) => (
            <div key={shot.src} className="info-gallery__item">
              <ShowcaseImage src={shot.src} alt={shot.alt} loading="lazy" />
            </div>
          ))}
        </div>
      )}

      <div className="info-sections">
        {page.sections.map((section) => (
          <section
            key={section.heading}
            className={`info-section${section.image ? " info-section--split" : ""}`}
          >
            <div className="info-section__copy">
              <h2>{section.heading}</h2>
              <p>{section.body}</p>
              {section.bullets && (
                <ul className="info-list">
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
            {section.image && (
              <figure className="info-section__figure">
                <ShowcaseImage src={section.image.src} alt={section.image.alt} loading="lazy" />
              </figure>
            )}
          </section>
        ))}
      </div>

      <footer className="info-footer-cta">
          <div className="info-footer-cta__icon">
            {path === "/about" ? <Users size={22} aria-hidden /> : <MapPin size={22} aria-hidden />}
          </div>
          <div>
            <h2>{path === "/about" ? "Ready to send your first signal?" : "Questions or concerns?"}</h2>
            <p>
              {path === "/about"
                ? "Join thousands of verified Nigerians discovering real connections nearby."
                : "Our support team is happy to help with account, safety, or billing questions."}
            </p>
          </div>
          <Link className="info-footer-cta__btn" href={path === "/about" ? AUTH_SIGNUP_PATH : "/contact"}>
            {path === "/about" ? "Create free profile" : "Contact support"}
          </Link>
        </footer>
    </div>
  );
}
