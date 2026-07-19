import { useEffect, useId, useState } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { AppLogo } from "./AppLogo";
import {
  PUBLIC_MARKETING_NAV_CTAS,
  PUBLIC_MARKETING_NAV_LINKS,
  isPublicMarketingNavActive
} from "../constants/publicMarketingNav";
import { navigateToPath, normalizePath } from "../constants/routePath";
import type { Theme } from "../types";

type PublicMarketingNavProps = {
  theme: Theme;
  onToggleTheme: () => void;
  onLogoClick?: () => void;
  onLogin?: () => void;
  onSignup?: () => void;
  onOpenApp?: () => void;
  openAppLoading?: boolean;
  transparentOverHero?: boolean;
};

export function PublicMarketingNav({
  theme,
  onToggleTheme,
  onLogoClick,
  onLogin,
  onSignup,
  onOpenApp,
  openAppLoading = false,
  transparentOverHero = false
}: PublicMarketingNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const pathname =
    typeof window !== "undefined" ? normalizePath(window.location.pathname) : "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const solid = scrolled || !transparentOverHero || menuOpen;
  const compact = scrolled;

  const go = (href: string) => {
    setMenuOpen(false);
    if (href.startsWith("#") && pathname === "/") {
      const id = href.slice(1);
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    navigateToPath(href);
  };

  return (
    <header
      className={[
        "public-mkt-nav",
        solid ? "public-mkt-nav--solid" : "public-mkt-nav--transparent",
        compact ? "public-mkt-nav--compact" : "",
        menuOpen ? "public-mkt-nav--open" : ""
      ]
        .filter(Boolean)
        .join(" ")}
      role="banner"
    >
      <div className="public-mkt-nav__inner">
        <button
          type="button"
          className="public-mkt-nav__brand"
          onClick={onLogoClick}
          aria-label="BamSignal home"
        >
          <AppLogo size="sm" showText />
        </button>

        <nav className="public-mkt-nav__center" aria-label="Marketing">
          {PUBLIC_MARKETING_NAV_LINKS.map((link) => {
            const active = isPublicMarketingNavActive(pathname, link.href);
            return (
              <a
                key={link.label}
                className={`public-mkt-nav__link ${active ? "public-mkt-nav__link--active" : ""}`}
                href={link.href}
                aria-current={active ? "page" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  go(link.href);
                }}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        <div className="public-mkt-nav__right">
          <button
            type="button"
            className="public-mkt-nav__icon"
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
          </button>

          {onOpenApp ? (
            <button
              type="button"
              className="public-mkt-nav__cta public-mkt-nav__cta--primary"
              onClick={onOpenApp}
              disabled={openAppLoading}
              aria-busy={openAppLoading}
            >
              {openAppLoading ? "Opening…" : "Open App"}
            </button>
          ) : (
            <>
              {onLogin ? (
                <button
                  type="button"
                  className="public-mkt-nav__cta public-mkt-nav__cta--ghost public-mkt-nav__cta--signin"
                  onClick={onLogin}
                >
                  {PUBLIC_MARKETING_NAV_CTAS.signIn.label}
                </button>
              ) : null}
              {onSignup ? (
                <button
                  type="button"
                  className="public-mkt-nav__cta public-mkt-nav__cta--primary public-mkt-nav__cta--always"
                  onClick={onSignup}
                >
                  {PUBLIC_MARKETING_NAV_CTAS.getStarted.label}
                </button>
              ) : null}
            </>
          )}

          <button
            type="button"
            className="public-mkt-nav__menu-btn"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div id={menuId} className="public-mkt-nav__drawer" role="dialog" aria-modal="true" aria-label="Site menu">
          <nav className="public-mkt-nav__drawer-nav" aria-label="Marketing mobile">
            {PUBLIC_MARKETING_NAV_LINKS.map((link) => {
              const active = isPublicMarketingNavActive(pathname, link.href);
              return (
                <a
                  key={link.label}
                  className={`public-mkt-nav__drawer-link ${active ? "public-mkt-nav__drawer-link--active" : ""}`}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    go(link.href);
                  }}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>
          {!onOpenApp ? (
            <div className="public-mkt-nav__drawer-actions">
              {onLogin ? (
                <button
                  type="button"
                  className="public-mkt-nav__cta public-mkt-nav__cta--ghost"
                  onClick={() => {
                    setMenuOpen(false);
                    onLogin();
                  }}
                >
                  {PUBLIC_MARKETING_NAV_CTAS.signIn.label}
                </button>
              ) : null}
              {onSignup ? (
                <button
                  type="button"
                  className="public-mkt-nav__cta public-mkt-nav__cta--primary"
                  onClick={() => {
                    setMenuOpen(false);
                    onSignup();
                  }}
                >
                  {PUBLIC_MARKETING_NAV_CTAS.getStarted.label}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
