import type { SeoHubConfig, SeoPage } from "../../content/seo";
import { Link } from "../../components/Link";
import { SeoBreadcrumbs } from "./SeoBreadcrumbs";
import { SeoHead } from "./SeoHead";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "../../utils/seoHead";

type SeoIndexPageProps = {
  hub: SeoHubConfig;
  pages: SeoPage[];
};

export function SeoIndexPage({ hub, pages }: SeoIndexPageProps) {
  const sortedPages = [...pages].sort((a, b) => a.h1.localeCompare(b.h1));
  const jsonLd = [
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: hub.category, path: hub.basePath }
    ]),
    buildWebPageJsonLd({
      title: hub.title,
      description: hub.description,
      canonicalPath: hub.basePath
    })
  ];

  return (
    <div className="seo-index">
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

      <section className="seo-index__grid-section">
        <div className="seo-index__grid-head">
          <h2>Articles</h2>
          <span>{sortedPages.length} guide{sortedPages.length === 1 ? "" : "s"}</span>
        </div>
        <div className="seo-card-grid">
          {sortedPages.map((page) => (
            <article key={page.slug} className="seo-card">
              <Link href={page.canonicalPath} className="seo-card__link">
                <h3>{page.h1}</h3>
                <p>{page.description}</p>
                <span className="seo-card__meta">Read guide</span>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
