import { Link } from "../../components/Link";
import { AUTH_SIGNUP_PATH } from "../../constants/routes";
import { SeoHead } from "./SeoHead";
import { buildWebPageJsonLd } from "../../utils/seoHead";

export function PublicNotFoundPage() {
  return (
    <div className="seo-not-found seo-not-found--page">
      <SeoHead
        title="Page not found | BamSignal"
        description="This page could not be found. Explore BamSignal guides, Nigeria city directory, and help centre."
        canonicalPath="/404"
        noindex
        jsonLd={buildWebPageJsonLd({
          title: "Page not found",
          description: "Page not found on BamSignal.",
          canonicalPath: "/404"
        })}
      />
      <h1>Page not found</h1>
      <p>We could not find that page. Try one of these instead:</p>
      <ul className="seo-resource-list">
        <li>
          <Link href="/">Homepage</Link>
        </li>
        <li>
          <Link href="/nigeria">Nigeria directory</Link>
        </li>
        <li>
          <Link href="/help">Help centre</Link>
        </li>
        <li>
          <Link href="/safety">Safety centre</Link>
        </li>
        <li>
          <Link href={AUTH_SIGNUP_PATH}>Get Started</Link>
        </li>
      </ul>
    </div>
  );
}
