import { lazy } from "react";

export const LazyAdminConsoleRoot = lazy(() =>
  import("./AdminConsoleRoot").then((module) => ({ default: module.AdminConsoleRoot }))
);

export const LazyConsultantPortalRoot = lazy(() =>
  import("./ConsultantPortalRoot").then((module) => ({ default: module.ConsultantPortalRoot }))
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

export const LazySignalConciergeDashboardPage = lazy(() =>
  import("../pages/signal-concierge/SignalConciergeDashboardPage").then((module) => ({
    default: module.SignalConciergeDashboardPage
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

export const LazyBamSignalInstituteAcademyPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteAcademyPage").then((module) => ({
    default: module.BamSignalInstituteAcademyPage
  }))
);

export const LazyBamSignalInstituteAcademyProgramsPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteAcademyProgramsPage").then((module) => ({
    default: module.BamSignalInstituteAcademyProgramsPage
  }))
);

export const LazyBamSignalInstituteLearningPathsPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteLearningPathsPage").then((module) => ({
    default: module.BamSignalInstituteLearningPathsPage
  }))
);

export const LazyBamSignalInstituteRelationshipMasterclassesPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteRelationshipMasterclassesPage").then(
    (module) => ({
      default: module.BamSignalInstituteRelationshipMasterclassesPage
    })
  )
);

export const LazyBamSignalInstitutePremaritalJourneyPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstitutePremaritalJourneyPage").then((module) => ({
    default: module.BamSignalInstitutePremaritalJourneyPage
  }))
);

export const LazyBamSignalInstituteLibraryPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteLibraryPage").then((module) => ({
    default: module.BamSignalInstituteLibraryPage
  }))
);

export const LazyBamSignalInstituteRelationshipCertificatesPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteRelationshipCertificatesPage").then(
    (module) => ({
      default: module.BamSignalInstituteRelationshipCertificatesPage
    })
  )
);

export const LazyBamSignalInstituteFellowsPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteFellowsPage").then((module) => ({
    default: module.BamSignalInstituteFellowsPage
  }))
);

export const LazyBamSignalInstituteAfricanRelationshipCurriculumPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteAfricanRelationshipCurriculumPage").then(
    (module) => ({
      default: module.BamSignalInstituteAfricanRelationshipCurriculumPage
    })
  )
);

export const LazyBamSignalInstituteTrustPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteTrustPage").then((module) => ({
    default: module.BamSignalInstituteTrustPage
  }))
);

export const LazyBamSignalInstituteVerifiedProfessionalsPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteVerifiedProfessionalsPage").then(
    (module) => ({
      default: module.BamSignalInstituteVerifiedProfessionalsPage
    })
  )
);

export const LazyBamSignalInstituteRelationshipCoachNetworkPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteRelationshipCoachNetworkPage").then(
    (module) => ({
      default: module.BamSignalInstituteRelationshipCoachNetworkPage
    })
  )
);

export const LazyBamSignalInstituteFamilyAdvisorsPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteFamilyAdvisorsPage").then((module) => ({
    default: module.BamSignalInstituteFamilyAdvisorsPage
  }))
);

export const LazyBamSignalInstituteFaithNetworkPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteFaithNetworkPage").then((module) => ({
    default: module.BamSignalInstituteFaithNetworkPage
  }))
);

export const LazyBamSignalInstituteDiasporaServicesPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteDiasporaServicesPage").then((module) => ({
    default: module.BamSignalInstituteDiasporaServicesPage
  }))
);

export const LazyBamSignalInstituteWeddingNetworkPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteWeddingNetworkPage").then((module) => ({
    default: module.BamSignalInstituteWeddingNetworkPage
  }))
);

export const LazyBamSignalInstituteLifePartnersPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteLifePartnersPage").then((module) => ({
    default: module.BamSignalInstituteLifePartnersPage
  }))
);

export const LazyBamSignalInstituteTrustScorePage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteTrustScorePage").then((module) => ({
    default: module.BamSignalInstituteTrustScorePage
  }))
);

export const LazyBamSignalInstituteTrustMilestonesPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteTrustMilestonesPage").then((module) => ({
    default: module.BamSignalInstituteTrustMilestonesPage
  }))
);

export const LazyBamSignalInstituteLegacyProfessionalsPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteLegacyProfessionalsPage").then(
    (module) => ({
      default: module.BamSignalInstituteLegacyProfessionalsPage
    })
  )
);

export const LazyBamSignalInstituteRelationshipConnectPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteRelationshipConnectPage").then(
    (module) => ({
      default: module.BamSignalInstituteRelationshipConnectPage
    })
  )
);

export const LazyBamSignalInstituteBamSignalSummitPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteBamSignalSummitPage").then((module) => ({
    default: module.BamSignalInstituteBamSignalSummitPage
  }))
);

export const LazyBamSignalInstituteBamSignalHonorsPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteBamSignalHonorsPage").then((module) => ({
    default: module.BamSignalInstituteBamSignalHonorsPage
  }))
);

export const LazyBamSignalInstituteLegacyEndowmentPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteLegacyEndowmentPage").then((module) => ({
    default: module.BamSignalInstituteLegacyEndowmentPage
  }))
);

