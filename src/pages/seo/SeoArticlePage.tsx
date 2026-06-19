import { ArrowLeft } from "lucide-react";
import { Link } from "../../components/Link";
import type { SeoHubConfig, SeoHubId, SeoPage } from "../../content/seo";
import { getSeoInternalLinks } from "../../content/seo/internalLinks";
import { SeoInternalLinks } from "./SeoInternalLinks";
import { SeoBreadcrumbs } from "./SeoBreadcrumbs";
import { SeoHead } from "./SeoHead";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildPlaceJsonLd
} from "../../utils/seoHead";

type SeoArticlePageProps = {
  hub: SeoHubConfig;
  page: SeoPage;
};

function schemaForPage(page: SeoPage, hubId: SeoHubId) {
  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: page.category, path: hubPathFromPage(page) },
    { name: page.h1, path: page.canonicalPath }
  ]);

  const schemas: Record<string, unknown>[] = [breadcrumb];

  if (page.faqs.length > 0) {
    schemas.push(buildFaqJsonLd(page.faqs));
  }

  if (page.schemaType === "Place") {
    schemas.push(buildPlaceJsonLd(page));
  } else if (hubId === "guides" || hubId === "compare" || page.schemaType === "Article") {
    schemas.push(
      buildArticleJsonLd({
        title: page.title,
        description: page.description,
        canonicalPath: page.canonicalPath,
        lastUpdated: page.lastUpdated,
        headline: page.h1
      })
    );
  } else if (page.schemaType === "FAQPage" && page.sections.length === 0) {
    schemas.push(
      buildArticleJsonLd({
        title: page.title,
        description: page.description,
        canonicalPath: page.canonicalPath,
        lastUpdated: page.lastUpdated,
        headline: page.h1
      })
    );
  }

  return schemas;
}

function hubPathFromPage(page: SeoPage) {
  const segments = page.canonicalPath.split("/").filter(Boolean);
  return segments.length > 1 ? `/${segments[0]}` : page.canonicalPath;
}

export function SeoArticlePage({ hub, page }: SeoArticlePageProps) {
  const jsonLd = schemaForPage(page, hub.id);
  const internalLinks = getSeoInternalLinks(hub.id, page.slug);

  return (
    <article className="seo-article">
      <SeoHead
        title={page.title}
        description={page.description}
        canonicalPath={page.canonicalPath}
        keywords={page.keywords}
        ogType="article"
        jsonLd={jsonLd}
      />

      <SeoBreadcrumbs
        items={[
          { label: "Home", path: "/" },
          { label: hub.category, path: hub.basePath },
          { label: page.h1 }
        ]}
      />

      <header className="seo-article__header">
        <Link href={hub.basePath} className="seo-back-link">
          <ArrowLeft size={16} aria-hidden /> Back to {hub.category}
        </Link>
        {page.city ? <span className="seo-article__eyebrow">{page.city}, Nigeria</span> : null}
        <h1>{page.h1}</h1>
        <p className="seo-article__intro">{page.intro}</p>
        <p className="seo-article__meta">Updated {page.lastUpdated}</p>
      </header>

      <div className="seo-article__body">
        {page.sections.map((section) => (
          <section key={section.heading} className="seo-article__section">
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
            ))}
          </section>
        ))}

        {page.faqs.length > 0 ? (
          <section className="seo-faq-block">
            <h2>Common questions</h2>
            <dl className="seo-faq-list">
              {page.faqs.map((faq) => (
                <div key={faq.question} className="seo-faq-item">
                  <dt>{faq.question}</dt>
                  <dd>{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        <SeoInternalLinks links={internalLinks} />
      </div>
    </article>
  );
}
