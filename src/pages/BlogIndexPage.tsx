import { useEffect, useMemo } from "react";
import { BookOpen, MapPin } from "lucide-react";
import { Link } from "../components/Link";
import { ShowcaseImage } from "../components/ShowcaseImage";
import { BLOG_POSTS } from "../data/blogPosts";
import { SHOWCASE } from "../constants/showcase";
import { BLOG_INDEX_PATH } from "../constants/routes";
import { SITE_NAME } from "../constants/seo";

type BlogIndexPageProps = {
  onSignup: () => void;
};

function setBlogMeta(title: string, description: string) {
  document.title = title;
  let meta = document.querySelector('meta[name="description"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "description");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", description);
}

export function BlogIndexPage({ onSignup }: BlogIndexPageProps) {
  useEffect(() => {
    setBlogMeta(
      `Dating & Love Guides for Nigeria | ${SITE_NAME} Blog`,
      "City-by-city guides for finding love in Nigeria — Lagos, Abuja, PH, Enugu, and 20+ cities. Verified dating tips from BamSignal."
    );
  }, []);

  const cityPosts = BLOG_POSTS.filter((p) => p.city);
  const guides = BLOG_POSTS.filter((p) => !p.city);
  const featured = useMemo(
    () => cityPosts.find((p) => p.city === "Lagos") ?? cityPosts[0] ?? guides[0],
    [cityPosts, guides]
  );

  return (
    <div className="blog-page">
      <header className="blog-hero blog-hero--visual">
        <div className="blog-hero__bg" aria-hidden>
          <div className="blog-hero__bg-main">
            <ShowcaseImage src={SHOWCASE.hero} alt="" loading="eager" />
          </div>
          <div className="blog-hero__bg-side">
            <ShowcaseImage src={SHOWCASE.lagosRooftop} alt="" loading="lazy" />
            <ShowcaseImage src={SHOWCASE.suyaChill} alt="" loading="lazy" />
          </div>
        </div>
        <div className="blog-hero__shade" />
        <div className="blog-hero__inner">
          <p className="blog-hero__eyebrow">
            <BookOpen size={14} aria-hidden /> BamSignal Blog
          </p>
          <h1>Find love in your city — guides built for Nigeria</h1>
          <p className="blog-hero__lede">
            Practical dating tips, city guides, and safety advice — written for Lagos, Abuja, PH, and 20+ Nigerian cities.
          </p>
          <div className="blog-hero__stats">
            <span className="blog-stat-pill">{cityPosts.length} city guides</span>
            <span className="blog-stat-pill">{guides.length} Nigeria-wide</span>
            <span className="blog-stat-pill">
              <MapPin size={12} style={{ display: "inline", verticalAlign: "-2px" }} aria-hidden /> 20+ cities
            </span>
          </div>
          <div className="blog-hero__actions">
            <button type="button" className="visual-btn visual-btn--primary" onClick={onSignup}>
              Create free profile
            </button>
          </div>
        </div>
      </header>

      {featured && (
        <section className="blog-featured">
          <Link href={`${BLOG_INDEX_PATH}/${featured.slug}`} className="blog-featured__card">
            <div className="blog-featured__media">
              <ShowcaseImage src={featured.heroImage} alt={featured.heroAlt} loading="lazy" />
              <span className="blog-featured__badge">Featured guide</span>
            </div>
            <div className="blog-featured__body">
              {featured.city && <span className="blog-card__city">{featured.city}</span>}
              <h3>{featured.title}</h3>
              <p>{featured.description}</p>
              <span className="blog-card__meta">{featured.readMinutes} min read</span>
            </div>
          </Link>
        </section>
      )}

      <section className="blog-section">
        <div className="blog-section__head">
          <h2>City love guides</h2>
          <span>{cityPosts.length} articles</span>
        </div>
        <div className="blog-grid">
          {cityPosts.map((post) => (
            <article key={post.slug} className="blog-card">
              <Link href={`${BLOG_INDEX_PATH}/${post.slug}`} className="blog-card__hit">
                <ShowcaseImage src={post.heroImage} alt={post.heroAlt} loading="lazy" />
                <div className="blog-card__shade" />
                <div className="blog-card__body">
                  <span className="blog-card__city">{post.city}</span>
                  <h3>{post.title}</h3>
                  <p>{post.description}</p>
                  <span className="blog-card__meta">{post.readMinutes} min read</span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="blog-section">
        <div className="blog-section__head">
          <h2>Nigeria-wide guides</h2>
          <span>{guides.length} articles</span>
        </div>
        <div className="blog-grid blog-grid--compact">
          {guides.map((post) => (
            <article key={post.slug} className="blog-card blog-card--compact">
              <Link href={`${BLOG_INDEX_PATH}/${post.slug}`} className="blog-card__hit">
                <ShowcaseImage src={post.heroImage} alt={post.heroAlt} loading="lazy" />
                <div className="blog-card__shade" />
                <div className="blog-card__body">
                  <h3>{post.title}</h3>
                  <p>{post.description}</p>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
