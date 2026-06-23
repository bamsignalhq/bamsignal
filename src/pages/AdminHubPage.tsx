import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_CMS, getCms, saveCms, type CmsContent } from "../constants/cms";
import {
  DEFAULT_DISCOVER_CITY_CONFIG,
  DISCOVER_SUPPORTED_CITIES,
  getDiscoverCityConfig,
  saveDiscoverCityConfig,
  type DiscoverCityConfig
} from "../constants/discoverCityConfig";
import { LAUNCH_PRIMARY_CITIES } from "../constants/seedCities";
import { STORAGE_KEYS } from "../constants/limits";
import { AdminPricingPage } from "./AdminPricingPage";
import {
  fetchVerificationSubmissions,
  reviewVerificationSubmission,
  type ServerVerificationSubmission
} from "../services/adminVerification";
import {
  getPendingVerifications,
  pendingCount,
  verificationStats
} from "../utils/verificationQueue";
import { countEvent, countEventToday, dailyActiveUsersToday } from "../utils/analytics";
import {
  cityLeaderboard,
  dauByCity,
  fastestGrowingCity,
  mostActiveCityToday,
  premiumRevenueByCity,
  profileCompletionByCity,
  signalsByCity,
  topCityByEvent,
  usersByCity
} from "../utils/cityAnalytics";
import { getLaunchLeads } from "../utils/launchLeads";
import { readJson } from "../utils/storage";
import { hardPathForTab, parseAuditAdminViewFromPath, parseConciergeAdminViewFromPath, parseHardTabFromPath } from "../constants/hardRoutes";
import { HARD_AUTH_PATH, navigateToPath, normalizePath } from "../constants/routes";
import { DEMO_USER } from "../constants/demoAccounts";
import { filterModerationQueue, getModerationQueue, moderationStats, type ReportFilter } from "../utils/moderationQueue";
import { AdminShadowBannedSection } from "../components/admin/AdminShadowBannedSection";
import {
  approvePhotoReviewAdmin,
  deletePhotoReviewAdmin,
  fetchAdminReports,
  fetchContactLeakAttempts,
  fetchPhotoReviews,
  fetchHiddenPhotoReviews,
  hidePhotoReviewAdmin,
  restorePhotoReviewAdmin,
  shadowBanAdmin,
  type AdminReportRow,
  type ContactLeakAttempt,
  type PhotoReviewItem
} from "../services/adminModeration";
import { fetchContactExchangeMetricsAdmin, fetchAuditTrailAdmin, fetchSpamSuspectsAdmin } from "../services/subscriptionCatalog";
import { CONTACT_LEAK_BLOCK_MESSAGE, validateUserText } from "../utils/contactGuard";
import { liftShadowBan, memberShadowKey, shadowBanId } from "../utils/shadowBan";
import {
  fetchAdminCityMembers,
  setAdminCityHomeHidden,
  setAdminCityPlacement,
  type CityHomeMember
} from "../services/cityHome";
import { CITIES_VISUAL } from "../data/visualLanding";
import { AdminBusinessDashboard } from "../components/admin/AdminBusinessDashboard";
import { AdminHomeFeedAdsPanel } from "../components/admin/AdminHomeFeedAdsPanel";
import { AdminSeedingTools } from "../components/admin/AdminSeedingTools";
import { getLaunchConfig, saveLaunchConfig } from "../utils/launchConfig";
import {
  DEFAULT_EMAIL_BRANDING,
  type EmailBrandingSettings
} from "../constants/emailBranding";
import { getTrustAnalyticsSummary } from "../utils/trustAnalytics";
import { getPhotoRejectionMetrics, totalPhotoRejectionsToday } from "../utils/photoRejectionMetrics";
import { riskFlagLabel, photoReviewLabel } from "../utils/photoMeta";
import { reportReasonLabel } from "../constants/safety";
import { fetchEmailBranding, saveEmailBrandingAdmin } from "../services/emailBranding";
import {
  fetchAdminMemberAuditTrail,
  fetchAdminMemberCompliance,
  purgeAdminMember,
  repairAdminMemberOnboarding,
  searchAdminMembers,
  type AdminAuditLogRow,
  type AdminMemberCompliance,
  type AdminMemberSummary
} from "../services/adminMembers";
import { ConsultantDashboardPage } from "../components/admin/concierge/ConsultantDashboardPage";
import { OperationsCenterPage } from "../components/admin/concierge/OperationsCenterPage";
import { TalentRecruitingPage } from "../components/admin/talent/TalentRecruitingPage";
import { SupportCenterAdminPage } from "../components/admin/support/SupportCenterAdminPage";
import { NotificationQueuePage } from "../components/admin/notificationReliability/NotificationQueuePage";
import { SystemHealthPage } from "../components/admin/systemHealth/SystemHealthPage";
import { InstitutionalComplianceCenterPage } from "../components/admin/compliance/InstitutionalComplianceCenterPage";
import { AuditComplianceCenterPage } from "../components/admin/audit/AuditComplianceCenterPage";
import { RouteAuditPage } from "../components/admin/routeAudit/RouteAuditPage";
import { DatabaseAuditPage } from "../components/admin/databaseAudit/DatabaseAuditPage";
import { PermissionsAuditPage } from "../components/admin/permissionsAudit/PermissionsAuditPage";
import { JourneyIntegrityAuditPage } from "../components/admin/journeyAudit/JourneyIntegrityAuditPage";
import { LaunchReadinessCommandCenterPage } from "../components/admin/launchReadiness/LaunchReadinessCommandCenterPage";
import { RemediationBoardPage } from "../components/admin/remediationBoard/RemediationBoardPage";
import { DocumentCenterPage } from "../components/admin/documents/DocumentCenterPage";
import { SafetyCenterPage } from "../components/admin/safety/SafetyCenterPage";
import { ConsultantAcademyPage } from "../components/admin/academy/ConsultantAcademyPage";
import { ConsultantQualityPage } from "../components/admin/quality/ConsultantQualityPage";
import { FinanceOperationsPage } from "../components/admin/finance/FinanceOperationsPage";
import { InternalMessagingPage } from "../components/admin/messages/InternalMessagingPage";
import { ExecutiveDashboardPage } from "../components/admin/executive/ExecutiveDashboardPage";
import { JourneyIntelligencePage } from "../components/admin/concierge/JourneyIntelligencePage";
import { AdminCommandDock } from "../components/admin/AdminCommandDock";
import { AdminConsoleTopBar } from "../components/admin/AdminConsoleTopBar";
import { AdminTerminalEmpty } from "../components/admin/AdminTerminalEmpty";
import { RequirePermission } from "../components/admin/RequirePermission";
import { useAdminToast } from "../components/admin/AdminToast";
import { AdminSecurityPanel, useAdminConsent } from "../components/admin/AdminConsentProvider";
import { AdminAuthPage } from "./AdminAuthPage";
import { HARD_TAB_TITLES, type HardTab } from "../components/admin/adminConsoleNav";
import {
  exitHardSession,
  handleAdminSessionExpired,
  restoreHardRouteOnLoad,
  saveHardLastRoute,
  validateHardSession
} from "../utils/adminSession";
import { supabase } from "../services/supabase";

type AdminHubPageProps = {
  onLogout: () => void;
};

