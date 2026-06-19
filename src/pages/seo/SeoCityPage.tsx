import type { SeoHubConfig, SeoPage } from "../../content/seo";
import { Link } from "../../components/Link";
import { AUTH_SIGNUP_PATH } from "../../constants/routes";
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
      <aside className="seo-inline-cta card">
        <h2>Meet people who match your vibe</h2>
        <p>Good conversations often begin with a signal. Create your free profile and explore {page.city ?? "your city"}.</p>
        <Link href={AUTH_SIGNUP_PATH} className="seo-inline-cta__btn">
          Join BamSignal
        </Link>
      </aside>
    </div>
  );
}
