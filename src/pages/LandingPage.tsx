import { SiteFooter } from "../components/SiteFooter";
import { HomeHowItWorks } from "../components/home/HomeHowItWorks";
import { HomePremiumTeaser } from "../components/home/HomePremiumTeaser";
import { HomePulseBar } from "../components/home/HomePulseBar";
import { HomeTrustStrip } from "../components/home/HomeTrustStrip";
import { VisualHero } from "../components/visual/VisualHero";
import { SignalsAroundNigeria } from "../components/visual/SignalsAroundNigeria";
import { SignalMoments } from "../components/visual/SignalMoments";
import { VisualFinalCta } from "../components/visual/VisualFinalCta";

type LandingPageProps = {
  onSignup: () => void;
  onOpenPricing: () => void;
  onGuestAction: () => void;
  showEarlyAccess?: boolean;
  onLogoClick?: () => void;
};

export function LandingPage({
  onSignup,
  onOpenPricing,
  onGuestAction,
  showEarlyAccess,
  onLogoClick
}: LandingPageProps) {
  return (
    <div className="visual-page home-landing">
      <VisualHero onGetStarted={onSignup} />
      <HomePulseBar />
      <HomeHowItWorks onGetStarted={onSignup} />
      <SignalsAroundNigeria onGuestAction={onGuestAction} />
      <SignalMoments />
      <HomeTrustStrip />
      <HomePremiumTeaser onUnlock={onOpenPricing} />
      <VisualFinalCta onSignup={onSignup} />
      <SiteFooter showEarlyAccess={showEarlyAccess} onLogoClick={onLogoClick} />
    </div>
  );
}
