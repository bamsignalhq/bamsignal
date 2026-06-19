import { ArrowLeft } from "lucide-react";
import { Link } from "../components/Link";
import { ShowcaseImage } from "../components/ShowcaseImage";
import type { BlogPost } from "../data/blogPosts";
import { absoluteUrl } from "../constants/seo";
import { AUTH_SIGNUP_PATH, BLOG_INDEX_PATH } from "../constants/routes";
import { SeoHead } from "./seo/SeoHead";
import { buildArticleJsonLd, buildBreadcrumbJsonLd } from "../utils/seoHead";

type BlogPostPageProps = {
  post: BlogPost;
  onSignup: () => void;
};

export function BlogPostPage({ post, onSignup }: BlogPostPageProps) {
  const canonicalPath = `${BLOG_INDEX_PATH}/${post.slug}`;
  const jsonLd = [
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Blog", path: BLOG_INDEX_PATH },
      { name: post.title, path: canonicalPath }
    ]),
    buildArticleJsonLd({
      title: post.title,
      description: post.description,
      canonicalPath,
      lastUpdated: post.updatedAt,
      headline: post.title
    })
  ];

  return (
    <article className="blog-article">
      <SeoHead
        title={post.title}
        description={post.description}
        canonicalPath={canonicalPath}
        keywords={post.keywords}
        ogType="article"
        ogImage={absoluteUrl(post.heroImage)}
        jsonLd={jsonLd}
      />
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
