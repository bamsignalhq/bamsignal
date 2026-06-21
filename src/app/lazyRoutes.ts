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

export const LazyLegalPage = lazy(() =>
  import("../pages/LegalPage").then((module) => ({ default: module.LegalPage }))
);

export const LazyMomentPage = lazy(() =>
  import("../pages/MomentPage").then((module) => ({ default: module.MomentPage }))
);
