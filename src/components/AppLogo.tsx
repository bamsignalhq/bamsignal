import { BRAND_ASSETS } from "../constants/brand";

type AppLogoProps = {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
};

const sizes = { sm: 28, md: 36, lg: 48, xl: 72 };

export function AppLogo({ className = "", size = "md", showText = true }: AppLogoProps) {
  const px = sizes[size];
  return (
    <div className={`app-logo ${className}`}>
      <img
        src={BRAND_ASSETS.logo}
        alt="BamSignal"
        width={px}
        height={px}
        className="app-logo-img"
        decoding="async"
      />
      {showText && <span className="app-logo-text">BamSignal</span>}
    </div>
  );
}
