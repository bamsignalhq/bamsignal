import { Link } from "../../components/Link";
import type { NigeriaCityLocation, NigeriaStateLocation } from "../../content/seo/nigeriaLocations";
import {
  getStateCityPath,
  getStatePath,
  NIGERIA_DIRECTORY_PATH,
  resolveNearbyCities
} from "../../content/seo/nigeriaLocations";
import { AUTH_SIGNUP_PATH } from "../../constants/routes";
import { SeoBreadcrumbs } from "./SeoBreadcrumbs";
import { SeoHead } from "./SeoHead";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildPlaceJsonLd
} from "../../utils/seoHead";

type NigeriaCityPageProps = {
  state: NigeriaStateLocation;
  city: NigeriaCityLocation;
};

export function NigeriaCityPage({ state, city }: NigeriaCityPageProps) {
  const canonicalPath = getStateCityPath(state.slug, city.slug);
  const title = `Meet people in ${city.name}, ${state.name} | BamSignal`;
  const description = `Meet people in ${city.name}, ${state.name} — local tips, conversation ideas, and calm safety reminders for dating on BamSignal.`;
  const nearbyCities = resolveNearbyCities(state, city);
  const faqs = [
    {
      question: `How do I meet people in ${city.name}?`,
      answer: `Set ${city.name} on your BamSignal profile, browse Discover, and send a signal with a note tied to their profile. Public first meetups in places you know keep things comfortable.`
    },
    {
      question: `Is BamSignal used in ${city.name}?`,
      answer: `Yes — BamSignal supports Nigerian states and cities including ${city.name}, ${state.name}. A complete profile and honest location help discovery stay relevant.`
    },
    {
      question: "Do I need premium to start?",
      answer: "No. You can create a profile, send signals, and chat on the free plan."
    }
  ];

  const jsonLd = [
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Nigeria", path: NIGERIA_DIRECTORY_PATH },
      { name: state.name, path: getStatePath(state.slug) },
      { name: city.name, path: canonicalPath }
    ]),
    buildPlaceJsonLd({
      title: city.name,
      description,
      canonicalPath,
      city: city.name,
      state: state.name
    }),
    buildArticleJsonLd({
      title,
      description,
      canonicalPath,
      lastUpdated: "2026-06-19"
    }),
    buildFaqJsonLd(faqs)
  ];

  return (
    <article className="seo-article seo-nigeria">
      <SeoHead
        title={title}
        description={description}
        canonicalPath={canonicalPath}
        keywords={[
          `meet people ${city.name}`,
          `dating ${city.name} ${state.name}`,
          `BamSignal ${city.name}`
        ]}
        jsonLd={jsonLd}
        noindex={!city.indexable}
      />

      <SeoBreadcrumbs
        items={[
          { label: "Home", path: "/" },
          { label: "Nigeria", path: NIGERIA_DIRECTORY_PATH },
          { label: state.name, path: getStatePath(state.slug) },
          { label: city.name }
        ]}
      />

      <header className="seo-article__header">
        <span className="seo-article__eyebrow">
          {city.name}, {state.name}
        </span>
        <h1>Meet people in {city.name}</h1>
        <p className="seo-article__intro">{city.intro}</p>
      </header>

      <div className="seo-article__body">
        <section className="seo-article__section">
          <h2>How people connect here</h2>
          <p>{city.connectNote}</p>
          <p>
            Browse profiles, read prompts, and reach out with a signal when someone fits your vibe — one clear
            question beats a generic hello.
          </p>
        </section>

        <section className="seo-article__section">
          <h2>Local highlights</h2>
          <ul className="seo-bullet-list">
            {city.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="seo-article__section">
          <h2>Conversation tips</h2>
          <p>
            Reference something specific from their profile — a neighbourhood, food spot, or weekend routine. Keep
            the tone warm and respectful.
          </p>
          <p>
            <Link href="/guides/conversation-starters" className="seo-resource-link">
              More conversation starters
            </Link>
          </p>
        </section>

        <section className="seo-article__section">
          <h2>Safety reminder</h2>
          <p>
            For first meetups, consider {city.meetHint}. Share your plans with someone you trust and arrange your
            own transport.
          </p>
          <p>
            <Link href="/safety/meeting-safely" className="seo-resource-link">
              Meeting safely guide
            </Link>
          </p>
        </section>

        {nearbyCities.length > 0 ? (
          <section className="seo-article__section">
            <h2>Nearby areas</h2>
            <div className="seo-tag-grid">
              {nearbyCities.map((near) => (
                <Link
                  key={near.slug}
                  href={getStateCityPath(state.slug, near.slug)}
                  className="seo-tag"
                >
                  {near.name}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="seo-faq-block">
          <h2>Common questions</h2>
          <dl className="seo-faq-list">
            {faqs.map((faq) => (
              <div key={faq.question} className="seo-faq-item">
                <dt>{faq.question}</dt>
                <dd>{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

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
        <h2>Meet people who match your vibe</h2>
        <p>Good conversations often begin with a signal — explore {city.name} on BamSignal.</p>
        <Link href={AUTH_SIGNUP_PATH} className="seo-inline-cta__btn">
          Join BamSignal
        </Link>
      </aside>
    </article>
  );
}