export function AdminHubPage({ onLogout }: AdminHubPageProps) {
  const { pushToast } = useAdminToast();
  const { ensureConsent } = useAdminConsent();
  const [tab, setTab] = useState<HardTab>(() => restoreHardRouteOnLoad());
  const [conciergeView, setConciergeView] = useState(() => parseConciergeAdminViewFromPath());
  const [auditView, setAuditView] = useState(() => parseAuditAdminViewFromPath());
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [dockOpen, setDockOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const securityRef = useRef<HTMLElement | null>(null);
  const [cmsDraft, setCmsDraft] = useState<CmsContent>(() => getCms());
  const [cmsMessage, setCmsMessage] = useState("");
  const [discoverDraft, setDiscoverDraft] = useState<DiscoverCityConfig>(() => getDiscoverCityConfig());
  const [rejectReason, setRejectReason] = useState("");
  const [serverVerifications, setServerVerifications] = useState<ServerVerificationSubmission[]>([]);
  const [localVerifications] = useState(getPendingVerifications());
  const [leads, setLeads] = useState(getLaunchLeads());
  const [moderation, setModeration] = useState(getModerationQueue());
  const [adminReports, setAdminReports] = useState<AdminReportRow[]>([]);
  const [adminReportsLoading, setAdminReportsLoading] = useState(false);
  const [reportFilter, setReportFilter] = useState<ReportFilter>("all");
  const [verificationFilter, setVerificationFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const modStats = moderationStats();
  const verifyStats = verificationStats();
  const pendingVerificationCount =
    serverVerifications.filter((v) => v.status === "pending").length || pendingCount();
  const trustMetrics = getTrustAnalyticsSummary();
  const photoRejectionMetrics = getPhotoRejectionMetrics();
  const photoRejectionsToday = totalPhotoRejectionsToday();
  const [cityHomeCity, setCityHomeCity] = useState(CITIES_VISUAL[0]?.name || "Lagos");
  const [cityHomeMembers, setCityHomeMembers] = useState<CityHomeMember[]>([]);
  const [cityHomeLoading, setCityHomeLoading] = useState(false);
  const [cityHomeMessage, setCityHomeMessage] = useState("");
  const [seedMessage, setSeedMessage] = useState("");
  const [emailBrandingDraft, setEmailBrandingDraft] = useState<EmailBrandingSettings>(DEFAULT_EMAIL_BRANDING);
  const [emailBrandingMessage, setEmailBrandingMessage] = useState("");
  const [adsMessage, setAdsMessage] = useState("");
  const launchConfig = getLaunchConfig();
  const [memberSearch, setMemberSearch] = useState("");
  const [memberResults, setMemberResults] = useState<AdminMemberSummary[]>([]);
  const [memberSearchBusy, setMemberSearchBusy] = useState(false);
  const [memberSearchMessage, setMemberSearchMessage] = useState("");
  const [purgeTarget, setPurgeTarget] = useState<AdminMemberSummary | null>(null);
  const [purgeConfirm, setPurgeConfirm] = useState("");
  const [purgeBusy, setPurgeBusy] = useState(false);
  const [purgeMessage, setPurgeMessage] = useState("");
  const [memberDetail, setMemberDetail] = useState<AdminMemberSummary | null>(null);
  const [memberCompliance, setMemberCompliance] = useState<AdminMemberCompliance | null>(null);
  const [memberAuditRows, setMemberAuditRows] = useState<AdminAuditLogRow[]>([]);
  const [memberAuditOpen, setMemberAuditOpen] = useState(false);
  const [memberComplianceBusy, setMemberComplianceBusy] = useState(false);
  const [memberRepairBusy, setMemberRepairBusy] = useState(false);
  const [contactLeaks, setContactLeaks] = useState<ContactLeakAttempt[]>([]);
  const [contactLeaksLoading, setContactLeaksLoading] = useState(false);
  const [photoReviews, setPhotoReviews] = useState<PhotoReviewItem[]>([]);
  const [hiddenPhotoReviews, setHiddenPhotoReviews] = useState<PhotoReviewItem[]>([]);
  const [photoReviewsLoading, setPhotoReviewsLoading] = useState(false);
  const [photoReviewBusyId, setPhotoReviewBusyId] = useState<string | null>(null);
  const [photoRejectReason, setPhotoRejectReason] = useState("");
  const [exchangeMetrics, setExchangeMetrics] = useState<{
    totals: Record<string, number>;
    windows?: Record<string, Record<string, number>>;
    recent: Array<Record<string, unknown>>;
    audit?: Array<Record<string, unknown>>;
  } | null>(null);
  const [exchangeMetricsLoading, setExchangeMetricsLoading] = useState(false);
  const [auditRows, setAuditRows] = useState<Array<Record<string, unknown>>>([]);
  const [spamSuspects, setSpamSuspects] = useState<Array<Record<string, unknown>>>([]);

  const handleTabChange = useCallback((id: HardTab) => {
    setTab(id);
    const path = hardPathForTab(id);
    saveHardLastRoute(path);
    if (normalizePath(window.location.pathname) !== path) {
      navigateToPath(path);
    }
    setDockOpen(false);
    if (id === "leads") setLeads(getLaunchLeads());
    if (id === "command") setModeration(getModerationQueue());
  }, []);

  const handleLogout = async () => {
    await exitHardSession();
    navigateToPath(HARD_AUTH_PATH);
    onLogout();
  };

  const shadowBanFromReport = async (profileId: string, reason: string) => {
    if (!(await ensureConsent("Confirm shadow ban for this member."))) {
      pushToast("Console PIN required.");
      return;
    }
    const result = await shadowBanAdmin(
      profileId,
      `Shadow ban after report: ${reportReasonLabel(reason as import("../types").ReportReason)}`
    );
    if (!result.ok) {
      pushToast(result.error);
      return;
    }
    shadowBanId(profileId);
    setModeration(getModerationQueue());
    setAdminReports((rows) =>
      rows.map((row) =>
        row.profileId === profileId ? { ...row, shadowBanned: true, status: "action_taken" as const } : row
      )
    );
    pushToast("Member shadow banned.");
  };

  const loadVerifications = useCallback(async () => {
    const result = await fetchVerificationSubmissions(verificationFilter);
    if (!result.ok) {
      pushToast(result.error);
      setServerVerifications([]);
      return;
    }
    setServerVerifications(result.data.submissions ?? []);
  }, [pushToast, verificationFilter]);

  const loadCityHomeMembers = async (city = cityHomeCity) => {
    setCityHomeLoading(true);
    setCityHomeMessage("");
    try {
      const data = await fetchAdminCityMembers(city);
      if (!data) {
        const message = "No city data available.";
        pushToast("Could not load city members.");
        setCityHomeMessage(message);
        setCityHomeMembers([]);
        return;
      }
      setCityHomeMembers(data.members);
    } finally {
      setCityHomeLoading(false);
    }
  };

  useEffect(() => {
    if (tab !== "email" || !authorized) return;
    void fetchEmailBranding().then(setEmailBrandingDraft);
  }, [tab, authorized]);

  useEffect(() => {
    if (tab !== "cityhome" || !authorized) return;
    void loadCityHomeMembers(cityHomeCity);
  }, [tab, authorized, cityHomeCity]);

  useEffect(() => {
    if (tab !== "command" || !authorized) return;
    setContactLeaksLoading(true);
    setExchangeMetricsLoading(true);
    void fetchContactLeakAttempts(50)
      .then((result) => {
        if (result.ok) setContactLeaks(result.attempts);
      })
      .finally(() => setContactLeaksLoading(false));
    setPhotoReviewsLoading(true);
    void Promise.all([fetchPhotoReviews(50), fetchHiddenPhotoReviews(50)])
      .then(([pending, hidden]) => {
        if (pending.ok) setPhotoReviews(pending.reviews);
        if (hidden.ok) setHiddenPhotoReviews(hidden.reviews);
      })
      .finally(() => setPhotoReviewsLoading(false));
    void fetchContactExchangeMetricsAdmin(50)
      .then((result) => {
        if (result?.ok && result.metrics) setExchangeMetrics(result.metrics);
      })
      .finally(() => setExchangeMetricsLoading(false));
    void fetchAuditTrailAdmin({ limit: 30 }).then((result) => {
      if (result?.ok && result.rows) setAuditRows(result.rows);
    });
    void fetchSpamSuspectsAdmin(20).then((result) => {
      if (result?.ok && result.suspects) setSpamSuspects(result.suspects);
    });
  }, [tab, authorized]);

  useEffect(() => {
    if (tab !== "reports" || !authorized) return;
    setAdminReportsLoading(true);
    void fetchAdminReports(200)
      .then((result) => {
        if (result.ok) {
          setAdminReports(result.reports);
          return;
        }
        setModeration(getModerationQueue());
      })
      .finally(() => setAdminReportsLoading(false));
  }, [tab, authorized]);

  useEffect(() => {
    if (tab !== "verifications" || !authorized) return;
    void loadVerifications();
  }, [tab, authorized, loadVerifications]);

  useEffect(() => {
    const onPop = () => {
      const fromUrl = parseHardTabFromPath();
      if (fromUrl) setTab(fromUrl);
      setConciergeView(parseConciergeAdminViewFromPath());
      setAuditView(parseAuditAdminViewFromPath());
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const path = hardPathForTab(tab);
    saveHardLastRoute(path);
  }, [tab]);

  useEffect(() => {
    const onAdminBack = (event: Event) => {
      if (purgeTarget) {
        event.preventDefault();
        setPurgeTarget(null);
        setPurgeConfirm("");
        return;
      }
      if (dockOpen) {
        event.preventDefault();
        setDockOpen(false);
      }
    };
    window.addEventListener("bamsignal:admin-back", onAdminBack);
    return () => window.removeEventListener("bamsignal:admin-back", onAdminBack);
  }, [purgeTarget, dockOpen]);

  useEffect(() => {
    let cancelled = false;
    void validateHardSession().then((ok) => {
      if (cancelled) return;
      setAuthorized(ok);
      if (!ok) {
        window.setTimeout(() => {
          void handleAdminSessionExpired(onLogout);
        }, 900);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [onLogout]);

  useEffect(() => {
    if (!supabase || authorized !== true) return;
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session?.access_token) {
        setAuthorized(false);
        void handleAdminSessionExpired(onLogout);
        return;
      }
      if (event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        void validateHardSession().then((ok) => {
          if (!ok) {
            setAuthorized(false);
            void handleAdminSessionExpired(onLogout);
          }
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [authorized, onLogout]);

  if (authorized === null) {
    return (
      <div className="admin-console page admin-page">
        <AdminTerminalEmpty>Authenticating…</AdminTerminalEmpty>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="admin-console page admin-page">
        <AdminTerminalEmpty>Session expired. Please sign in again.</AdminTerminalEmpty>
      </div>
    );
  }

  if (passwordOpen) {
    return (
      <AdminAuthPage
        allowPasswordChange
        onAuthed={() => setPasswordOpen(false)}
        onBack={() => {}}
        onPasswordChanged={() => setPasswordOpen(false)}
      />
    );
  }

  const blocked = readJson<string[]>(STORAGE_KEYS.blocked, []).length;
  const reports = readJson<unknown[]>(STORAGE_KEYS.reports, []).length;

  const dayMs = 24 * 60 * 60 * 1000;
  const signalsTodayByCity = signalsByCity(dayMs);
  const premiumTodayByCity = premiumRevenueByCity(dayMs);

  const cityHighlights = [
    { label: "Top city (signups)", value: topCityByEvent("signup_completed") },
    { label: "Most active city today", value: mostActiveCityToday() },
    { label: "Fastest growing (7d)", value: fastestGrowingCity() }
  ];

  const successMetrics = [
    { label: "New users today", value: countEventToday("signup_completed") },
    { label: "Profiles completed today", value: countEventToday("profile_completed") },
    { label: "Signals sent today", value: countEventToday("signal_sent") },
    { label: "Signals accepted today", value: countEventToday("signal_accepted") },
    { label: "Messages started today", value: countEventToday("message_started") },
    { label: "Premium upgrades today", value: countEventToday("payment_successful") },
    { label: "Daily active users", value: dailyActiveUsersToday() },
    { label: "Waitlist leads", value: leads.length }
  ];

  const stats = [
    ...successMetrics,
    { label: "Total signups", value: countEvent("signup_completed") },
    { label: "Total signals sent", value: countEvent("signal_sent") },
    { label: "Profile views", value: countEvent("profile_viewed") },
    { label: "Reports", value: reports },
    { label: "Blocked users", value: blocked },
    { label: "Pending verifications", value: pendingVerificationCount }
  ];

  return (
    <RequirePermission>
    <div className="admin-console">
      <AdminConsoleTopBar
        onLogout={() => void handleLogout()}
        onOpenDock={() => setDockOpen(true)}
        onChangePassword={() => setPasswordOpen(true)}
        onOpenSecurity={() => {
          handleTabChange("command");
          window.setTimeout(() => {
            securityRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 50);
        }}
      />
      <div className="admin-console__body">
        <main className="admin-console__main">
          <header className="admin-console__view-header">
            <h1 className="admin-console__view-title">{HARD_TAB_TITLES[tab]}</h1>
            {tab === "command" && (
              <p className="admin-console__view-desc">
                Live moderation queue, trust metrics, and operational snapshot.
              </p>
            )}
          </header>

      {tab === "command" && (
        <>
          <section className="admin-stats-grid admin-stats-grid--highlight admin-command-stats">
            <div className="card admin-stat admin-stat--highlight">
              <strong>{modStats.flaggedProfiles}</strong>
              <span>Flagged (3+ reports)</span>
            </div>
            <div className="card admin-stat admin-stat--highlight">
              <strong>{modStats.pendingReview}</strong>
              <span>Awaiting shadow ban</span>
            </div>
            <div className="card admin-stat admin-stat--highlight">
              <strong>{modStats.shadowBanned}</strong>
              <span>Shadow banned</span>
            </div>
            <div className="card admin-stat admin-stat--highlight">
              <strong>{modStats.totalReports}</strong>
              <span>Total reports</span>
            </div>
          </section>

          <section className="admin-stats-grid admin-stats-grid--highlight">
            {trustMetrics.map((item) => (
              <div key={item.label} className="card admin-stat admin-stat--highlight">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </section>

          <section className="card admin-command-panel">
            <h3>Contact leak attempts</h3>
            <p className="match-prefs-note">
              Blocked contact-info patterns in user text. Only hashed snippets are stored — never full
              offending text.
            </p>
            {contactLeaksLoading && <AdminTerminalEmpty>Loading contact leak attempts…</AdminTerminalEmpty>}
            {!contactLeaksLoading && contactLeaks.length === 0 && (
              <AdminTerminalEmpty>No contact leak attempts logged yet.</AdminTerminalEmpty>
            )}
            {contactLeaks.map((attempt) => (
              <article key={attempt.id} className="card admin-moderation-row">
                <div className="admin-moderation-row__main">
                  <strong>{attempt.name || attempt.username || attempt.user_key}</strong>
                  <span>
                    {attempt.field} · hash {attempt.text_hash} ·{" "}
                    {new Date(attempt.created_at).toLocaleString()}
                  </span>
                </div>
              </article>
            ))}
          </section>

          <section className="card admin-command-panel">
            <h3>Photo review</h3>
            <p className="match-prefs-note">
              Uploads are saved first and queued here for review. Approve to keep a photo public, hide
              to remove it from discovery without deleting the original, or delete to purge storage.
            </p>
            {photoReviewsLoading && <AdminTerminalEmpty>Loading photo review queue…</AdminTerminalEmpty>}
            {!photoReviewsLoading && photoReviews.length === 0 && (
              <AdminTerminalEmpty>No photos pending review.</AdminTerminalEmpty>
            )}
            {photoReviews.map((item) => (
              <article key={item.id} className="card admin-moderation-row admin-photo-review-row">
                <div className="admin-moderation-row__main">
                  <img src={item.photoUrl} alt="" className="admin-photo-review-row__thumb" />
                  <div>
                    <strong>
                      {item.unattributed ? "Unattributed" : item.memberName}
                      {item.unattributed ? " (missing profile/user link)" : null}
                    </strong>
                    <span>
                      {item.profileId ? `Profile ${item.profileId.slice(0, 8)}…` : "No profile id"}
                      {item.userKey ? ` · ${item.userKey}` : " · No user key"} ·{" "}
                      {photoReviewLabel(item.photoReviewStatus as never)} · {item.photoType} ·{" "}
                      {item.photoRiskFlags.map((flag) => riskFlagLabel(flag as never)).join(", ") || "No flags"}
                      {item.rejectReason ? ` · ${item.rejectReason}` : ""} ·{" "}
                      {item.photoViolationCount ? `${item.photoViolationCount} unhealthy upload${item.photoViolationCount === 1 ? "" : "s"}` : "First flag"} ·{" "}
                      {new Date(item.uploadedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="admin-moderation-row__actions">
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="Hide reason (optional)"
                    value={photoReviewBusyId === item.id ? photoRejectReason : ""}
                    onChange={(e) => {
                      setPhotoReviewBusyId(item.id);
                      setPhotoRejectReason(e.target.value);
                    }}
                  />
                  <button
                    type="button"
                    className="btn-secondary btn-sm"
                    disabled={photoReviewBusyId === item.id && photoReviewsLoading}
                    onClick={async () => {
                      setPhotoReviewBusyId(item.id);
                      const result = await approvePhotoReviewAdmin(item.id);
                      if (!result.ok) {
                        pushToast(result.error || "Approve failed.");
                        return;
                      }
                      pushToast("Photo approved.");
                      setPhotoReviews((rows) => rows.filter((row) => row.id !== item.id));
                    }}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="btn-secondary btn-sm"
                    disabled={photoReviewBusyId === item.id && photoReviewsLoading}
                    onClick={async () => {
                      setPhotoReviewBusyId(item.id);
                      const result = await deletePhotoReviewAdmin(
                        item.id,
                        photoRejectReason || "Deleted instantly by moderator"
                      );
                      if (!result.ok) {
                        pushToast(result.error || "Delete failed.");
                        return;
                      }
                      pushToast("Photo deleted.");
                      setPhotoRejectReason("");
                      setPhotoReviews((rows) => rows.filter((row) => row.id !== item.id));
                    }}
                  >
                    Delete now
                  </button>
                  <button
                    type="button"
                    className="btn-secondary btn-sm"
                    disabled={photoReviewBusyId === item.id && photoReviewsLoading}
                    onClick={async () => {
                      setPhotoReviewBusyId(item.id);
                      const result = await hidePhotoReviewAdmin(item.id, photoRejectReason);
                      if (!result.ok) {
                        pushToast(result.error || "Hide failed.");
                        return;
                      }
                      pushToast("Photo hidden.");
                      setPhotoRejectReason("");
                      setPhotoReviews((rows) => rows.filter((row) => row.id !== item.id));
                    }}
                  >
                    Hide
                  </button>
                </div>
              </article>
            ))}

            {!photoReviewsLoading && hiddenPhotoReviews.length > 0 && (
              <>
                <h4 className="admin-subsection-title">Hidden photos</h4>
                {hiddenPhotoReviews.map((item) => (
                  <article key={item.id} className="card admin-moderation-row admin-photo-review-row">
                    <div className="admin-moderation-row__main">
                      <img src={item.photoUrl} alt="" className="admin-photo-review-row__thumb" />
                      <div>
                        <strong>
                          {item.unattributed ? "Unattributed" : item.memberName}
                          {item.unattributed ? " (missing profile/user link)" : null}
                        </strong>
                        <span>
                          {item.profileId ? `Profile ${item.profileId.slice(0, 8)}…` : "No profile id"}
                          {item.userKey ? ` · ${item.userKey}` : " · No user key"} ·{" "}
                          {photoReviewLabel(item.photoReviewStatus as never)} · {item.photoType} ·{" "}
                          {item.rejectReason || "Hidden by moderator"} ·{" "}
                          {new Date(item.uploadedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="admin-moderation-row__actions">
                      <button
                        type="button"
                        className="btn-secondary btn-sm"
                        disabled={photoReviewBusyId === item.id && photoReviewsLoading}
                        onClick={async () => {
                          setPhotoReviewBusyId(item.id);
                          const result = await restorePhotoReviewAdmin(item.id);
                          if (!result.ok) {
                            pushToast(result.error || "Restore failed.");
                            return;
                          }
                          pushToast("Photo restored.");
                          setHiddenPhotoReviews((rows) => rows.filter((row) => row.id !== item.id));
                        }}
                      >
                        Restore
                      </button>
                    </div>
                  </article>
                ))}
              </>
            )}
          </section>

          <section className="card admin-command-panel">
            <h3>Hard upload blocks (local)</h3>
            <p className="match-prefs-note">
              Client-side hard blocks for contact info and documents in filenames. Weak signals are
              flagged for review instead.
            </p>
            <div className="admin-stats-grid admin-stats-grid--highlight">
              <div className="card admin-stat admin-stat--highlight">
                <strong>{photoRejectionsToday}</strong>
                <span>Rejected today</span>
              </div>
              {photoRejectionMetrics.map((row) => (
                <div key={row.category} className="card admin-stat admin-stat--highlight">
                  <strong>{row.today}</strong>
                  <span>
                    {row.label} today ({row.total} total)
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="card admin-command-panel">
            <h3>Contact exchange metrics</h3>
            <p className="match-prefs-note">
              Mutual consent flow — requests, accepts, declines, and completed exchanges.
            </p>
            {exchangeMetricsLoading && <AdminTerminalEmpty>Loading contact exchange metrics…</AdminTerminalEmpty>}
            {!exchangeMetricsLoading && exchangeMetrics && (
              <>
                <div className="admin-stats-grid admin-stats-grid--highlight">
                  <div className="card admin-stat admin-stat--highlight">
                    <strong>{exchangeMetrics.totals.exchange_requested || 0}</strong>
                    <span>Requests (all time)</span>
                  </div>
                  <div className="card admin-stat admin-stat--highlight">
                    <strong>{exchangeMetrics.totals.exchange_accepted || 0}</strong>
                    <span>Accepted</span>
                  </div>
                  <div className="card admin-stat admin-stat--highlight">
                    <strong>{exchangeMetrics.totals.exchange_declined || 0}</strong>
                    <span>Declined</span>
                  </div>
                  <div className="card admin-stat admin-stat--highlight">
                    <strong>
                      {exchangeMetrics.totals.contact_request_expired ||
                        exchangeMetrics.totals.status_expired ||
                        0}
                    </strong>
                    <span>Expired</span>
                  </div>
                  <div className="card admin-stat admin-stat--highlight">
                    <strong>{exchangeMetrics.totals.exchange_completed || 0}</strong>
                    <span>Completed</span>
                  </div>
                </div>
                {exchangeMetrics.windows ? (
                  <div className="admin-stats-grid">
                    <div className="card admin-stat">
                      <strong>{exchangeMetrics.windows.last7d?.exchange_requested || 0}</strong>
                      <span>Requests (7d)</span>
                    </div>
                    <div className="card admin-stat">
                      <strong>{exchangeMetrics.windows.last30d?.exchange_requested || 0}</strong>
                      <span>Requests (30d)</span>
                    </div>
                  </div>
                ) : null}
              </>
            )}
            {!exchangeMetricsLoading && exchangeMetrics?.audit?.length ? (
              <div className="admin-exchange-recent">
                <h4>Exchange audit trail</h4>
                {exchangeMetrics.audit.slice(0, 10).map((row, index) => (
                  <article key={`audit-${row.id}-${index}`} className="card admin-moderation-row">
                    <div className="admin-moderation-row__main">
                      <strong>{String(row.status || "—")}</strong>
                      <span>
                        {String(row.requester_name || "Requester")} → {String(row.recipient_name || "Recipient")} ·{" "}
                        {new Date(String(row.created_at)).toLocaleString()}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
            {!exchangeMetricsLoading && exchangeMetrics?.recent?.length ? (
              <div className="admin-exchange-recent">
                {exchangeMetrics.recent.slice(0, 12).map((row, index) => (
                  <article key={`${row.event_type}-${row.created_at}-${index}`} className="card admin-moderation-row">
                    <div className="admin-moderation-row__main">
                      <strong>{String(row.event_type || "").replace(/_/g, " ")}</strong>
                      <span>
                        {String(row.name || row.username || row.user_key || "Member")} · match{" "}
                        {String(row.match_id || "—")} · {new Date(String(row.created_at)).toLocaleString()}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
            {!exchangeMetricsLoading && !exchangeMetrics?.recent?.length && (
              <AdminTerminalEmpty>No contact exchange events logged yet.</AdminTerminalEmpty>
            )}
          </section>

          <section className="card admin-command-panel">
            <h3>Potential spam activity</h3>
            <p className="match-prefs-note">Repeated copy-paste patterns flagged for review — no auto-ban.</p>
            {spamSuspects.length === 0 ? (
              <AdminTerminalEmpty>No spam suspects in the last 7 days.</AdminTerminalEmpty>
            ) : (
              spamSuspects.map((row, index) => (
                <article key={`spam-${row.userKey}-${index}`} className="card admin-moderation-row">
                  <div className="admin-moderation-row__main">
                    <strong>{String(row.name || row.userKey)}</strong>
                    <span>
                      hash {String(row.messageHash)} · {String(row.count)} sends · {String(row.severity)} ·{" "}
                      {new Date(String(row.lastAt)).toLocaleString()}
                    </span>
                  </div>
                </article>
              ))
            )}
          </section>

          <section className="card admin-command-panel">
            <h3>Audit trail</h3>
            <p className="match-prefs-note">Operator actions, pricing saves, profile pause, and trust events.</p>
            {auditRows.length === 0 ? (
              <AdminTerminalEmpty>No audit events logged yet.</AdminTerminalEmpty>
            ) : (
              auditRows.map((row) => (
                <article key={String(row.id)} className="card admin-moderation-row">
                  <div className="admin-moderation-row__main">
                    <strong>{String(row.action)}</strong>
                    <span>
                      {String(row.operator_email || "system")} · target {String(row.target_user_key || "—")} ·{" "}
                      {new Date(String(row.created_at)).toLocaleString()}
                    </span>
                  </div>
                </article>
              ))
            )}
          </section>

          <section className="card admin-command-panel">
            <h3>Moderation queue</h3>
            <p className="match-prefs-note">
              Shadow banned users stay in the app and can pay — but their signals and messages never reach
              anyone. Use after 3+ reports.
            </p>
            <div className="admin-command-actions">
              {import.meta.env.DEV && (
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={() => {
                    shadowBanId(memberShadowKey(DEMO_USER.profile.phone, DEMO_USER.profile.email));
                    setModeration(getModerationQueue());
                  }}
                >
                  Shadow ban demo member (test)
                </button>
              )}
              <button type="button" className="btn-secondary btn-sm" onClick={() => handleTabChange("pricing")}>
                Pricing →
              </button>
            </div>
            {moderation.length === 0 && <AdminTerminalEmpty>No reports pending.</AdminTerminalEmpty>}
            {moderation.map((entry) => (
              <article
                key={entry.profileId}
                className={`card admin-moderation-row ${entry.reportCount >= 3 ? "admin-moderation-row--hot" : ""}`}
              >
                <div className="admin-moderation-row__main">
                  <strong>{entry.name}</strong>
                  <span>
                    {entry.city} · {entry.reportCount} report{entry.reportCount === 1 ? "" : "s"}
                    {entry.shadowBanned ? " · shadow banned" : ""}
                  </span>
                  {entry.lastReason && (
                    <small>Latest: {entry.lastReason.replace(/_/g, " ")}</small>
                  )}
                </div>
                <div className="admin-moderation-row__actions">
                  {entry.shadowBanned ? (
                    <span className="match-prefs-note">Listed in shadow banned users</span>
                  ) : (
                    <button
                      type="button"
                      className="btn-primary btn-sm"
                      disabled={entry.reportCount < 3}
                      title={entry.reportCount < 3 ? "Requires 3+ reports" : "Shadow ban profile"}
                      onClick={async () => {
                        if (!(await ensureConsent("Confirm shadow ban for this member."))) {
                          pushToast("Console PIN required.");
                          return;
                        }
                        const result = await shadowBanAdmin(
                          entry.profileId,
                          entry.lastReason
                            ? `Shadow ban after reports: ${entry.lastReason.replace(/_/g, " ")}`
                            : `Shadow ban after ${entry.reportCount} reports.`
                        );
                        if (!result.ok) {
                          pushToast(result.error);
                          return;
                        }
                        shadowBanId(entry.profileId);
                        setModeration(getModerationQueue());
                        pushToast("Member shadow banned.");
                      }}
                    >
                      Shadow ban
                    </button>
                  )}
                </div>
              </article>
            ))}
          </section>

          <AdminShadowBannedSection
            onToast={pushToast}
            onRestored={(profileId) => {
              liftShadowBan(profileId);
              setModeration(getModerationQueue());
            }}
          />

          <section className="admin-stats-grid">
            {successMetrics.slice(0, 4).map((s) => (
              <div key={s.label} className="card admin-stat">
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </section>

          <AdminSecurityPanel ref={securityRef} />
        </>
      )}

      {tab === "overview" && (
        <>
          <h3 className="admin-section-title">Today</h3>
          <section className="admin-stats-grid admin-stats-grid--highlight">
            {successMetrics.slice(0, 7).map((s) => (
              <div key={s.label} className="card admin-stat admin-stat--highlight">
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </section>
          <h3 className="admin-section-title">All time</h3>
          <section className="admin-stats-grid">
            {stats.slice(7).map((s) => (
              <div key={s.label} className="card admin-stat">
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </section>
        </>
      )}

      {tab === "business" && <AdminBusinessDashboard />}

      {tab === "users" && (
        <>
          <section className="card admin-member-purge">
            <h3 className="admin-section-title">Find & delete member</h3>
            <p className="admin-help">
              Permanently removes the member profile, auth account, photos, signals, matches, messages,
              verifications, and referral history. This cannot be undone.
            </p>
            <div className="admin-member-purge__search">
              <input
                type="search"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Email, username, phone, or name"
                aria-label="Search members"
              />
              <button
                type="button"
                className="btn-secondary"
                disabled={memberSearchBusy || memberSearch.trim().length < 2}
                onClick={async () => {
                  setMemberSearchBusy(true);
                  setMemberSearchMessage("");
                  setPurgeTarget(null);
                  setPurgeMessage("");
                  try {
                    const result = await searchAdminMembers(memberSearch.trim());
                    if (!result.ok) {
                      pushToast(result.error);
                      setMemberResults([]);
                      setMemberSearchMessage("Search failed.");
                      return;
                    }
                    const rows = result.data.members ?? [];
                    setMemberResults(rows);
                    setMemberSearchMessage(
                      rows.length ? `${rows.length} member(s) found.` : "No users found."
                    );
                  } finally {
                    setMemberSearchBusy(false);
                  }
                }}
              >
                {memberSearchBusy ? "Searching…" : "Search"}
              </button>
            </div>
            {memberSearchMessage && <p className="admin-inline-message">{memberSearchMessage}</p>}
            {memberResults.map((member) => (
              <article key={member.id} className="admin-moderation-row admin-member-purge__row">
                <div>
                  <strong>{member.name}</strong>
                  <p>
                    {member.username ? `@${member.username} · ` : ""}
                    {member.email || member.phone || member.id}
                    {member.city ? ` · ${member.city}` : ""}
                    {member.accountStatus && member.accountStatus !== "active"
                      ? ` · ${member.accountStatus}`
                      : ""}
                  </p>
                </div>
                <div className="admin-member-purge__row-actions">
                  <button
                    type="button"
                    className="btn-secondary btn-sm"
                    onClick={() => {
                      void (async () => {
                        setMemberDetail(member);
                        setMemberCompliance(null);
                        setMemberAuditRows([]);
                        setMemberAuditOpen(false);
                        setMemberComplianceBusy(true);
                        try {
                          const result = await fetchAdminMemberCompliance(member.id);
                          if (!result.ok) {
                            pushToast(result.error || "Could not load compliance.");
                            return;
                          }
                          if (!result.data.compliance) {
                            pushToast("Could not load compliance.");
                            return;
                          }
                          setMemberCompliance(result.data.compliance);
                        } finally {
                          setMemberComplianceBusy(false);
                        }
                      })();
                    }}
                  >
                    Compliance
                  </button>
                  <button
                    type="button"
                    className="btn-danger btn-sm"
                    onClick={() => {
                      setPurgeTarget(member);
                      setPurgeConfirm("");
                      setPurgeMessage("");
                    }}
                  >
                    Delete permanently
                  </button>
                </div>
              </article>
            ))}
            {memberDetail && (
              <section className="card admin-member-compliance">
                <h4 className="admin-section-title">Compliance — {memberDetail.name}</h4>
                {memberComplianceBusy ? (
                  <p className="admin-inline-message">Loading compliance…</p>
                ) : memberCompliance ? (
                  <>
                    <dl className="admin-compliance-grid">
                      <div>
                        <dt>Account status</dt>
                        <dd>{memberCompliance.accountStatus}</dd>
                      </div>
                      {memberCompliance.accountDeleteScheduledFor ? (
                        <div>
                          <dt>Deletion scheduled</dt>
                          <dd>{new Date(memberCompliance.accountDeleteScheduledFor).toLocaleString()}</dd>
                        </div>
                      ) : null}
                      <div>
                        <dt>Terms</dt>
                        <dd>
                          {memberCompliance.compliance.termsAcceptedAt
                            ? `${new Date(memberCompliance.compliance.termsAcceptedAt).toLocaleDateString()} (${memberCompliance.compliance.termsVersion || "—"})`
                            : "—"}
                        </dd>
                      </div>
                      <div>
                        <dt>Privacy</dt>
                        <dd>
                          {memberCompliance.compliance.privacyAcceptedAt
                            ? `${new Date(memberCompliance.compliance.privacyAcceptedAt).toLocaleDateString()} (${memberCompliance.compliance.privacyVersion || "—"})`
                            : "—"}
                        </dd>
                      </div>
                      <div>
                        <dt>Age confirmed</dt>
                        <dd>
                          {memberCompliance.compliance.ageConfirmedAt
                            ? new Date(memberCompliance.compliance.ageConfirmedAt).toLocaleString()
                            : "—"}
                        </dd>
                      </div>
                      <div>
                        <dt>Safety pledge</dt>
                        <dd>
                          {memberCompliance.compliance.safetyPledgeAcceptedAt
                            ? `${new Date(memberCompliance.compliance.safetyPledgeAcceptedAt).toLocaleDateString()} (${memberCompliance.compliance.safetyPledgeVersion || "—"})`
                            : "—"}
                        </dd>
                      </div>
                      <div>
                        <dt>Adult risk ack</dt>
                        <dd>
                          {memberCompliance.compliance.adultRiskAcknowledgedAt
                            ? new Date(memberCompliance.compliance.adultRiskAcknowledgedAt).toLocaleString()
                            : "—"}
                        </dd>
                      </div>
                      <div>
                        <dt>Offline safety ack</dt>
                        <dd>
                          {memberCompliance.compliance.offlineSafetyAcknowledgedAt
                            ? new Date(memberCompliance.compliance.offlineSafetyAcknowledgedAt).toLocaleString()
                            : "—"}
                        </dd>
                      </div>
                      <div>
                        <dt>Onboarding</dt>
                        <dd>{memberDetail.onboardingComplete ? "Complete" : "Incomplete"}</dd>
                      </div>
                      <div>
                        <dt>2FA</dt>
                        <dd>
                          {memberCompliance.twoFactorEnabled
                            ? `On (${memberCompliance.twoFactorMethod || "email"})`
                            : "Off"}
                        </dd>
                      </div>
                    </dl>
                    <div className="admin-member-compliance__actions">
                      <button
                        type="button"
                        className="btn-secondary btn-sm"
                        disabled={memberRepairBusy}
                        onClick={() => {
                          void (async () => {
                            setMemberRepairBusy(true);
                            try {
                              const result = await repairAdminMemberOnboarding(memberDetail.id);
                              if (!result.ok) {
                                pushToast(result.error || "Could not repair onboarding status.");
                                return;
                              }
                              const payload = result.data;
                              if (payload.repaired) {
                                pushToast("Onboarding status repaired on server.");
                              } else if (payload.completed) {
                                pushToast("Member onboarding already complete.");
                              } else {
                                pushToast("Profile still missing required onboarding data.");
                              }
                            } finally {
                              setMemberRepairBusy(false);
                            }
                          })();
                        }}
                      >
                        {memberRepairBusy ? "Repairing…" : "Repair onboarding status"}
                      </button>
                      <button
                        type="button"
                        className="btn-secondary btn-sm"
                        onClick={() => {
                        void (async () => {
                          if (memberAuditOpen) {
                            setMemberAuditOpen(false);
                            return;
                          }
                          const result = await fetchAdminMemberAuditTrail(memberDetail.id);
                          if (!result.ok) {
                            pushToast(result.error || "Could not load audit trail.");
                            return;
                          }
                          setMemberAuditRows(result.data.rows ?? []);
                          setMemberAuditOpen(true);
                        })();
                      }}
                    >
                      {memberAuditOpen ? "Hide Audit Trail" : "View Audit Trail"}
                    </button>
                    </div>
                    {memberAuditOpen ? (
                      <div className="admin-audit-trail">
                        {memberAuditRows.length ? (
                          memberAuditRows.map((row) => (
                            <div key={row.id} className="admin-audit-trail__row">
                              <span>{new Date(row.created_at).toLocaleString()}</span>
                              <strong>{row.action}</strong>
                              <span>{row.operator_id || row.user_id || "—"}</span>
                            </div>
                          ))
                        ) : (
                          <p className="admin-inline-message">No audit events yet.</p>
                        )}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <p className="admin-inline-message">Select Compliance on a member to view legal evidence.</p>
                )}
              </section>
            )}
            {purgeTarget && (
              <div className="admin-member-purge__confirm">
                <p>
                  Delete <strong>{purgeTarget.name}</strong> ({purgeTarget.email || purgeTarget.phone})?
                  Type <strong>DELETE</strong> to confirm.
                </p>
                <input
                  type="text"
                  value={purgeConfirm}
                  onChange={(e) => setPurgeConfirm(e.target.value)}
                  placeholder="DELETE"
                  aria-label="Type DELETE to confirm"
                />
                <div className="admin-member-purge__confirm-actions">
                  <button
                    type="button"
                    className="btn-danger"
                    disabled={purgeBusy || purgeConfirm.trim().toUpperCase() !== "DELETE"}
                    onClick={async () => {
                      setPurgeBusy(true);
                      setPurgeMessage("");
                      try {
                        if (!(await ensureConsent("Confirm permanent member deletion."))) {
                          setPurgeMessage("Console PIN required.");
                          return;
                        }
                        const result = await purgeAdminMember(purgeTarget.id, purgeConfirm.trim());
                        if (!result.ok) {
                          if (result.code === "consent_required" && (await ensureConsent("Confirm permanent member deletion."))) {
                            const retry = await purgeAdminMember(purgeTarget.id, purgeConfirm.trim());
                            if (!retry.ok) {
                              pushToast(retry.error);
                              setPurgeMessage(retry.error);
                              return;
                            }
                            const data = retry.data;
                            if (!data.ok) {
                              const message = data.error || "Delete failed.";
                              pushToast(message);
                              setPurgeMessage(message);
                              return;
                            }
                            setMemberResults((rows) => rows.filter((row) => row.id !== purgeTarget.id));
                            setPurgeTarget(null);
                            setPurgeConfirm("");
                            setPurgeMessage(`Removed ${data.member?.name || "member"} from the system.`);
                            return;
                          }
                          pushToast(result.error);
                          setPurgeMessage(result.error);
                          return;
                        }
                        const data = result.data;
                        if (!data.ok) {
                          const message = data.error || "Delete failed.";
                          pushToast(message);
                          setPurgeMessage(message);
                          return;
                        }
                        setMemberResults((rows) => rows.filter((row) => row.id !== purgeTarget.id));
                        setPurgeTarget(null);
                        setPurgeConfirm("");
                        setPurgeMessage(
                          `Removed ${data.member?.name || "member"} from the system.`
                        );
                      } finally {
                        setPurgeBusy(false);
                      }
                    }}
                  >
                    {purgeBusy ? "Deleting…" : "Confirm delete"}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={purgeBusy}
                    onClick={() => {
                      setPurgeTarget(null);
                      setPurgeConfirm("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {purgeMessage && <p className="admin-inline-message">{purgeMessage}</p>}
          </section>

          <section className="admin-stats-grid admin-stats-grid--highlight">
            <div className="card admin-stat admin-stat--highlight">
              <strong>{countEvent("signup_completed")}</strong>
              <span>Total signups</span>
            </div>
            <div className="card admin-stat admin-stat--highlight">
              <strong>{dailyActiveUsersToday()}</strong>
              <span>Daily active users</span>
            </div>
            <div className="card admin-stat admin-stat--highlight">
              <strong>{blocked}</strong>
              <span>Blocked users</span>
            </div>
            <div className="card admin-stat admin-stat--highlight">
              <strong>{modStats.shadowBanned}</strong>
              <span>Shadow banned</span>
            </div>
          </section>

          <h3 className="admin-section-title">Users & engagement by city</h3>
          <section className="admin-city-table card">
            {cityLeaderboard(usersByCity()).map((row) => (
              <div key={row.city} className="admin-city-row">
                <span>{row.city}</span>
                <span>{row.value} users</span>
              </div>
            ))}
            {!cityLeaderboard(usersByCity()).length && (
              <p className="admin-empty">No city signup data yet.</p>
            )}
          </section>

          <h3 className="admin-section-title">Profile completion by city</h3>
          <section className="admin-city-table card">
            {cityLeaderboard(profileCompletionByCity()).map((row) => (
              <div key={row.city} className="admin-city-row">
                <span>{row.city}</span>
                <strong>{row.value}%</strong>
              </div>
            ))}
          </section>

          <AdminSeedingTools onMessage={setSeedMessage} />
          {seedMessage && <p className="admin-toast" role="status">{seedMessage}</p>}
        </>
      )}

      {tab === "reports" && (
        <section className="card admin-command-panel">
          <h3>Reports</h3>
          <p className="match-prefs-note">
            {adminReports.length
              ? `${adminReports.length} server reports loaded`
              : `${modStats.totalReports} local · ${modStats.pendingReview} pending · ${modStats.resolved} reviewed · ${modStats.actionTaken} action taken`}
          </p>
          <div className="admin-filter-row">
            {(["all", "pending", "reviewed", "action_taken"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                className={reportFilter === filter ? "active" : ""}
                onClick={() => setReportFilter(filter)}
              >
                {filter.replace(/_/g, " ")}
              </button>
            ))}
          </div>
          {adminReportsLoading && <AdminTerminalEmpty>Loading reports…</AdminTerminalEmpty>}
          {!adminReportsLoading &&
            (adminReports.length
              ? adminReports.filter((row) => reportFilter === "all" || row.status === reportFilter)
              : filterModerationQueue(moderation, reportFilter)
            ).length === 0 && <AdminTerminalEmpty>No reports pending.</AdminTerminalEmpty>}
          {adminReports.length > 0
            ? adminReports
                .filter((row) => reportFilter === "all" || row.status === reportFilter)
                .map((row) => (
                  <article
                    key={row.id}
                    className={`card admin-moderation-row ${row.reportCount >= 3 ? "admin-moderation-row--hot" : ""}`}
                  >
                    <div className="admin-moderation-row__main">
                      <strong>{row.reportedName}</strong>
                      <span>
                        {row.reportedCity} · {reportReasonLabel(row.reason as import("../types").ReportReason)} ·{" "}
                        {row.reportCount} report{row.reportCount === 1 ? "" : "s"} · {row.status.replace(/_/g, " ")}
                        {row.blocked ? " · blocked" : ""}
                        {row.shadowBanned ? " · shadow banned" : ""}
                      </span>
                      <small>
                        Reporter: {row.reporterEmail || row.reporterPhone || "—"}
                        {row.note ? ` · Note: ${row.note}` : ""}
                      </small>
                      <time>{new Date(row.at).toLocaleString()}</time>
                    </div>
                    <div className="admin-moderation-row__actions">
                      <button
                        type="button"
                        className="btn-secondary btn-sm"
                        onClick={() => handleTabChange("command")}
                      >
                        Review
                      </button>
                      <button
                        type="button"
                        className="btn-secondary btn-sm"
                        disabled={row.shadowBanned}
                        onClick={() => void shadowBanFromReport(row.profileId, row.reason)}
                      >
                        Shadow ban
                      </button>
                    </div>
                  </article>
                ))
            : filterModerationQueue(moderation, reportFilter).map((entry) => (
              <article
                key={entry.profileId}
                className={`card admin-moderation-row ${entry.reportCount >= 3 ? "admin-moderation-row--hot" : ""}`}
              >
                <div className="admin-moderation-row__main">
                  <strong>{entry.name}</strong>
                  <span>
                    {entry.city} · {entry.reportCount} report{entry.reportCount === 1 ? "" : "s"} · {entry.status.replace(/_/g, " ")}
                    {entry.shadowBanned ? " · shadow banned" : ""}
                  </span>
                  {entry.lastReportAt && (
                    <time>{new Date(entry.lastReportAt).toLocaleString()}</time>
                  )}
                  {entry.lastReason && <small>Reason: {reportReasonLabel(entry.lastReason as import("../types").ReportReason)}</small>}
                </div>
                <div className="admin-moderation-row__actions">
                  <button type="button" className="btn-secondary btn-sm" onClick={() => handleTabChange("command")}>
                    Review in Command Center
                  </button>
                </div>
              </article>
            ))}
        </section>
      )}

      {tab === "cities" && (
        <>
          <section className="admin-stats-grid admin-stats-grid--highlight">
            {cityHighlights.map((s) => (
              <div key={s.label} className="card admin-stat admin-stat--highlight">
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </section>

          <h3 className="admin-section-title">Signals sent today by city</h3>
          <section className="admin-city-table card">
            {cityLeaderboard(signalsTodayByCity).map((row) => (
              <div key={row.city} className="admin-city-row">
                <span>{row.city}</span>
                <strong>{row.value}</strong>
              </div>
            ))}
            {!cityLeaderboard(signalsTodayByCity).length && (
              <p className="admin-empty">No signals yet today.</p>
            )}
          </section>

          <h3 className="admin-section-title">Premium revenue today by city (est.)</h3>
          <section className="admin-city-table card">
            {cityLeaderboard(premiumTodayByCity).map((row) => (
              <div key={row.city} className="admin-city-row">
                <span>{row.city}</span>
                <strong>₦{row.value.toLocaleString("en-NG")}</strong>
              </div>
            ))}
            {!cityLeaderboard(premiumTodayByCity).length && (
              <p className="admin-empty">No premium upgrades yet today.</p>
            )}
          </section>

          <h3 className="admin-section-title">Users & engagement by city</h3>
          <section className="admin-city-table card">
            {cityLeaderboard(usersByCity()).map((row) => {
              const dau = dauByCity()[row.city] ?? 0;
              const completed = profileCompletionByCity()[row.city] ?? 0;
              return (
                <div key={row.city} className="admin-city-row admin-city-row--wide">
                  <span>{row.city}</span>
                  <span>{row.value} users</span>
                  <span>{completed} completed</span>
                  <strong>{dau} DAU</strong>
                </div>
              );
            })}
          </section>
        </>
      )}

      {tab === "leads" && (
        <section className="admin-leads">
          {leads.length === 0 && <AdminTerminalEmpty>No leads available.</AdminTerminalEmpty>}
          {leads.map((lead) => (
            <article key={lead.id} className="card admin-lead-row">
              <strong>{lead.email || lead.phone}</strong>
              {lead.email && lead.phone && <span>{lead.phone}</span>}
              {lead.city && <span>{lead.city}</span>}
              <time>{new Date(lead.at).toLocaleString()}</time>
            </article>
          ))}
        </section>
      )}

      {tab === "verifications" && (
        <section className="admin-verifications">
          <div className="admin-stats-grid admin-stats-grid--highlight">
            <div className="card admin-stat admin-stat--highlight">
              <strong>{serverVerifications.filter((v) => v.status === "pending").length || verifyStats.pending}</strong>
              <span>Pending</span>
            </div>
            <div className="card admin-stat admin-stat--highlight">
              <strong>{serverVerifications.filter((v) => v.status === "approved").length || verifyStats.approved}</strong>
              <span>Approved</span>
            </div>
            <div className="card admin-stat admin-stat--highlight">
              <strong>{serverVerifications.filter((v) => v.status === "rejected").length || verifyStats.rejected}</strong>
              <span>Rejected</span>
            </div>
            <div className="card admin-stat admin-stat--highlight">
              <strong>{verifyStats.avgReviewHours != null ? `${verifyStats.avgReviewHours}h` : "—"}</strong>
              <span>Avg review time</span>
            </div>
          </div>
          <div className="admin-filter-row">
            {(["pending", "approved", "rejected"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                className={verificationFilter === filter ? "active" : ""}
                onClick={() => setVerificationFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
          {serverVerifications.filter((v) => v.status === verificationFilter).length === 0 &&
            localVerifications.filter((v) => v.status === verificationFilter).length === 0 && (
            <AdminTerminalEmpty>No verification requests.</AdminTerminalEmpty>
          )}
          {serverVerifications
            .filter((v) => v.status === verificationFilter)
            .map((v) => (
              <article key={v.id} className="card admin-verification-row">
                <div className="admin-verification-row__meta">
                  <strong>{v.user_name || "Member"}</strong>
                  <span>{v.phone || v.email}</span>
                  <span>{v.phone_verified ? "Phone verified" : "Phone not verified"}</span>
                  <time>{new Date(v.submitted_at).toLocaleString()}</time>
                  {v.reject_reason && <small>{v.reject_reason}</small>}
                </div>
                <div className="admin-verification-row__photos">
                  {v.profile_photo && <img src={v.profile_photo} alt="Profile" />}
                  {v.verification_selfie && <img src={v.verification_selfie} alt="Selfie" />}
                </div>
                {v.status === "pending" && (
                  <div className="admin-verification-actions">
                    <input
                      type="text"
                      placeholder="Reject reason (optional)"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn-primary btn-sm"
                      onClick={async () => {
                        if (!(await ensureConsent("Approve this verification."))) return;
                        const result = await reviewVerificationSubmission({ id: v.id, action: "approve" });
                        if (!result.ok || !result.data.ok) {
                          if (!result.ok && result.code === "consent_required" && (await ensureConsent("Approve this verification."))) {
                            const retry = await reviewVerificationSubmission({ id: v.id, action: "approve" });
                            if (!retry.ok || !retry.data.ok) {
                              pushToast(retry.ok ? retry.data.error || "Approve failed." : retry.error);
                              return;
                            }
                            await loadVerifications();
                            return;
                          }
                          pushToast(result.ok ? result.data.error || "Approve failed." : result.error);
                          return;
                        }
                        await loadVerifications();
                      }}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="btn-secondary btn-sm"
                      onClick={async () => {
                        if (!(await ensureConsent("Reject this verification."))) return;
                        const result = await reviewVerificationSubmission({
                          id: v.id,
                          action: "reject",
                          rejectReason: rejectReason || "Did not meet guidelines"
                        });
                        if (!result.ok || !result.data.ok) {
                          if (!result.ok && result.code === "consent_required" && (await ensureConsent("Reject this verification."))) {
                            const retry = await reviewVerificationSubmission({
                              id: v.id,
                              action: "reject",
                              rejectReason: rejectReason || "Did not meet guidelines"
                            });
                            if (!retry.ok || !retry.data.ok) {
                              pushToast(retry.ok ? retry.data.error || "Reject failed." : retry.error);
                              return;
                            }
                            setRejectReason("");
                            await loadVerifications();
                            return;
                          }
                          pushToast(result.ok ? result.data.error || "Reject failed." : result.error);
                          return;
                        }
                        setRejectReason("");
                        await loadVerifications();
                      }}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </article>
            ))}
        </section>
      )}

      {tab === "discover" && (
        <>
        <section className="card admin-launch-config">
          <h3>Launch experiments</h3>
          <label className="admin-discover-city__toggle">
            <input
              type="checkbox"
              checked={launchConfig.premiumTrialEnabled}
              onChange={(e) => saveLaunchConfig({ premiumTrialEnabled: e.target.checked })}
            />
            24-hour Signal Pass trial for new signups
          </label>
          <label className="admin-discover-city__toggle">
            <input
              type="checkbox"
              checked={launchConfig.socialProofEnabled}
              onChange={(e) => saveLaunchConfig({ socialProofEnabled: e.target.checked })}
            />
            Show success stories section (only when real content exists)
          </label>
        </section>
        <section className="card admin-cms admin-discover-city">
          <h3>Discover city header</h3>
          <p className="match-prefs-note">
            Launch mode avoids fake counts. Real data mode shows counts only when activity meets the threshold.
          </p>

          <label className="admin-discover-city__toggle">
            <input
              type="checkbox"
              checked={discoverDraft.launchMode}
              onChange={(e) => setDiscoverDraft({ ...discoverDraft, launchMode: e.target.checked })}
            />
            Launch mode (growth copy instead of counts)
          </label>

          <label>
            Real data threshold (min active profiles in city)
            <input
              type="number"
              min={1}
              max={50}
              value={discoverDraft.realDataMinActive}
              onChange={(e) =>
                setDiscoverDraft({
                  ...discoverDraft,
                  realDataMinActive: Math.max(1, Number(e.target.value) || 5)
                })
              }
            />
          </label>

          <label>
            Activity rotator (one line per message)
            <textarea
              rows={5}
              value={discoverDraft.activityRotator.join("\n")}
              onChange={(e) =>
                setDiscoverDraft({
                  ...discoverDraft,
                  activityRotator: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean)
                })
              }
            />
          </label>

          <label>
            Confidence rotator (one line per message)
            <textarea
              rows={4}
              value={discoverDraft.confidenceRotator.join("\n")}
              onChange={(e) =>
                setDiscoverDraft({
                  ...discoverDraft,
                  confidenceRotator: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean)
                })
              }
            />
          </label>

          <h4 className="admin-section-title">City headlines & launch activity</h4>
          <div className="admin-discover-city__grid">
            {DISCOVER_SUPPORTED_CITIES.map((city) => (
              <div key={city} className="admin-discover-city__city-block">
                <strong>{city}</strong>
                <label>
                  Headline
                  <input
                    value={discoverDraft.cityHeadlines[city] ?? ""}
                    onChange={(e) =>
                      setDiscoverDraft({
                        ...discoverDraft,
                        cityHeadlines: { ...discoverDraft.cityHeadlines, [city]: e.target.value }
                      })
                    }
                  />
                </label>
                <label>
                  Launch activity message
                  <input
                    value={discoverDraft.launchActivityMessages[city] ?? ""}
                    onChange={(e) =>
                      setDiscoverDraft({
                        ...discoverDraft,
                        launchActivityMessages: {
                          ...discoverDraft.launchActivityMessages,
                          [city]: e.target.value
                        }
                      })
                    }
                  />
                </label>
              </div>
            ))}
          </div>

          <h4 className="admin-section-title">City priorities (comma-separated)</h4>
          {LAUNCH_PRIMARY_CITIES.map((primary) => (
            <label key={primary}>
              {primary} priority order
              <input
                value={(discoverDraft.cityPriorities[primary] ?? []).join(", ")}
                onChange={(e) =>
                  setDiscoverDraft({
                    ...discoverDraft,
                    cityPriorities: {
                      ...discoverDraft.cityPriorities,
                      [primary]: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                    }
                  })
                }
              />
            </label>
          ))}

          <div className="admin-cms-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={() => saveDiscoverCityConfig(discoverDraft)}
            >
              Save discover settings
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setDiscoverDraft({ ...DEFAULT_DISCOVER_CITY_CONFIG })}
            >
              Reset defaults
            </button>
          </div>
        </section>
        </>
      )}

      {tab === "cityhome" && (
        <section className="card admin-cms admin-city-home">
          <h3>City home placements</h3>
          <p className="match-prefs-note">
            Members appear automatically after onboarding. Feature, mark hot, or hide profiles on each city
            home page. Paid City Boosts land here instantly — no manual work needed.
          </p>

          <label>
            City
            <select value={cityHomeCity} onChange={(e) => setCityHomeCity(e.target.value)}>
              {CITIES_VISUAL.map((city) => (
                <option key={city.id} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
          </label>

          {cityHomeMessage && <p className="admin-empty">{cityHomeMessage}</p>}
          {cityHomeLoading && <p>Loading members…</p>}

          {!cityHomeLoading && cityHomeMembers.length === 0 && !cityHomeMessage && (
            <p className="admin-empty">No completed profiles in {cityHomeCity} yet.</p>
          )}

          {cityHomeMembers.map((member) => (
            <article key={member.id} className="card admin-moderation-row admin-city-home-row">
              <div className="admin-moderation-row__main">
                {member.photo ? (
                  <img src={member.photo} alt="" className="admin-city-home-row__photo" />
                ) : null}
                <div>
                  <strong>{member.name}</strong>
                  <span>
                    {member.city}
                    {member.cityHomeHidden ? " · hidden" : " · visible"}
                  </span>
                </div>
              </div>
              <div className="admin-moderation-row__actions">
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={async () => {
                    const ok = await setAdminCityPlacement({
                      city: cityHomeCity,
                      profileId: member.id,
                      placementType: "spotlight"
                    });
                    setCityHomeMessage(
                      ok ? `${member.name} in City Spotlight for ${cityHomeCity}.` : "Could not update placement."
                    );
                    if (ok) void loadCityHomeMembers();
                  }}
                >
                  Spotlight
                </button>
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={async () => {
                    const ok = await setAdminCityPlacement({
                      city: cityHomeCity,
                      profileId: member.id,
                      placementType: "featured"
                    });
                    setCityHomeMessage(ok ? `${member.name} featured in ${cityHomeCity}.` : "Could not update placement.");
                    if (ok) void loadCityHomeMembers();
                  }}
                >
                  Feature
                </button>
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={async () => {
                    const ok = await setAdminCityPlacement({
                      city: cityHomeCity,
                      profileId: member.id,
                      placementType: "hot"
                    });
                    setCityHomeMessage(ok ? `${member.name} marked hot in ${cityHomeCity}.` : "Could not update placement.");
                    if (ok) void loadCityHomeMembers();
                  }}
                >
                  Hot
                </button>
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={async () => {
                    const ok = await setAdminCityHomeHidden(member.id, !member.cityHomeHidden);
                    setCityHomeMessage(
                      ok
                        ? member.cityHomeHidden
                          ? `${member.name} visible again.`
                          : `${member.name} hidden from city home.`
                        : "Could not update visibility."
                    );
                    if (ok) void loadCityHomeMembers();
                  }}
                >
                  {member.cityHomeHidden ? "Show" : "Hide"}
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      {tab === "pricing" && <AdminPricingPage onBack={() => handleTabChange("command")} embedded />}

      {tab === "content" && (
        <section className="card admin-cms">
          <h3>Editable copy</h3>
          <p className="match-prefs-note">Hero, welcome, safety, and notification templates.</p>
          {(
            [
              ["welcomeTitle", "Welcome title"],
              ["welcomeBody", "Welcome body"],
              ["heroHeadline", "Hero headline"],
              ["heroSubheadline", "Hero subheadline"],
              ["safetyText", "Safety text"],
              ["foundingMemberLabel", "Founding member badge"],
              ["supportWhatsapp", "Support WhatsApp number"],
              ["supportResponseTime", "Support response time (contact strip)"],
              ["supportHours", "Support hours (contact strip)"],
              ["growthVerifiedProfiles", "Growth stat — verified profiles"],
              ["growthCitiesLive", "Growth stat — cities live"],
              ["growthSignalsSent", "Growth stat — signals sent"]
            ] as const
          ).map(([key, label]) => (
            <label key={key}>
              {label}
              <input
                value={cmsDraft[key]}
                onChange={(e) => setCmsDraft({ ...cmsDraft, [key]: e.target.value })}
              />
            </label>
          ))}
          <div className="admin-cms-actions">
            {cmsMessage ? (
              <p className="match-prefs-note" role="status">
                {cmsMessage}
              </p>
            ) : null}
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                for (const [key, value] of Object.entries(cmsDraft)) {
                  if (key === "supportWhatsapp") continue;
                  if (validateUserText(String(value || ""))) {
                    setCmsMessage(CONTACT_LEAK_BLOCK_MESSAGE);
                    return;
                  }
                }
                setCmsMessage("");
                saveCms(cmsDraft);
              }}
            >
              Save content
            </button>
            <button type="button" className="btn-secondary" onClick={() => setCmsDraft({ ...DEFAULT_CMS })}>
              Reset defaults
            </button>
          </div>
        </section>
      )}

      {tab === "email" && (
        <section className="card admin-cms">
          <h3>Email branding</h3>
          <p className="match-prefs-note">
            Control the header shown on BamSignal transactional emails. When a banner is enabled, it replaces the logo.
            Invalid or missing banner images fall back to the logo automatically.
          </p>
          <label className="admin-checkbox">
            <input
              type="checkbox"
              checked={emailBrandingDraft.bannerEnabled}
              onChange={(e) =>
                setEmailBrandingDraft({ ...emailBrandingDraft, bannerEnabled: e.target.checked })
              }
            />
            Enable email banner
          </label>
          <label>
            Banner image URL
            <input
              type="url"
              placeholder="https://bamsignal.com/campaigns/launch-banner.webp"
              value={emailBrandingDraft.bannerImageUrl}
              onChange={(e) =>
                setEmailBrandingDraft({ ...emailBrandingDraft, bannerImageUrl: e.target.value })
              }
            />
          </label>
          <label>
            Banner link URL
            <input
              type="url"
              placeholder="https://bamsignal.com/premium"
              value={emailBrandingDraft.bannerLinkUrl}
              onChange={(e) =>
                setEmailBrandingDraft({ ...emailBrandingDraft, bannerLinkUrl: e.target.value })
              }
            />
          </label>
          <label>
            Banner alt text
            <input
              type="text"
              placeholder="Signal Pass launch — limited time"
              value={emailBrandingDraft.bannerAltText}
              onChange={(e) =>
                setEmailBrandingDraft({ ...emailBrandingDraft, bannerAltText: e.target.value })
              }
            />
          </label>
          {emailBrandingMessage && <p className="match-prefs-note">{emailBrandingMessage}</p>}
          <div className="admin-cms-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                void (async () => {
                  setEmailBrandingMessage("");
                  if (!(await ensureConsent("Save email branding changes."))) {
                    setEmailBrandingMessage("Console PIN required.");
                    return;
                  }
                  const { data } = await supabase?.auth.getSession() || { data: null };
                  const result = await saveEmailBrandingAdmin(
                    emailBrandingDraft,
                    data?.session?.access_token
                  );
                  if (!result.ok) {
                    setEmailBrandingMessage(result.error || "Could not save email branding.");
                    return;
                  }
                  if (result.value) setEmailBrandingDraft(result.value);
                  setEmailBrandingMessage("Email branding saved.");
                })();
              }}
            >
              Save email branding
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setEmailBrandingDraft(DEFAULT_EMAIL_BRANDING);
                setEmailBrandingMessage("Reset to defaults (not saved yet).");
              }}
            >
              Reset defaults
            </button>
          </div>
        </section>
      )}

      {tab === "ads" && (
        <>
          <AdminHomeFeedAdsPanel onMessage={setAdsMessage} />
          {adsMessage ? (
            <p className="admin-toast" role="status">
              {adsMessage}
            </p>
          ) : null}
        </>
      )}

      {tab === "concierge" && conciergeView === "operations-center" ? <OperationsCenterPage /> : null}
      {tab === "concierge" && conciergeView === "journey-intelligence" ? (
        <JourneyIntelligencePage />
      ) : null}
      {tab === "concierge" && conciergeView === "dashboard" ? <ConsultantDashboardPage /> : null}
      {tab === "talent" ? <TalentRecruitingPage /> : null}
      {tab === "support" ? <SupportCenterAdminPage /> : null}
      {tab === "audit" && auditView === "security" ? <PermissionsAuditPage /> : null}
      {tab === "audit" && auditView === "database" ? <DatabaseAuditPage /> : null}
      {tab === "audit" && auditView === "routes" ? <RouteAuditPage /> : null}
      {tab === "audit" && auditView === "journeys" ? <JourneyIntegrityAuditPage /> : null}
      {tab === "audit" && auditView === "compliance" ? <AuditComplianceCenterPage /> : null}
      {tab === "compliance" ? <InstitutionalComplianceCenterPage /> : null}
      {tab === "systemhealth" ? <SystemHealthPage /> : null}
      {tab === "notifications" ? <NotificationQueuePage /> : null}
      {tab === "documents" ? <DocumentCenterPage /> : null}
      {tab === "safety" ? <SafetyCenterPage /> : null}
      {tab === "academy" ? <ConsultantAcademyPage /> : null}
      {tab === "quality" ? <ConsultantQualityPage /> : null}
      {tab === "finance" ? <FinanceOperationsPage /> : null}
      {tab === "messages" ? <InternalMessagingPage /> : null}
      {tab === "executive" ? <ExecutiveDashboardPage /> : null}
      {tab === "launch" ? <LaunchReadinessCommandCenterPage /> : null}
      {tab === "remediation" ? <RemediationBoardPage /> : null}
        </main>
        <AdminCommandDock
          activeTab={tab}
          onTabChange={handleTabChange}
          mobileOpen={dockOpen}
          onMobileClose={() => setDockOpen(false)}
          badges={{
            reports: modStats.totalReports,
            leads: leads.length,
            verify: pendingVerificationCount
          }}
        />
      </div>
    </div>
    </RequirePermission>
  );
}