export const LazyBamSignalInstituteBamSignalMuseumPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteBamSignalMuseumPage").then((module) => ({
    default: module.BamSignalInstituteBamSignalMuseumPage
  }))
);

export const LazyBamSignalInstituteLegacyChairPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteLegacyChairPage").then((module) => ({
    default: module.BamSignalInstituteLegacyChairPage
  }))
);

export const LazyBamSignalInstituteCenturyVisionPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteCenturyVisionPage").then((module) => ({
    default: module.BamSignalInstituteCenturyVisionPage
  }))
);

export const LazyBamSignalInstituteBamSignalHousePage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteBamSignalHousePage").then((module) => ({
    default: module.BamSignalInstituteBamSignalHousePage
  }))
);

export const LazyBamSignalInstituteHouseExperiencesPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteHouseExperiencesPage").then((module) => ({
    default: module.BamSignalInstituteHouseExperiencesPage
  }))
);

export const LazyBamSignalInstituteGreatRoomPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteGreatRoomPage").then((module) => ({
    default: module.BamSignalInstituteGreatRoomPage
  }))
);

export const LazyBamSignalInstituteHouseLibraryPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteHouseLibraryPage").then((module) => ({
    default: module.BamSignalInstituteHouseLibraryPage
  }))
);

export const LazyBamSignalInstituteReflectionRoomPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteReflectionRoomPage").then((module) => ({
    default: module.BamSignalInstituteReflectionRoomPage
  }))
);

export const LazyBamSignalInstituteFamilyTablePage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteFamilyTablePage").then((module) => ({
    default: module.BamSignalInstituteFamilyTablePage
  }))
);

export const LazyBamSignalInstituteBamSignalStudioPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteBamSignalStudioPage").then((module) => ({
    default: module.BamSignalInstituteBamSignalStudioPage
  }))
);

export const LazyBamSignalInstituteLegacyHallPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteLegacyHallPage").then((module) => ({
    default: module.BamSignalInstituteLegacyHallPage
  }))
);

export const LazyBamSignalInstituteLegacyGardenPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteLegacyGardenPage").then((module) => ({
    default: module.BamSignalInstituteLegacyGardenPage
  }))
);

export const LazyBamSignalInstituteRelationshipConnectHousePage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteRelationshipConnectHousePage").then(
    (module) => ({
      default: module.BamSignalInstituteRelationshipConnectHousePage
    })
  )
);

export const LazyBamSignalInstituteBallroomPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteBallroomPage").then((module) => ({
    default: module.BamSignalInstituteBallroomPage
  }))
);

export const LazyBamSignalInstituteHouseMembershipPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteHouseMembershipPage").then((module) => ({
    default: module.BamSignalInstituteHouseMembershipPage
  }))
);

export const LazyBamSignalInstituteHouseResidenciesPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteHouseResidenciesPage").then((module) => ({
    default: module.BamSignalInstituteHouseResidenciesPage
  }))
);

export const LazyBamSignalInstituteHouseFoundationPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteHouseFoundationPage").then((module) => ({
    default: module.BamSignalInstituteHouseFoundationPage
  }))
);

export const LazyBamSignalInstituteHouseMuseumPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteHouseMuseumPage").then((module) => ({
    default: module.BamSignalInstituteHouseMuseumPage
  }))
);

export const LazyBamSignalInstituteHouseAcademyPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteHouseAcademyPage").then((module) => ({
    default: module.BamSignalInstituteHouseAcademyPage
  }))
);

export const LazyBamSignalInstituteHouseInstitutePage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteHouseInstitutePage").then((module) => ({
    default: module.BamSignalInstituteHouseInstitutePage
  }))
);

export const LazyBamSignalInstituteCenturyRoomPage = lazy(() =>
  import("../pages/bam-signal-institute/BamSignalInstituteCenturyRoomPage").then((module) => ({
    default: module.BamSignalInstituteCenturyRoomPage
  }))
);

export const LazyCareersLandingPage = lazy(() =>
  import("../pages/careers/CareersLandingPage").then((module) => ({
    default: module.CareersLandingPage
  }))
);

export const LazyCareersOpenRolesPage = lazy(() =>
  import("../pages/careers/CareersOpenRolesPage").then((module) => ({
    default: module.CareersOpenRolesPage
  }))
);

export const LazyCareersCulturePage = lazy(() =>
  import("../pages/careers/CareersCulturePage").then((module) => ({
    default: module.CareersCulturePage
  }))
);

export const LazyCareersOurValuesPage = lazy(() =>
  import("../pages/careers/CareersOurValuesPage").then((module) => ({
    default: module.CareersOurValuesPage
  }))
);

export const LazyCareersHiringProcessPage = lazy(() =>
  import("../pages/careers/CareersHiringProcessPage").then((module) => ({
    default: module.CareersHiringProcessPage
  }))
);

export const LazyCareersRolePage = lazy(() =>
  import("../pages/careers/CareersRolePage").then((module) => ({
    default: module.CareersRolePage
  }))
);

export const LazyLegalPage = lazy(() =>
  import("../pages/LegalPage").then((module) => ({ default: module.LegalPage }))
);

export const LazyMomentPage = lazy(() =>
  import("../pages/MomentPage").then((module) => ({ default: module.MomentPage }))
);
