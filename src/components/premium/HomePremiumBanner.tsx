import { useState } from "react";
import { SignalPassPromoCard } from "./SignalPassPromoCard";
import { dismissHomePremiumBanner, isHomePremiumBannerDismissed } from "../../utils/premiumBannerDismiss";

type HomePremiumBannerProps = {
  onUpgrade: () => void;
};

export function HomePremiumBanner({ onUpgrade }: HomePremiumBannerProps) {
  const [visible, setVisible] = useState(() => !isHomePremiumBannerDismissed());

  if (!visible) return null;

  return (
    <SignalPassPromoCard
      variant="home"
      onUpgrade={onUpgrade}
      onDismiss={() => {
        dismissHomePremiumBanner();
        setVisible(false);
      }}
    />
  );
}
