import { Link } from "../../components/Link";
import type { NigeriaStateLocation } from "../../content/seo/nigeriaLocations";
import {
  getStatePath,
  getStateCityPath,
  NIGERIA_DIRECTORY_PATH,
  resolveNearbyStates
} from "../../content/seo/nigeriaLocations";
import { AUTH_SIGNUP_PATH } from "../../constants/routes";
import { SeoBreadcrumbs } from "./SeoBreadcrumbs";
import { SeoHead } from "./SeoHead";
import { buildArticleJsonLd, buildBreadcrumbJsonLd } from "../../utils/seoHead";

type NigeriaStatePageProps = {
  state: NigeriaStateLocation;
};

export function NigeriaStatePage({ state }: NigeriaStatePageProps) {
  const canonicalPath = getStatePath(state.slug);
  const title = `Meet people in ${state.name} | BamSignal`;
  const description = `Discover people in ${state.name} — ${state.region} dating on BamSignal with signals, local areas, and practical safety tips.`;
  const indexableCities = state.cities.filter((c) => c.indexable).sort((a, b) => a.name.localeCompare(b.name));
  const nearbyStates = resolveNearbyStates(state);

  const jsonLd = [
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Nigeria", path: NIGERIA_DIRECTORY_PATH },
      { name: state.name, path: canonicalPath }
    ]),
    buildArticleJsonLd({
      title,
      description,
      canonicalPath,
      lastUpdated: "2026-06-19"
    })
  ];

  return (
    <article className="seo-article seo-nigeria">
      <SeoHead
        title={title}
        description={description}
        canonicalPath={canonicalPath}
        keywords={[`dating ${state.name}`, `meet people ${state.name}`, `BamSignal ${state.name}`]}
        jsonLd={jsonLd}
        noindex={!state.indexable}
      />

      <SeoBreadcrumbs
        items={[
          { label: "Home", path: "/" },
          { label: "Nigeria", path: NIGERIA_DIRECTORY_PATH },
          { label: state.name }
        ]}
      />

      <header className="seo-article__header">
        <span className="seo-article__eyebrow">{state.region}</span>
        <h1>Meet people in {state.name}</h1>
        <p className="seo-article__intro">{state.intro}</p>
      </header>

      <div className="seo-article__body">
        <section className="seo-article__section">
          <h2>How BamSignal works here</h2>
          <p>
            Set your state and city on your profile, browse Discover, and send a signal when someone&apos;s prompts
            feel like a real match — not just another swipe.
          </p>
          <p>
            Good conversations often begin with a signal. Take your time before suggesting a meetup; a few solid
            exchanges help you gauge fit.
          </p>
        </section>

        {indexableCities.length > 0 ? (
          <section className="seo-article__section">
            <h2>Popular cities &amp; areas</h2>
            <div className="seo-card-grid seo-card-grid--compact">
              {indexableCities.map((city) => (
                <article key={city.slug} className="seo-card">
                  <Link href={getStateCityPath(state.slug, city.slug)} className="seo-card__link">
                    <h3>{city.name}</h3>
                    <p>{city.intro.slice(0, 100)}…</p>
                    <span className="seo-card__meta">Area guide</span>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        ) : (
          <section className="seo-article__section">
            <h2>City guides coming soon</h2>
            <p>
              We are adding area-level guides for {state.name} carefully — without thin spam pages. You can still
              use BamSignal by setting your location in the app.
            </p>
          </section>
        )}

        <section className="seo-article__section">
          <h2>A calm safety reminder</h2>
          <p>
            Choose public places for first meetups, share plans with someone you trust, and use block or report if
            something feels off. You never owe anyone money or personal details.
          </p>
          <p>
            <Link href="/safety/meeting-safely" className="seo-resource-link">
              Read meeting safely tips
            </Link>
          </p>
        </section>

        {nearbyStates.length > 0 ? (
          <section className="seo-article__section">
            <h2>Nearby states</h2>
            <div className="seo-tag-grid">
              {nearbyStates.map((near) => (
                <Link key={near.slug} href={getStatePath(near.slug)} className="seo-tag">
                  {near.name}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="seo-article__section seo-resource-links">
          <h2>Helpful links</h2>
          <ul className="seo-resource-list">
            <li>
              <Link href="/features/signals">How signals work</Link>
            </li>
            <li>
              <Link href="/help/create-profile">Create your profile</Link>
            </li>
            <li>
              <Link href="/safety/meeting-safely">Meeting safely</Link>
            </li>
            <li>
              <Link href={AUTH_SIGNUP_PATH}>Join BamSignal</Link>
            </li>
          </ul>
        </section>
      </div>

      <aside className="seo-inline-cta card">
        <h2>Ready to connect in {state.name}?</h2>
        <p>Meet people who match your vibe — start with a thoughtful signal.</p>
        <Link href={AUTH_SIGNUP_PATH} className="seo-inline-cta__btn">
          Join BamSignal
        </Link>
      </aside>
    </article>
  );
}
