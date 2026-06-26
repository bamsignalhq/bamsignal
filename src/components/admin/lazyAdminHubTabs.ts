import { lazy } from "react";

export const LazyConsultantDashboardPage = lazy(() =>
  import("./concierge/ConsultantDashboardPage").then((module) => ({ default: module.ConsultantDashboardPage }))
);
export const LazyOperationsCenterPage = lazy(() =>
  import("./concierge/OperationsCenterPage").then((module) => ({ default: module.OperationsCenterPage }))
);
export const LazyJourneyIntelligencePage = lazy(() =>
  import("./concierge/JourneyIntelligencePage").then((module) => ({ default: module.JourneyIntelligencePage }))
);
export const LazyTalentRecruitingPage = lazy(() =>
  import("./talent/TalentRecruitingPage").then((module) => ({ default: module.TalentRecruitingPage }))
);
export const LazySupportDashboardPage = lazy(() =>
  import("./support/SupportDashboardPage").then((module) => ({ default: module.SupportDashboardPage }))
);
export const LazyNotificationQueuePage = lazy(() =>
  import("./notificationReliability/NotificationQueuePage").then((module) => ({
    default: module.NotificationQueuePage
  }))
);
export const LazySystemHealthPage = lazy(() =>
  import("./systemHealth/SystemHealthPage").then((module) => ({ default: module.SystemHealthPage }))
);
export const LazyInstitutionalComplianceCenterPage = lazy(() =>
  import("./compliance/InstitutionalComplianceCenterPage").then((module) => ({
    default: module.InstitutionalComplianceCenterPage
  }))
);
export const LazyAuditComplianceCenterPage = lazy(() =>
  import("./audit/AuditComplianceCenterPage").then((module) => ({ default: module.AuditComplianceCenterPage }))
);
export const LazyRouteAuditPage = lazy(() =>
  import("./routeAudit/RouteAuditPage").then((module) => ({ default: module.RouteAuditPage }))
);
export const LazyDatabaseAuditPage = lazy(() =>
  import("./databaseAudit/DatabaseAuditPage").then((module) => ({ default: module.DatabaseAuditPage }))
);
export const LazyPermissionsAuditPage = lazy(() =>
  import("./permissionsAudit/PermissionsAuditPage").then((module) => ({ default: module.PermissionsAuditPage }))
);
export const LazyJourneyIntegrityAuditPage = lazy(() =>
  import("./journeyAudit/JourneyIntegrityAuditPage").then((module) => ({
    default: module.JourneyIntegrityAuditPage
  }))
);
export const LazyLaunchReadinessCommandCenterPage = lazy(() =>
  import("./launchReadiness/LaunchReadinessCommandCenterPage").then((module) => ({
    default: module.LaunchReadinessCommandCenterPage
  }))
);
export const LazyLaunchControlCenterPage = lazy(() =>
  import("./launchControl/LaunchControlCenterPage").then((module) => ({
    default: module.LaunchControlCenterPage
  }))
);
export const LazyPerformanceCenterPage = lazy(() =>
  import("./performance/PerformanceCenterPage").then((module) => ({ default: module.PerformanceCenterPage }))
);
export const LazyWorkflowEnginePage = lazy(() =>
  import("./workflows/WorkflowEnginePage").then((module) => ({ default: module.WorkflowEnginePage }))
);
export const LazySecurityDashboard = lazy(() =>
  import("./security/SecurityDashboard").then((module) => ({ default: module.SecurityDashboard }))
);
export const LazyUxConsistencyDashboard = lazy(() =>
  import("./uxConsistency/UxConsistencyDashboard").then((module) => ({ default: module.UxConsistencyDashboard }))
);
export const LazyProductionPerformanceDashboard = lazy(() =>
  import("./performanceOptimization/ProductionPerformanceDashboard").then((module) => ({
    default: module.ProductionPerformanceDashboard
  }))
);
export const LazyLaunchCertificationDashboard = lazy(() =>
  import("./launchCertification/LaunchCertificationDashboard").then((module) => ({
    default: module.LaunchCertificationDashboard
  }))
);
export const LazyEnterpriseCodebaseCleanupDashboard = lazy(() =>
  import("./enterpriseCodebaseCleanup/EnterpriseCodebaseCleanupDashboard").then((module) => ({
    default: module.EnterpriseCodebaseCleanupDashboard
  }))
);
export const LazyProductionEnvironmentDashboard = lazy(() =>
  import("./productionEnvironment/ProductionEnvironmentDashboard").then((module) => ({
    default: module.ProductionEnvironmentDashboard
  }))
);
export const LazyLaunchInfrastructureDashboard = lazy(() =>
  import("./launchInfrastructure/LaunchInfrastructureDashboard").then((module) => ({
    default: module.LaunchInfrastructureDashboard
  }))
);
export const LazyFounderAcceptanceDashboard = lazy(() =>
  import("./founderAcceptance/FounderAcceptanceDashboard").then((module) => ({
    default: module.FounderAcceptanceDashboard
  }))
);
export const LazyProductionObservabilityPage = lazy(() =>
  import("./observability/ProductionObservabilityPage").then((module) => ({
    default: module.ProductionObservabilityPage
  }))
);
export const LazyFeatureFlagPlatformPage = lazy(() =>
  import("./featureFlags/FeatureFlagPlatformPage").then((module) => ({
    default: module.FeatureFlagPlatformPage
  }))
);
export const LazyPlatformHealthCenterPage = lazy(() =>
  import("./platformHealth/PlatformHealthCenterPage").then((module) => ({
    default: module.PlatformHealthCenterPage
  }))
);
export const LazyReportingCenterPage = lazy(() =>
  import("./reporting/ReportingCenterPage").then((module) => ({ default: module.ReportingCenterPage }))
);
export const LazyRemediationBoardPage = lazy(() =>
  import("./remediationBoard/RemediationBoardPage").then((module) => ({ default: module.RemediationBoardPage }))
);
export const LazyReadinessPage = lazy(() =>
  import("./institutionalReadiness/ReadinessPage").then((module) => ({ default: module.ReadinessPage }))
);
export const LazyIntegrityDashboard = lazy(() =>
  import("./dataIntegrity/IntegrityDashboard").then((module) => ({ default: module.IntegrityDashboard }))
);
export const LazyDocumentCenterPage = lazy(() =>
  import("./documents/DocumentCenterPage").then((module) => ({ default: module.DocumentCenterPage }))
);
export const LazyInstitutionalPoliciesPage = lazy(() =>
  import("./documents/InstitutionalPoliciesPage").then((module) => ({
    default: module.InstitutionalPoliciesPage
  }))
);
export const LazySafetyDashboardPage = lazy(() =>
  import("./safety/SafetyDashboardPage").then((module) => ({ default: module.SafetyDashboardPage }))
);
export const LazyConsultantAcademyPage = lazy(() =>
  import("./academy/ConsultantAcademyPage").then((module) => ({ default: module.ConsultantAcademyPage }))
);
export const LazyConsultantQualityPage = lazy(() =>
  import("./quality/ConsultantQualityPage").then((module) => ({ default: module.ConsultantQualityPage }))
);
export const LazyFinanceOperationsPage = lazy(() =>
  import("./finance/FinanceOperationsPage").then((module) => ({ default: module.FinanceOperationsPage }))
);
export const LazyMessagingDashboardPage = lazy(() =>
  import("./messages/MessagingDashboardPage").then((module) => ({ default: module.MessagingDashboardPage }))
);
export const LazyRecoveryDashboardPage = lazy(() =>
  import("./recovery/RecoveryDashboardPage").then((module) => ({ default: module.RecoveryDashboardPage }))
);
export const LazyExecutiveDashboardPage = lazy(() =>
  import("./executive/ExecutiveDashboardPage").then((module) => ({ default: module.ExecutiveDashboardPage }))
);
export const LazyInstitutionalGovernancePage = lazy(() =>
  import("./governance/InstitutionalGovernancePage").then((module) => ({
    default: module.InstitutionalGovernancePage
  }))
);
export const LazyWorkforceManagementPage = lazy(() =>
  import("./workforce/WorkforceManagementPage").then((module) => ({
    default: module.WorkforceManagementPage
  }))
);
export const LazyBusinessContinuityPage = lazy(() =>
  import("./businessContinuity/BusinessContinuityPage").then((module) => ({
    default: module.BusinessContinuityPage
  }))
);
export const LazyConfigurationPlatformPage = lazy(() =>
  import("./configuration/ConfigurationPlatformPage").then((module) => ({
    default: module.ConfigurationPlatformPage
  }))
);
export const LazyMonitoringCenterPage = lazy(() =>
  import("./monitoring/MonitoringCenterPage").then((module) => ({ default: module.MonitoringCenterPage }))
);
export const LazyDataGovernanceCenterPage = lazy(() =>
  import("./dataGovernance/DataGovernanceCenterPage").then((module) => ({
    default: module.DataGovernanceCenterPage
  }))
);
export const LazyApiPlatformPage = lazy(() =>
  import("./apiPlatform/ApiPlatformPage").then((module) => ({ default: module.ApiPlatformPage }))
);
export const LazyAdminPricingPage = lazy(() =>
  import("../../pages/AdminPricingPage").then((module) => ({ default: module.AdminPricingPage }))
);
