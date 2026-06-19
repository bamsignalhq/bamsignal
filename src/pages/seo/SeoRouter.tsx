import { getHubPages, getSeoHub, getSeoPage } from "../../content/seo";
import type { SeoRoute } from "../../constants/seoRoutes";
import { SeoArticlePage } from "./SeoArticlePage";
import { SeoCityPage } from "./SeoCityPage";
import { SeoFAQPage } from "./SeoFAQPage";
import { SeoIndexPage } from "./SeoIndexPage";
import { Link } from "../../components/Link";

type SeoRouterProps = {
  route: SeoRoute;
};

export function SeoRouter({ route }: SeoRouterProps) {
  const hub = getSeoHub(route.hubId);
  const pages = getHubPages(route.hubId);

  if (!route.slug) {
    if (route.hubId === "faq") {
      return <SeoFAQPage hub={hub} pages={pages} />;
    }
    return <SeoIndexPage hub={hub} pages={pages} />;
  }

  const page = getSeoPage(route.hubId, route.slug);
  if (!page) {
    return (
      <div className="seo-not-found">
        <h1>Page not found</h1>
        <p>This guide is not available yet.</p>
        <Link href={hub.basePath} className="seo-back-link">
          Back to {hub.category}
        </Link>
      </div>
    );
  }

  if (route.hubId === "cities") {
    return <SeoCityPage hub={hub} page={page} />;
  }

  if (page.schemaType === "FAQPage" && page.sections.length === 0) {
    return <SeoFAQPage hub={hub} pages={[page]} />;
  }

  return <SeoArticlePage hub={hub} page={page} />;
}
