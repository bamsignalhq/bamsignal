import type { SeoHubConfig, SeoPage } from "../../content/seo";
import { SeoArticlePage } from "./SeoArticlePage";

type SeoCityPageProps = {
  hub: SeoHubConfig;
  page: SeoPage;
};

export function SeoCityPage({ hub, page }: SeoCityPageProps) {
  return (
    <div className="seo-city">
      <SeoArticlePage hub={hub} page={page} />
      <aside className="seo-city__tip card">
        <h2>Local tip</h2>
        <p>
          Share your neighbourhood and meet-up preferences early — it saves back-and-forth in busy cities
          like {page.city ?? "yours"}.
        </p>
      </aside>
    </div>
  );
}
