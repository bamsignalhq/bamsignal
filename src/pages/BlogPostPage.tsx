import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "../components/Link";
import { ShowcaseImage } from "../components/ShowcaseImage";
import type { BlogPost } from "../data/blogPosts";
import { absoluteUrl, SITE_NAME } from "../constants/seo";
import { AUTH_SIGNUP_PATH, BLOG_INDEX_PATH } from "../constants/routes";

type BlogPostPageProps = {
  post: BlogPost;
  onSignup: () => void;
};

function injectArticleMeta(post: BlogPost) {
  document.title = `${post.title} | ${SITE_NAME}`;
  const setMeta = (name: string, content: string, property = false) => {
    const attr = property ? "property" : "name";
    let el = document.querySelector(`meta[${attr}="${name}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  };
  setMeta("description", post.description);
  setMeta("keywords", post.keywords.join(", "));
  setMeta("og:title", post.title, true);
  setMeta("og:description", post.description, true);
  setMeta("og:image", absoluteUrl(post.heroImage), true);
  setMeta("og:url", absoluteUrl(`${BLOG_INDEX_PATH}/${post.slug}`), true);
  setMeta("og:type", "article", true);

  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = absoluteUrl(`${BLOG_INDEX_PATH}/${post.slug}`);
}

export function BlogPostPage({ post, onSignup }: BlogPostPageProps) {
  useEffect(() => {
    injectArticleMeta(post);
  }, [post]);

  return (
    <article className="blog-article">
      <header className="blog-article__hero">
        <ShowcaseImage src={post.heroImage} alt={post.heroAlt} loading="eager" />
        <div className="blog-article__hero-shade" />
        <div className="blog-article__hero-copy">
          <Link href={BLOG_INDEX_PATH} className="blog-back">
            <ArrowLeft size={16} /> All guides
          </Link>
          {post.city && <span className="blog-article__city">{post.city}, Nigeria</span>}
          <h1>{post.title}</h1>
          <p>{post.description}</p>
          <p className="blog-article__meta">
            Updated {post.updatedAt} · {post.readMinutes} min read
          </p>
        </div>
      </header>

      <div className="blog-article__body">
        {post.sections.map((section) => (
          <section key={section.heading} className="blog-article__section">
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
            {section.image && (
              <figure className="blog-figure">
                <ShowcaseImage src={section.image.src} alt={section.image.alt} loading="lazy" />
                <figcaption>{section.image.caption}</figcaption>
              </figure>
            )}
          </section>
        ))}

        <aside className="blog-cta card">
          <h2>Ready to meet someone real?</h2>
          <p>Create your free BamSignal profile and send your first signal this week.</p>
          <button type="button" className="btn-primary btn-full" onClick={onSignup}>
            Join BamSignal free
          </button>
          <p className="blog-cta__url">
            <a href={absoluteUrl(AUTH_SIGNUP_PATH)}>{absoluteUrl(AUTH_SIGNUP_PATH)}</a>
          </p>
        </aside>
      </div>
    </article>
  );
}
