import { ArrowRight } from "lucide-react";
import { SeoHead } from "../seo/SeoHead";
import { SeoLayout } from "../seo/SeoLayout";
import { PRODUCT_LANDINGS } from "../../data/productLandings";
import type { ProductLandingId } from "../../constants/productRoutes";
import { navigateToPath } from "../../constants/routePath";
import { AUTH_LOGIN_PATH, AUTH_SIGNUP_PATH } from "../../constants/routes";
import type { Theme } from "../../types";
import "../../styles/product-landings.css";

type ProductLandingPageProps = {
  productId: ProductLandingId;
  theme: Theme;
  onToggleTheme: () => void;
  onLogoClick: () => void;
  onLogin: () => void;
  onSignup: () => void;
};

export function ProductLandingPage({
  productId,
  theme,
  onToggleTheme,
  onLogoClick,
  onLogin,
  onSignup
}: ProductLandingPageProps) {
  const page = PRODUCT_LANDINGS[productId];

  const go = (href: string) => {
    if (href === AUTH_SIGNUP_PATH) {
      onSignup();
      return;
    }
    if (href === AUTH_LOGIN_PATH) {
      onLogin();
      return;
    }
    navigateToPath(href);
  };

  return (
    <div className={`app ${theme} platform-root`}>
      <SeoHead
        title={page.seoTitle}
        description={page.seoDescription}
        canonicalPath={page.path}
      />
      <SeoLayout
        theme={theme}
        onToggleTheme={onToggleTheme}
        onLogoClick={onLogoClick}
        onLogin={onLogin}
        onSignup={onSignup}
      >
        <article className={`product-landing product-landing--${page.tone}`}>
          <p className="product-landing__eyebrow">{page.eyebrow}</p>
          <p className="product-landing__intent">{page.intent}</p>
          <h1 className="product-landing__title">{page.title}</h1>
          <p className="product-landing__lede">{page.lede}</p>

          <div className="product-landing__story">
            {page.story.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {page.statusNote ? (
            <p className="product-landing__status" role="status">
              {page.statusNote}
            </p>
          ) : null}

          <ul className="product-landing__principles">
            {page.principles.map((item) => (
              <li key={item.label}>
                <span className="product-landing__principle-label">{item.label}</span>
                <span className="product-landing__principle-detail">{item.detail}</span>
              </li>
            ))}
          </ul>

          <div className="product-landing__actions">
            <button
              type="button"
              className="product-landing__primary"
              onClick={() => go(page.primaryCta.href)}
            >
              {page.primaryCta.label}
              <ArrowRight size={18} aria-hidden />
            </button>
            {page.secondaryCta ? (
              <button
                type="button"
                className="product-landing__secondary"
                onClick={() => go(page.secondaryCta!.href)}
              >
                {page.secondaryCta.label}
              </button>
            ) : null}
          </div>
        </article>
      </SeoLayout>
    </div>
  );
}
