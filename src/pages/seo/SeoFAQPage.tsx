import type { SeoHubConfig, SeoPage } from "../../content/seo";
import { Link } from "../../components/Link";
import { SeoBreadcrumbs } from "./SeoBreadcrumbs";
import { SeoHead } from "./SeoHead";
import { buildBreadcrumbJsonLd, buildFaqJsonLd, buildWebPageJsonLd } from "../../utils/seoHead";

type SeoFAQPageProps = {
  hub: SeoHubConfig;
  pages: SeoPage[];
};

export function SeoFAQPage({ hub, pages }: SeoFAQPageProps) {
  const allFaqs = pages.flatMap((page) => page.faqs);
  const jsonLd = [
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: hub.category, path: hub.basePath }
    ]),
    buildWebPageJsonLd({
      title: hub.title,
      description: hub.description,
      canonicalPath: hub.basePath
    }),
    ...(allFaqs.length ? [buildFaqJsonLd(allFaqs)] : [])
  ];

  return (
    <div className="seo-faq-page">
      <SeoHead
        title={hub.title}
        description={hub.description}
        canonicalPath={hub.basePath}
        keywords={hub.keywords}
        jsonLd={jsonLd}
      />

      <SeoBreadcrumbs items={[{ label: "Home", path: "/" }, { label: hub.category }]} />

      <header className="seo-index__hero">
        <p className="seo-index__eyebrow">{hub.category}</p>
        <h1>{hub.h1}</h1>
        <p className="seo-index__intro">{hub.intro}</p>
      </header>

      {pages.map((page) => (
        <section key={page.slug} className="seo-faq-section">
          <div className="seo-faq-section__head">
            <h2>{page.h1}</h2>
            <Link href={page.canonicalPath} className="seo-faq-section__link">
              Full page
            </Link>
          </div>
          <dl className="seo-faq-list">
            {page.faqs.map((faq) => (
              <div key={faq.question} className="seo-faq-item">
                <dt>{faq.question}</dt>
                <dd>{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
