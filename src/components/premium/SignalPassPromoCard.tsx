import { Heart, Star, X } from "lucide-react";
import { MONETIZATION_COPY, PREMIUM_COPY } from "../../constants/copy";

type SignalPassPromoCardProps = {
  variant?: "settings" | "profile" | "home";
  onUpgrade: () => void;
  onDismiss?: () => void;
};

export function SignalPassPromoCard({
  variant = "settings",
  onUpgrade,
  onDismiss
}: SignalPassPromoCardProps) {
  const Icon = variant === "profile" ? Star : Heart;

  return (
    <section
      className={`signal-pass-promo signal-pass-promo--${variant}`}
      aria-label="Signal Pass"
    >
      {variant === "home" && onDismiss ? (
        <button
          type="button"
          className="signal-pass-promo__dismiss"
          onClick={onDismiss}
          aria-label="Dismiss for 7 days"
        >
          <X size={16} aria-hidden />
        </button>
      ) : null}

      <div className="signal-pass-promo__icon" aria-hidden>
        <Icon size={variant === "home" ? 18 : 22} fill="currentColor" />
      </div>

      <div className="signal-pass-promo__copy">
        {variant === "home" ? (
          <>
            <p className="signal-pass-promo__eyebrow">{PREMIUM_COPY.homeBannerEyebrow}</p>
            <p className="signal-pass-promo__title signal-pass-promo__title--compact">
              {PREMIUM_COPY.homeBannerTitle}
            </p>
            <ul className="signal-pass-promo__bullets">
              {PREMIUM_COPY.homeBannerBullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <p className="signal-pass-promo__eyebrow">
              {variant === "profile" ? PREMIUM_COPY.profileEyebrow : PREMIUM_COPY.settingsEyebrow}
            </p>
            <h2 className="signal-pass-promo__title">{PREMIUM_COPY.unlockTitle}</h2>
            <p className="signal-pass-promo__subtitle">
              {variant === "profile" ? PREMIUM_COPY.profileSubtitle : PREMIUM_COPY.settingsSubtitle}
            </p>
          </>
        )}
      </div>

      <button type="button" className="signal-pass-promo__cta" onClick={onUpgrade}>
        {MONETIZATION_COPY.upgradeToday}
      </button>
    </section>
  );
}
