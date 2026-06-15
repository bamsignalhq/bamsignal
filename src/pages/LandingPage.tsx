import { SiteFooter } from "../components/SiteFooter";
import { isNativePlatform } from "../services/supabase";
import { HomeHeroTrustStrip } from "../components/home/HomeHeroTrustStrip";
import { HomeTrustStrip } from "../components/home/HomeTrustStrip";
import { VisualHero } from "../components/visual/VisualHero";
import { CitySpotlightSection } from "../components/visual/CitySpotlightSection";
import { SignalMoments } from "../components/visual/SignalMoments";
import { VisualFinalCta } from "../components/visual/VisualFinalCta";

type LandingPageProps = {
  onSignup: () => void;
  onGuestAction: () => void;
  showEarlyAccess?: boolean;
  onLogoClick?: () => void;
};

export function LandingPage({
  onSignup,
  onGuestAction,
  showEarlyAccess,
  onLogoClick
}: LandingPageProps) {
  return (
    <div className="visual-page home-landing">
      <VisualHero onGetStarted={onSignup} onExplore={onGuestAction} />
      <HomeHeroTrustStrip />
      <CitySpotlightSection onGuestAction={onGuestAction} />
      <SignalMoments />
      <HomeTrustStrip />
      <VisualFinalCta onSignup={onSignup} />
      {!isNativePlatform ? (
        <SiteFooter showEarlyAccess={showEarlyAccess} onLogoClick={onLogoClick} />
      ) : null}
    </div>
  );
}
