import { Link } from "../../components/Link";
import {
  getIndexableStates,
  NIGERIA_DIRECTORY_PATH,
  NIGERIA_STATES,
  getStatePath
} from "../../content/seo/nigeriaLocations";
import { AUTH_SIGNUP_PATH } from "../../constants/routes";
import { SeoBreadcrumbs } from "./SeoBreadcrumbs";
import { SeoHead } from "./SeoHead";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "../../utils/seoHead";

const DIRECTORY_TITLE = "Meet people across Nigeria | BamSignal";
const DIRECTORY_DESCRIPTION =
  "Discover BamSignal across Nigerian states and cities — signal-based dating built for local life, from Lagos to Abuja and beyond.";

export function NigeriaDirectoryPage() {
  const indexableStates = getIndexableStates();
  const allStates = [...NIGERIA_STATES].sort((a, b) => a.name.localeCompare(b.name));
  const jsonLd = [
    buildBreadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Nigeria", path: NIGERIA_DIRECTORY_PATH }]),
    buildWebPageJsonLd({
      title: DIRECTORY_TITLE,
      description: DIRECTORY_DESCRIPTION,
      canonicalPath: NIGERIA_DIRECTORY_PATH
    })
  ];

  return (
    <div className="seo-index seo-nigeria">
      <SeoHead
        title={DIRECTORY_TITLE}
        description={DIRECTORY_DESCRIPTION}
        canonicalPath={NIGERIA_DIRECTORY_PATH}
        keywords={["dating Nigeria", "meet people Nigeria", "BamSignal states", "Nigerian cities dating"]}
        jsonLd={jsonLd}
      />

      <SeoBreadcrumbs items={[{ label: "Home", path: "/" }, { label: "Nigeria" }]} />

      <header className="seo-index__hero">
        <p className="seo-index__eyebrow">Nigeria directory</p>
        <h1>Meet people across Nigeria</h1>
        <p className="seo-index__intro">
          BamSignal is Nigerian-first — browse by state and city, send signals with context, and build conversations
          that fit how you actually live. Good conversations often begin with a signal.
        </p>
      </header>

      <section className="seo-index__grid-section">
        <div className="seo-index__grid-head">
          <h2>States with city guides</h2>
          <span>{indexableStates.length} states</span>
        </div>
        <div className="seo-card-grid">
          {indexableStates
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((state) => (
              <article key={state.slug} className="seo-card">
                <Link href={getStatePath(state.slug)} className="seo-card__link">
                  <h3>Meet people in {state.name}</h3>
                  <p>{state.intro.slice(0, 140)}…</p>
                  <span className="seo-card__meta">
                    {state.cities.filter((c) => c.indexable).length} areas
                  </span>
                </Link>
              </article>
            ))}
        </div>
      </section>

      <section className="seo-index__grid-section">
        <div className="seo-index__grid-head">
          <h2>All states &amp; FCT</h2>
          <span>{allStates.length} regions</span>
        </div>
        <div className="seo-tag-grid">
          {allStates.map((state) => (
            <Link
              key={state.slug}
              href={getStatePath(state.slug)}
              className={`seo-tag${state.indexable ? "" : " seo-tag--muted"}`}
            >
              {state.name}
            </Link>
          ))}
        </div>
      </section>

      <aside className="seo-inline-cta card">
        <h2>Meet people who match your vibe</h2>
        <p>Set your city, explore Discover, and send your first signal when someone stands out.</p>
        <Link href={AUTH_SIGNUP_PATH} className="seo-inline-cta__btn">
          Join BamSignal
        </Link>
      </aside>
    </div>
  );
}
