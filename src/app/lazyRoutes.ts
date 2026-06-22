import { lazy } from "react";

export const LazyAdminConsoleRoot = lazy(() =>
  import("./AdminConsoleRoot").then((module) => ({ default: module.AdminConsoleRoot }))
);

export const LazyPublicMarketingRoutes = lazy(() =>
  import("./PublicMarketingRoutes").then((module) => ({ default: module.PublicMarketingRoutes }))
);

export const LazyFastConnectionPage = lazy(() =>
  import("../pages/FastConnectionPage").then((module) => ({ default: module.FastConnectionPage }))
);

export const LazyPremiumPage = lazy(() =>
  import("../pages/PremiumPage").then((module) => ({ default: module.PremiumPage }))
);

export const LazyVisitorsPage = lazy(() =>
  import("../pages/VisitorsPage").then((module) => ({ default: module.VisitorsPage }))
);

export const LazySafetyCenterPage = lazy(() =>
  import("../pages/SafetyCenterPage").then((module) => ({ default: module.SafetyCenterPage }))
);

export const LazySignalConciergeLandingPage = lazy(() =>
  import("../pages/signal-concierge/SignalConciergeLandingPage").then((module) => ({
    default: module.SignalConciergeLandingPage
  }))
);

export const LazySignalConciergeApplicationPage = lazy(() =>
  import("../pages/signal-concierge/SignalConciergeApplicationPage").then((module) => ({
    default: module.SignalConciergeApplicationPage
  }))
);

export const LazySignalConciergeStatusPage = lazy(() =>
  import("../pages/signal-concierge/SignalConciergeStatusPage").then((module) => ({
    default: module.SignalConciergeStatusPage
  }))
);

export const LazySignalConciergeConsultationPage = lazy(() =>
  import("../pages/signal-concierge/SignalConciergeConsultationPage").then((module) => ({
    default: module.SignalConciergeConsultationPage
  }))
);

export const LazySignalConciergePrivacyPage = lazy(() =>
  import("../pages/signal-concierge/SignalConciergePrivacyPage").then((module) => ({
    default: module.SignalConciergePrivacyPage
  }))
);

export const LazySignalConciergeFaqPage = lazy(() =>
  import("../pages/signal-concierge/SignalConciergeFaqPage").then((module) => ({
    default: module.SignalConciergeFaqPage
  }))
);

export const LazyShareYourStoryPage = lazy(() =>
  import("../pages/signal-concierge/ShareYourStoryPage").then((module) => ({
    default: module.ShareYourStoryPage
  }))
);

export const LazySignalEventsHubPage = lazy(() =>
  import("../pages/signal-events/SignalEventsHubPage").then((module) => ({
    default: module.SignalEventsHubPage
  }))
);

export const LazySignalEventsCityPage = lazy(() =>
  import("../pages/signal-events/SignalEventsCityPage").then((module) => ({
    default: module.SignalEventsCityPage
  }))
);

export const LazySignalEventsCommunitiesPage = lazy(() =>
  import("../pages/signal-events/SignalEventsCommunitiesPage").then((module) => ({
    default: module.SignalEventsCommunitiesPage
  }))
);

export const LazySignalEventsDiasporaPage = lazy(() =>
  import("../pages/signal-events/SignalEventsDiasporaPage").then((module) => ({
    default: module.SignalEventsDiasporaPage
  }))
);

export const LazyLegalPage = lazy(() =>
  import("../pages/LegalPage").then((module) => ({ default: module.LegalPage }))
);

export const LazyMomentPage = lazy(() =>
  import("../pages/MomentPage").then((module) => ({ default: module.MomentPage }))
);
