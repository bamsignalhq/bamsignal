import { BlogIndexPage } from "../pages/BlogIndexPage";
import "../styles/entry-public-marketing.css";
import { BlogPostPage } from "../pages/BlogPostPage";
import { StoreScreenshotsPage } from "../pages/StoreScreenshotsPage";
import { SeoLayout } from "../pages/seo/SeoLayout";
import { SeoRouter } from "../pages/seo/SeoRouter";
import { NigeriaLocationRouter } from "../pages/seo/NigeriaLocationRouter";
import { PublicNotFoundPage } from "../pages/seo/PublicNotFoundPage";
import { ComingSoonPage } from "../pages/seo/ComingSoonPage";
import type { BlogPost } from "../data/blogPosts";
import type { SeoRoute } from "../constants/seoRoutes";
import type { NigeriaRoute } from "../constants/nigeriaRoutes";
import type { ComingSoonPageConfig } from "../constants/comingSoonPages";
import type { Theme } from "../types";

type PublicMarketingRoutesProps = {
  variant:
    | "blog-index"
    | "blog-post"
    | "blog-missing"
    | "seo"
    | "nigeria"
    | "not-found"
    | "coming-soon"
    | "store-screenshots";
  theme: Theme;
  onToggleTheme: () => void;
  onLogoClick: () => void;
  onLogin: () => void;
  onSignup: () => void;
  onBackToBlog?: () => void;
  blogPost?: BlogPost | null;
  seoRoute?: SeoRoute | null;
  nigeriaRoute?: NigeriaRoute | null;
  comingSoonPage?: ComingSoonPageConfig | null;
};

/** Public SEO, blog, help, safety, and premium guides — outside the member shell bundle. */
export function PublicMarketingRoutes({
  variant,
  theme,
  onToggleTheme,
  onLogoClick,
  onLogin,
  onSignup,
  onBackToBlog,
  blogPost,
  seoRoute,
  nigeriaRoute,
  comingSoonPage
}: PublicMarketingRoutesProps) {
  if (variant === "store-screenshots") {
    return <StoreScreenshotsPage />;
  }

  const content =
    variant === "coming-soon" && comingSoonPage ? (
      <ComingSoonPage page={comingSoonPage} onSignup={onSignup} />
    ) : variant === "blog-index" ? (
      <BlogIndexPage onSignup={onSignup} />
    ) : variant === "blog-post" && blogPost ? (
      <BlogPostPage post={blogPost} onSignup={onSignup} />
    ) : variant === "blog-missing" ? (
      <div className="seo-not-found">
        <h1>Guide not found</h1>
        <p>This article is not available.</p>
        <button type="button" className="seo-header__join" onClick={onBackToBlog}>
          Back to blog
        </button>
      </div>
    ) : variant === "seo" && seoRoute ? (
      <SeoRouter route={seoRoute} />
    ) : variant === "nigeria" && nigeriaRoute ? (
      <NigeriaLocationRouter route={nigeriaRoute} />
    ) : (
      <PublicNotFoundPage />
    );

  return (
    <div className={`app ${theme} platform-root`}>
      <SeoLayout
        theme={theme}
        onToggleTheme={onToggleTheme}
        onLogoClick={onLogoClick}
        onLogin={onLogin}
        onSignup={onSignup}
      >
        {content}
      </SeoLayout>
    </div>
  );
}
