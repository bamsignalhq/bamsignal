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

export const LazySignalEventsCommunityJourneyPage = lazy(() =>
  import("../pages/signal-events/SignalEventsCommunityJourneyPage").then((module) => ({
    default: module.SignalEventsCommunityJourneyPage
  }))
);

export const LazySignalEventsDiasporaCorridorsPage = lazy(() =>
  import("../pages/signal-events/SignalEventsDiasporaCorridorsPage").then((module) => ({
    default: module.SignalEventsDiasporaCorridorsPage
  }))
);

export const LazySignalEventsCorridorStoriesPage = lazy(() =>
  import("../pages/signal-events/SignalEventsCorridorStoriesPage").then((module) => ({
    default: module.SignalEventsCorridorStoriesPage
  }))
);

export const LazySignalEventsLegacyCitiesPage = lazy(() =>
  import("../pages/signal-events/SignalEventsLegacyCitiesPage").then((module) => ({
    default: module.SignalEventsLegacyCitiesPage
  }))
);

export const LazySignalEventsCityAmbassadorsPage = lazy(() =>
  import("../pages/signal-events/SignalEventsCityAmbassadorsPage").then((module) => ({
    default: module.SignalEventsCityAmbassadorsPage
  }))
);

export const LazySignalEventsGlobalRelationshipMapPage = lazy(() =>
  import("../pages/signal-events/SignalEventsGlobalRelationshipMapPage").then((module) => ({
    default: module.SignalEventsGlobalRelationshipMapPage
  }))
);

export const LazyBamSignalFoundationLandingPage = lazy(() =>
  import("../pages/bam-signal-foundation/BamSignalFoundationLandingPage").then((module) => ({
    default: module.BamSignalFoundationLandingPage
  }))
);

export const LazyBamSignalFoundationProgramsPage = lazy(() =>
  import("../pages/bam-signal-foundation/BamSignalFoundationProgramsPage").then((module) => ({
    default: module.BamSignalFoundationProgramsPage
  }))
);

export const LazyBamSignalFoundationStoriesPage = lazy(() =>
  import("../pages/bam-signal-foundation/BamSignalFoundationStoriesPage").then((module) => ({
    default: module.BamSignalFoundationStoriesPage
  }))
);

export const LazyBamSignalInstituteLandingPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteLandingPage").then((module) => ({
    default: module.BamSignalInstituteLandingPage
  }))
);

export const LazyBamSignalInstituteProgramsPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteProgramsPage").then((module) => ({
    default: module.BamSignalInstituteProgramsPage
  }))
);

export const LazyBamSignalInstituteAnnualInsightsPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteAnnualInsightsPage").then((module) => ({
    default: module.BamSignalInstituteAnnualInsightsPage
  }))
);

export const LazyBamSignalInstituteAnnualRelationshipReportsPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteAnnualRelationshipReportsPage").then(
    (module) => ({
      default: module.BamSignalInstituteAnnualRelationshipReportsPage
    })
  )
);

export const LazyBamSignalInstituteRelationshipLabPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteRelationshipLabPage").then((module) => ({
    default: module.BamSignalInstituteRelationshipLabPage
  }))
);

export const LazyBamSignalInstituteInsightsPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteInsightsPage").then((module) => ({
    default: module.BamSignalInstituteInsightsPage
  }))
);

export const LazyBamSignalInstituteResearchPartnershipsPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteResearchPartnershipsPage").then((module) => ({
    default: module.BamSignalInstituteResearchPartnershipsPage
  }))
);

export const LazyBamSignalInstituteRelationshipIndexPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteRelationshipIndexPage").then((module) => ({
    default: module.BamSignalInstituteRelationshipIndexPage
  }))
);

export const LazyBamSignalInstituteObservatoryPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteObservatoryPage").then((module) => ({
    default: module.BamSignalInstituteObservatoryPage
  }))
);

export const LazyBamSignalInstituteHallOfLegacyPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteHallOfLegacyPage").then((module) => ({
    default: module.BamSignalInstituteHallOfLegacyPage
  }))
);

export const LazyBamSignalInstituteAfricanRelationshipArchivePage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteAfricanRelationshipArchivePage").then(
    (module) => ({
      default: module.BamSignalInstituteAfricanRelationshipArchivePage
    })
  )
);

export const LazyLegalPage = lazy(() =>
  import("../pages/LegalPage").then((module) => ({ default: module.LegalPage }))
);

export const LazyMomentPage = lazy(() =>
  import("../pages/MomentPage").then((module) => ({ default: module.MomentPage }))
);
