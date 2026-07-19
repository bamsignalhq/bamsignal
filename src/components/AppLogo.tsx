import { useSyncExternalStore } from "react";
import { brandIcon, brandLogo, resolveBrandTheme, type BrandTheme } from "../constants/brand";

type AppLogoProps = {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  /** When true, render the wordmark logo (includes BamSignal text). When false, square mark only. */
  showText?: boolean;
  /** Force theme; defaults to document theme */
  theme?: BrandTheme;
};

const sizes = { sm: 28, md: 36, lg: 48, xl: 72 };

function subscribeTheme(onStoreChange: () => void) {
  const el = document.documentElement;
  const obs = new MutationObserver(onStoreChange);
  obs.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
  window.addEventListener("storage", onStoreChange);
  return () => {
    obs.disconnect();
    window.removeEventListener("storage", onStoreChange);
  };
}

function readTheme(): BrandTheme {
  if (typeof document === "undefined") return "dark";
  return resolveBrandTheme(document.documentElement.dataset.theme);
}

export function AppLogo({ className = "", size = "md", showText = true, theme }: AppLogoProps) {
  const liveTheme = useSyncExternalStore(subscribeTheme, readTheme, () => "dark" as BrandTheme);
  const active = theme ?? liveTheme;
  const px = sizes[size];

  if (showText) {
    // Wordmark already includes "BamSignal" — do not duplicate text
    const height = px;
    const width = Math.round(height * (1274 / 456));
    return (
      <div className={`app-logo app-logo--wordmark app-logo--${size} ${className}`.trim()}>
        <img
          src={brandLogo(active)}
          alt="BamSignal"
          width={width}
          height={height}
          className="app-logo-img app-logo-img--wordmark"
          decoding="async"
        />
      </div>
    );
  }

  return (
    <div className={`app-logo app-logo--mark app-logo--${size} ${className}`.trim()}>
      <img
        src={brandIcon(active)}
        alt="BamSignal"
        width={px}
        height={px}
        className="app-logo-img app-logo-img--mark"
        decoding="async"
      />
    </div>
  );
}
