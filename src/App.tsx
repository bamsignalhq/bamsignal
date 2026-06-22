import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { App as CapApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { Preloader } from "./components/Preloader";
import { BRAND_ASSETS } from "./constants/brand";
import { BottomNav } from "./components/BottomNav";
import { TopNav } from "./components/TopNav";
import { PricingModal } from "./components/PricingModal";
import { GuestGate } from "./components/GuestGate";
import { LandingPage } from "./pages/LandingPage";
import { GuestDiscoverPage } from "./pages/GuestDiscoverPage";
import { HomePage } from "./pages/HomePage";
import { DiscoverPage } from "./pages/DiscoverPage";
import { LikesPage } from "./pages/LikesPage";
import { ChatsPage } from "./pages/ChatsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { VoiceVibePage } from "./pages/VoiceVibePage";
import { SavedProfilesPage } from "./pages/SavedProfilesPage";
import { TrustedMemberPage } from "./pages/TrustedMemberPage";
import { LazyRouteFallback } from "./app/LazyRouteFallback";
import {
  LazyAdminConsoleRoot,
  LazyFastConnectionPage,
  LazyLegalPage,
  LazyMomentPage,
  LazyPremiumPage,
  LazyPublicMarketingRoutes,
  LazySafetyCenterPage,
  LazySignalConciergeApplicationPage,
  LazySignalConciergeConsultationPage,
  LazySignalConciergeFaqPage,
  LazyShareYourStoryPage,
  LazySignalConciergeLandingPage,
  LazySignalConciergePrivacyPage,
  LazySignalConciergeStatusPage,
  LazyBamSignalInstituteRelationshipConnectPage,
  LazyBamSignalInstituteBamSignalSummitPage,
  LazyBamSignalInstituteBamSignalHonorsPage,
  LazyBamSignalInstituteLegacyEndowmentPage,
  LazyBamSignalInstituteBamSignalMuseumPage,
  LazyBamSignalInstituteLegacyChairPage,
  LazyBamSignalInstituteCenturyVisionPage,
  LazyBamSignalInstituteBamSignalHousePage,
  LazyBamSignalInstituteHouseExperiencesPage,
  LazyBamSignalInstituteGreatRoomPage,
  LazyBamSignalInstituteHouseLibraryPage,
  LazyBamSignalInstituteLegacyProfessionalsPage,
  LazyBamSignalInstituteTrustMilestonesPage,
  LazyBamSignalInstituteTrustScorePage,
  LazyBamSignalInstituteLifePartnersPage,
  LazyBamSignalInstituteWeddingNetworkPage,
  LazyBamSignalInstituteDiasporaServicesPage,
  LazyBamSignalInstituteFaithNetworkPage,
  LazyBamSignalInstituteFamilyAdvisorsPage,
  LazyBamSignalInstituteRelationshipCoachNetworkPage,
  LazyBamSignalInstituteVerifiedProfessionalsPage,
  LazyBamSignalInstituteTrustPage,
  LazyBamSignalInstituteAfricanRelationshipCurriculumPage,
  LazyBamSignalInstituteFellowsPage,
  LazyBamSignalInstituteRelationshipCertificatesPage,
  LazyBamSignalInstituteLibraryPage,
  LazyBamSignalInstitutePremaritalJourneyPage,
  LazyBamSignalInstituteRelationshipMasterclassesPage,
  LazyBamSignalInstituteLearningPathsPage,
  LazyBamSignalInstituteAcademyProgramsPage,
  LazyBamSignalInstituteAcademyPage,
  LazyBamSignalInstituteAfricanRelationshipArchivePage,
  LazyBamSignalInstituteHallOfLegacyPage,
  LazyBamSignalInstituteObservatoryPage,
  LazyBamSignalInstituteRelationshipIndexPage,
  LazyBamSignalInstituteResearchPartnershipsPage,
  LazyBamSignalInstituteInsightsPage,
  LazyBamSignalInstituteRelationshipLabPage,
  LazyBamSignalInstituteAnnualRelationshipReportsPage,
  LazyBamSignalInstituteAnnualInsightsPage,
  LazyBamSignalInstituteLandingPage,
  LazyBamSignalInstituteProgramsPage,
  LazyBamSignalFoundationLandingPage,
  LazyBamSignalFoundationProgramsPage,
  LazyBamSignalFoundationStoriesPage,
  LazySignalEventsCityPage,
  LazySignalEventsCommunitiesPage,
  LazySignalEventsCommunityJourneyPage,
  LazySignalEventsGlobalRelationshipMapPage,
  LazySignalEventsCityAmbassadorsPage,
  LazySignalEventsLegacyCitiesPage,
  LazySignalEventsCorridorStoriesPage,
  LazySignalEventsDiasporaCorridorsPage,
  LazySignalEventsDiasporaPage,
  LazySignalEventsHubPage,
  LazyVisitorsPage
} from "./app/lazyRoutes";
import { PaymentRecoveryBanner, PaymentSuccessToast } from "./components/PaymentRecoveryBanner";
import { PaymentLoadingOverlay } from "./components/PaymentLoadingOverlay";
import { PaymentReturnScreen } from "./components/PaymentReturnScreen";
import { NotificationCenter } from "./components/NotificationCenter";
import type { PremiumPlan } from "./constants/plans";
import type { BoostProduct } from "./constants/boosts";
import { STORAGE_KEYS } from "./constants/limits";
import { ComplianceGateModal } from "./components/ComplianceGateModal";
import { OnboardingPage } from "./pages/OnboardingPage";
import type { AuthMeta, AuthMode, Match, NavTab, Theme, UserProfile } from "./types";
import { getSavedTheme, readJson, writeJson } from "./utils/storage";
import { getDatingProfile, normalizeDatingProfile } from "./utils/profile";
import {
  complianceGatePhase,
  hasComplianceSyncPending,
  logComplianceRoute,
  shouldBlockForCompliance
} from "./utils/compliance";
import {
  restoreComplianceFromMarker,
  retryPendingComplianceSync,
  syncComplianceDoneMarkerFromProfile
} from "./services/compliance";
import { normalizeOnboardingStatus } from "./utils/onboardingStatus";
import { readOpenAppOnboardingCache } from "./utils/openAppOnboardingCache";
import { clearStaleBootFlags } from "./utils/bootFlags";
import { recordStreakActivity } from "./utils/streaks";
import {
  isPremiumActive,
  refreshPremiumStatus,
  startBoostPayment,
  startPlanPayment,
  completePendingPayment,
  clearPaymentSession
} from "./services/payments";
import { maybeGrantPremiumTrial, checkPremiumTrialExpiry, isPremiumTrialActive } from "./utils/premiumTrial";
import { notifyPremiumActivated, notifyBoostActivated } from "./utils/notifyHelpers";
import { markFirstDayStep } from "./utils/firstDayJourney";
import { markJoinedAt } from "./utils/launchSeed";
import { hydrateMemberData } from "./services/memberData";
import {
  clearOpenAppPendingState,
  expireStaleOpenAppState,
  goToApp,
  hydrateMemberAppInBackground,
  markOpenAppPending,
  OPEN_APP_FAILSAFE_MS,
  validateServerSessionWithTimeout
} from "./services/goToApp";
import { supabase } from "./services/supabase";
import { filterBlockedByProfileId } from "./utils/safety";
import { recordDailyActive, trackEvent } from "./utils/analytics";
import { getProfileViewsToday } from "./utils/profileViews";
import { unreadCount, notificationDestination, type AppNotification } from "./utils/notifications";
import { activateBoost, pruneExpiredBoosts } from "./utils/activeBoosts";
import { BoostActiveBanner } from "./components/BoostActiveBanner";
import { cacheSubscriptionCatalogPricing } from "./utils/quickie";
import { applyQuickieIntentAfterPayment, applyPendingQuickieIntentIfNeeded } from "./utils/fastConnectionIntent";
import { fetchSubscriptionCatalog } from "./services/subscriptionCatalog";
import {
  getPaymentFlowState,
  isActivePaymentFlow,
  logPaymentEvent,
  parsePaymentReturnUrl,
  sanitizeStalePaymentState,
  setPaymentFlowState,
  shouldShowPaymentRecovery,
  subscribePaymentState
} from "./utils/paymentState";
import { SiteFooter } from "./components/SiteFooter";
import { LoveAuthRoutePage } from "./pages/LoveAuthRoutePage";
import { getBlogPost } from "./data/blogPosts";
import { getMomentPage, type MomentPageId } from "./data/momentPages";
import {
  AUTH_LOGIN_PATH,
  AUTH_SIGNUP_PATH,
  getAuthPath,
  getBlogSlug,
  getMomentSlug,
  isBlogIndex,
  isHardAuthRoute,
  isHardHubRoute,
  isHardRoute,
  isAdminAuthRoute,
  isAdminHubRoute,
  isAdminRoute,
  isPublicWebRoute,
  navigateToPath,
  normalizePath,
  isPaymentReturnPath,
  redirectLegacyConsolePaths,
  redirectLegacyAdmin,
  redirectAuthSignupAliases,
  requiresMemberRestoreBlocking,
  shouldShowPublicNotFound,
  HARD_AUTH_PATH,
  type AuthPath
} from "./constants/routes";
import { getLegalPath, type LegalPath } from "./constants/footer";
import { getSeoRoute, type SeoRoute } from "./constants/seoRoutes";
import { getNigeriaRoute, type NigeriaRoute } from "./constants/nigeriaRoutes";
import {
  getSignalConciergeRoute,
  isSignalConciergeAuthenticatedRoute,
  isUnknownSignalConciergeSubroute,
  SIGNAL_CONCIERGE_ROUTES,
  type SignalConciergeRoute
} from "./constants/signalConciergeRoutes";
import {
  getSignalEventsRoute,
  isUnknownSignalEventsSubroute,
  SIGNAL_EVENTS_ROUTES,
  type SignalEventsRoute
} from "./constants/signalEventsRoutes";
import {
  BAMSIGNAL_FOUNDATION_ROUTES,
  getBamSignalFoundationRoute,
  isUnknownBamSignalFoundationSubroute,
  type BamSignalFoundationRoute
} from "./constants/bamSignalFoundationRoutes";
import {
  BAMSIGNAL_INSTITUTE_ROUTES,
  getBamSignalInstituteRoute,
  isUnknownBamSignalInstituteSubroute,
  type BamSignalInstituteRoute
} from "./constants/bamSignalInstituteRoutes";
import { resolveHardHubPath } from "./utils/adminSession";
import { profileFromSessionUser, rememberUsernameEmail, resolveMemberIdentity } from "./utils/authIdentity";
import { clearMemberSessionCaches } from "./utils/authSession";
import { safeUserProfile } from "./utils/safeProfile";
import { boostNeedsMemberCity } from "./constants/boosts";
import { boostSuccessCopy } from "./constants/boosts";
import { MONETIZATION_COPY } from "./constants/copy";
import { USER_MESSAGES } from "./constants/userMessages";
import { DEMO_USER } from "./constants/demoAccounts";
import { getMemberCity } from "./utils/memberCity";
import { flowLog } from "./utils/flowLog";
import { clearOnboardingDrafts, logRouteDecision } from "./utils/onboardingStatus";
import { repairMemberCaches } from "./utils/repairMemberCaches";
import { memberFirstName } from "./utils/safeProfile";
import { MemberRouteBoundary, PublicRouteBoundary } from "./components/RouteErrorBoundary";
import { evaluateMemberRouteGuard } from "./components/MemberRouteGuard";
import {
  isMemberAppPath,
  isOnboardingPath,
  memberPathForTab,
  memberTabFromPath
} from "./constants/memberRoutes";
import {
  applySafeModeBoot,
  clearSafeMode,
  dismissRecoveryBanner,
  isSafeMode,
  rememberSuccessfulRoute,
  shouldShowRecoveryBanner
} from "./utils/crashRecovery";
import { usePlans } from "./context/PlansContext";
import {
  PremiumCheckoutProvider,
  type CheckoutPhase
} from "./context/PremiumCheckoutContext";
import { defaultPremiumPlan } from "./utils/premiumPlan";
import { checkoutWasOpened } from "./utils/paymentState";
import {
  clearPaystackCallbackParams,
  getPaymentReturnMeta,
  getPaymentReturnPath,
  hasPaystackCallbackInUrl,
  normalizePaymentReturnPath,
  resolvePaymentReturnPath
} from "./utils/paymentReturn";

type VerifiedPaymentRoute = {
  productId?: string;
  returnPath?: string;
  sourcePage?: string;
  boostId?: string;
  quickiePassUntil?: string;
  expiresAt?: string;
};

function fastConnectionPaymentFailureMessage(): string {
  const productType = getPaymentReturnMeta().productType;
  return productType === "fast_connection" || productType === "quickie"
    ? "Fast Connection was not activated."
    : USER_MESSAGES.paymentNotCompleted;
}

export function App() {
  const isNative = Capacitor.getPlatform() !== "web";
  const publicWebRoute = typeof window !== "undefined" && isPublicWebRoute(window.location.pathname);
  const blockMemberRestoreOnBoot =
    typeof window !== "undefined" && requiresMemberRestoreBlocking(window.location.pathname, isNative);
  const { plans } = usePlans();
  const [booting, setBooting] = useState(() => !publicWebRoute || isNative);
  const [authLoading, setAuthLoading] = useState(() => blockMemberRestoreOnBoot);
  const [memberHydrating, setMemberHydrating] = useState(false);
  const [memberAppEntered, setMemberAppEntered] = useState(() => isNative);
  const [bootExit, setBootExit] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => getSavedTheme());
  const [tab, setTab] = useState<NavTab>("home");
  const [legalPath, setLegalPath] = useState<LegalPath | null>(() => getLegalPath());
  const [seoRoute, setSeoRoute] = useState<SeoRoute | null>(() => getSeoRoute());
  const [nigeriaRoute, setNigeriaRoute] = useState<NigeriaRoute | null>(() => getNigeriaRoute());
  const [signalConciergeRoute, setSignalConciergeRoute] = useState<SignalConciergeRoute | null>(() =>
    getSignalConciergeRoute()
  );
  const [signalEventsRoute, setSignalEventsRoute] = useState<SignalEventsRoute | null>(() =>
    getSignalEventsRoute()
  );
  const [bamSignalFoundationRoute, setBamSignalFoundationRoute] =
    useState<BamSignalFoundationRoute | null>(() => getBamSignalFoundationRoute());
  const [bamSignalInstituteRoute, setBamSignalInstituteRoute] =
    useState<BamSignalInstituteRoute | null>(() => getBamSignalInstituteRoute());
  const [authPath, setAuthPath] = useState<AuthPath | null>(() => getAuthPath());
  const [blogSlug, setBlogSlug] = useState<string | null>(() => getBlogSlug());
  const [momentSlug, setMomentSlug] = useState<string | null>(() => getMomentSlug());
  const [showBlogIndex, setShowBlogIndex] = useState(() => isBlogIndex());
  const [showAdminAuth, setShowAdminAuth] = useState(() => isAdminAuthRoute());
  const [showAdminHub, setShowAdminHub] = useState(() => isAdminHubRoute() && !isAdminAuthRoute());
  const [profileComplete, setProfileComplete] = useState<boolean | null>(() =>
    typeof window !== "undefined" && requiresMemberRestoreBlocking(window.location.pathname, isNative)
      ? null
      : false
  );
  const [memberPathname, setMemberPathname] = useState(() =>
    typeof window !== "undefined" ? normalizePath(window.location.pathname) : "/"
  );
  const [complianceTick, setComplianceTick] = useState(0);
  const [pendingTab, setPendingTab] = useState<NavTab | null>(null);
  const [isAuthed, setIsAuthed] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [isPremium, setIsPremium] = useState(() => isPremiumActive());
  const [boostTick, setBoostTick] = useState(0);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentPhase, setPaymentPhase] = useState<CheckoutPhase>("idle");
  const [pricingOpen, setPricingOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [memberOverlay, setMemberOverlay] = useState<"visitors" | "premium" | "safety" | null>(null);
  const [notifVersion, setNotifVersion] = useState(0);
  const [paymentSuccess, setPaymentSuccess] = useState<{ title: string; body: string } | null>(null);
  const [paymentReturnPhase, setPaymentReturnPhase] = useState<"idle" | "verifying" | "success" | "failed">("idle");
  const [openAppLoading, setOpenAppLoading] = useState(false);
  const [memberSessionReady, setMemberSessionReady] = useState(false);
  const [memberSessionEpoch, setMemberSessionEpoch] = useState(0);
  const [paystackCallbackActive, setPaystackCallbackActive] = useState(
    () => isPaymentReturnPath() || hasPaystackCallbackInUrl()
  );
  const [paymentFlowTick, setPaymentFlowTick] = useState(0);
  const [bootStalled, setBootStalled] = useState(false);
  const [safeModeActive] = useState(() => isSafeMode());
  const [recoveryBanner, setRecoveryBanner] = useState(() => shouldShowRecoveryBanner());
  const paymentVerifyInFlight = useRef(false);
  const [user, setUser] = useState<UserProfile>(() =>
    safeUserProfile(readJson(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" }))
  );
  const isAuthedRef = useRef(isAuthed);
  const userRef = useRef(user);
  const logoutInProgressRef = useRef(false);

  const currentPathname = typeof window !== "undefined" ? normalizePath(window.location.pathname) : "/";
  const activeAuthPath = getAuthPath(currentPathname) ?? authPath;
  const isPublicSurface =
    !isNative && isPublicWebRoute(currentPathname) && !paystackCallbackActive;
  const isGuest = !isAuthed;
  const isPublicHome =
    !isNative && currentPathname === "/" && !paystackCallbackActive;
  const isOnboardingRoute = isOnboardingPath(currentPathname);
  const showMarketingHome =
    isPublicHome && !isOnboardingRoute && !paystackCallbackActive;
  const showGuestChrome = isGuest || showMarketingHome;
  void complianceTick;
  const datingProfileForCompliance = getDatingProfile();
  const showComplianceGate =
    isAuthed &&
    memberAppEntered &&
    !isPublicSurface &&
    !memberHydrating &&
    !isOnboardingRoute &&
    profileComplete === true &&
    shouldBlockForCompliance(datingProfileForCompliance.compliance, user);
  const complianceSyncPending = hasComplianceSyncPending();
  const memberAccessReady =
    isAuthed &&
    memberAppEntered &&
    memberSessionReady &&
    !authLoading &&
    !memberHydrating &&
    !openAppLoading &&
    !isPublicSurface &&
    profileComplete === true &&
    !showComplianceGate;
  const memberSurfaceBooting =
    isAuthed &&
    isMemberAppPath(currentPathname) &&
    !activeAuthPath &&
    (authLoading ||
      memberHydrating ||
      openAppLoading ||
      !memberSessionReady ||
      profileComplete === null);

  useEffect(() => {
    if (!isAuthed) return;
    logComplianceRoute({
      route: isOnboardingRoute ? "onboarding" : showComplianceGate ? "compliance" : "home",
      phase: complianceGatePhase(getDatingProfile().compliance),
      syncPending: complianceSyncPending
    });
  }, [complianceSyncPending, isAuthed, showComplianceGate, isOnboardingRoute, complianceTick]);

  useEffect(() => {
    if (!isAuthed || !complianceSyncPending) return;
    let cancelled = false;
    let attempts = 0;
    const MAX_COMPLIANCE_SYNC_ATTEMPTS = 12;
    const retry = () => {
      if (cancelled || attempts >= MAX_COMPLIANCE_SYNC_ATTEMPTS) return;
      attempts += 1;
      void retryPendingComplianceSync(user).then((ok) => {
        if (cancelled) return;
        if (ok) {
          setComplianceTick((tick) => tick + 1);
          return;
        }
        if (attempts >= MAX_COMPLIANCE_SYNC_ATTEMPTS) {
          if (import.meta.env.DEV) {
            console.warn("[bamsignal] retry_exhausted", {
              service: "compliance_sync",
              attempts
            });
          }
        }
      });
    };
    retry();
    const interval = window.setInterval(retry, 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [complianceSyncPending, isAuthed, user]);

  useEffect(() => {
    if (!memberHydrating) {
      setBootStalled(false);
      return;
    }
    const timer = window.setTimeout(() => setBootStalled(true), 20_000);
    return () => window.clearTimeout(timer);
  }, [memberHydrating]);


  useEffect(() => {
    rememberSuccessfulRoute();
  }, []);

  useEffect(() => {
    if (!safeModeActive) return;
    const stored = readJson<UserProfile>(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" });
    const authed = Boolean(stored.email || stored.phone);
    const nextPath = applySafeModeBoot(authed);
    if (authed) {
      setMemberAppEntered(true);
      setIsAuthed(true);
      setUser(safeUserProfile(stored));
      clearMemberSessionReady();
    }
    if (normalizePath(window.location.pathname) !== normalizePath(nextPath)) {
      navigateToPath(nextPath, true);
    }
  }, [safeModeActive]);

  useEffect(() => {
    void fetchSubscriptionCatalog().then(cacheSubscriptionCatalogPricing);
  }, []);

  useEffect(() => {
    const syncRoute = () => {
      const path = normalizePath(window.location.pathname);
      setMemberPathname(path);
      setPaystackCallbackActive(isPaymentReturnPath(path) || hasPaystackCallbackInUrl());
      const fromMemberTab = memberTabFromPath(path);
      if (fromMemberTab) setTab(fromMemberTab);
      redirectLegacyConsolePaths();
      redirectAuthSignupAliases();
      setLegalPath(getLegalPath());
      setSeoRoute(getSeoRoute());
      setNigeriaRoute(getNigeriaRoute());
      setSignalConciergeRoute(getSignalConciergeRoute());
      setSignalEventsRoute(getSignalEventsRoute());
      setBamSignalFoundationRoute(getBamSignalFoundationRoute());
      setBamSignalInstituteRoute(getBamSignalInstituteRoute());
      setAuthPath(getAuthPath());
      setBlogSlug(getBlogSlug());
      setMomentSlug(getMomentSlug());
      setShowBlogIndex(isBlogIndex());
      setShowAdminAuth(isAdminAuthRoute());
      const hub = isAdminHubRoute() && !isAdminAuthRoute();
      setShowAdminHub(hub);
      if (requiresMemberRestoreBlocking(window.location.pathname, isNative)) {
        setMemberAppEntered(true);
      }
      rememberSuccessfulRoute();
      if (hub) {
        const resolved = resolveHardHubPath();
        if (normalizePath(window.location.pathname) !== resolved) {
          navigateToPath(resolved, true);
        }
      }
    };
    window.addEventListener("popstate", syncRoute);
    syncRoute();
    return () => window.removeEventListener("popstate", syncRoute);
  }, [isNative]);

  useLayoutEffect(() => {
    if (!isUnknownSignalConciergeSubroute(memberPathname)) return;
    navigateToPath(SIGNAL_CONCIERGE_ROUTES.landing, true);
  }, [memberPathname]);

  useLayoutEffect(() => {
    if (!isUnknownSignalEventsSubroute(memberPathname)) return;
    navigateToPath(SIGNAL_EVENTS_ROUTES.landing, true);
  }, [memberPathname]);

  useLayoutEffect(() => {
    if (!isUnknownBamSignalFoundationSubroute(memberPathname)) return;
    navigateToPath(BAMSIGNAL_FOUNDATION_ROUTES.landing, true);
  }, [memberPathname]);

  useLayoutEffect(() => {
    if (!isUnknownBamSignalInstituteSubroute(memberPathname)) return;
    navigateToPath(BAMSIGNAL_INSTITUTE_ROUTES.landing, true);
  }, [memberPathname]);

  useLayoutEffect(() => {
    const routeAuth = getAuthPath();
    setAuthPath((current) => (current === routeAuth ? current : routeAuth));
  }, [memberPathname]);

  useEffect(() => {
    const pathname = normalizePath(window.location.pathname);
    const routeAuth = getAuthPath(pathname);
    if (routeAuth) {
      setAuthPath(routeAuth);
    }

    if (!isMemberAppPath(pathname)) return;
    const guard = evaluateMemberRouteGuard({
      authLoading,
      memberHydrating,
      memberSessionReady,
      isAuthed,
      profileComplete,
      pathname
    });
    if (
      (guard.phase === "redirect" || guard.phase === "unauthenticated") &&
      guard.redirectTo &&
      pathname !== normalizePath(guard.redirectTo)
    ) {
      const redirectAuth = getAuthPath(guard.redirectTo);
      if (redirectAuth) {
        setAuthPath(redirectAuth);
      }
      navigateToPath(guard.redirectTo, true);
    }
  }, [authLoading, memberHydrating, memberSessionReady, isAuthed, profileComplete, memberPathname]);

  useEffect(() => {
    if (isPublicWebRoute()) {
      setBooting(false);
      return;
    }
    let cancelled = false;
    const minMs = isNative ? 1200 : 800;
    const start = Date.now();
    const img = new Image();
    img.src = BRAND_ASSETS.logo;
    void Promise.all([
      new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      }),
      document.fonts?.ready ?? Promise.resolve()
    ]).then(() => {
      const delay = Math.max(0, minMs - (Date.now() - start));
      window.setTimeout(() => {
        if (cancelled) return;
        setBootExit(true);
        window.setTimeout(() => {
          if (!cancelled) setBooting(false);
        }, 450);
      }, delay);
    });
    return () => {
      cancelled = true;
    };
  }, [isNative]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.theme, theme);
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector("meta[name='theme-color']");
    meta?.setAttribute("content", theme === "dark" ? "#1a0a2e" : "#fdf2f8");
    const favicon = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (favicon) favicon.href = BRAND_ASSETS.favicon;
  }, [theme]);

  useEffect(() => {
    isAuthedRef.current = isAuthed;
    userRef.current = user;
  }, [isAuthed, user]);

  useEffect(() => {
    sanitizeStalePaymentState();
    setPaymentFlowTick((v) => v + 1);
    return subscribePaymentState(() => setPaymentFlowTick((v) => v + 1));
  }, []);

  useEffect(() => {
    clearStaleBootFlags();
    if (expireStaleOpenAppState()) {
      setOpenAppLoading(false);
    }
  }, []);

  useEffect(() => {
    writeJson(STORAGE_KEYS.userProfile, safeUserProfile(user));
  }, [user]);

  const syncPremiumState = useCallback(() => {
    pruneExpiredBoosts();
    setIsPremium(isPremiumActive());
  }, []);

  const markMemberSessionReady = useCallback(() => {
    setMemberSessionReady(true);
    setMemberSessionEpoch((epoch) => epoch + 1);
  }, []);

  const clearMemberSessionReady = useCallback(() => {
    setMemberSessionReady(false);
  }, []);

  const applyGoToAppResult = useCallback(
    (
      session: Extract<Awaited<ReturnType<typeof goToApp>>, { ok: true }>,
      meta: { blocking: boolean; source: string }
    ) => {
      setUser(session.user);
      restoreComplianceFromMarker(session.user);
      syncComplianceDoneMarkerFromProfile(session.user, getDatingProfile().compliance);
      void retryPendingComplianceSync(session.user);
      flowLog("profile_hydrate", { ok: true, route: session.route, reason: session.status?.reason });
      const datingProfile = getDatingProfile();
      const needsOnboarding = session.route === "onboarding";
      const paymentReturnActive = isPaymentReturnPath() || hasPaystackCallbackInUrl();
      setProfileComplete(!needsOnboarding);
      if (
        !paymentReturnActive &&
        (meta.blocking || memberAppEntered || !isPublicWebRoute())
      ) {
        if (isMemberAppPath() || requiresMemberRestoreBlocking(window.location.pathname, isNative)) {
          navigateToPath(needsOnboarding ? "/onboarding" : "/home", true);
        }
      }
      logRouteDecision(session.user, datingProfile, needsOnboarding ? "onboarding" : "home", {
        source: meta.source,
        hydrated: session.hydrated,
        repaired: session.status?.repaired,
        reason: session.status?.reason ?? null,
        blocking: meta.blocking
      });
      if (!needsOnboarding) {
        clearOnboardingDrafts();
        flowLog("session_restore_home");
      } else {
        flowLog("session_restore_onboarding");
      }
      void refreshPremiumStatus(session.user).then(() => syncPremiumState());
      flowLog("session_restore_done");
      markMemberSessionReady();
    },
    [markMemberSessionReady, memberAppEntered, syncPremiumState]
  );

  const applyRestoredSession = useCallback(async (profile: UserProfile, options?: { blocking?: boolean }) => {
    const blocking = options?.blocking ?? true;
    flowLog("session_restore_start", { blocking });
    clearMemberSessionReady();
    if (blocking) {
      setMemberHydrating(true);
    }
    repairMemberCaches();
    const stored = readJson<UserProfile>(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" });
    const merged = resolveMemberIdentity({
      ...profile,
      phone: stored.phone || profile.phone,
      phoneVerified: Boolean(stored.phoneVerified ?? profile.phoneVerified)
    });
    setUser(merged);
    setIsAuthed(true);
    recordStreakActivity();
    checkPremiumTrialExpiry();

    const finishRestore = async () => {
      const session = await goToApp({ forceOnboarding: false, loginEmail: merged.email || undefined });
      if (!session.ok) {
        setIsAuthed(false);
        setProfileComplete(false);
        clearMemberSessionReady();
        return;
      }
      applyGoToAppResult(session, { blocking, source: "session_restore" });
      hydrateMemberAppInBackground(merged, { loginEmail: merged.email || undefined });
    };

    if (blocking) {
      try {
        await finishRestore();
      } finally {
        setMemberHydrating(false);
      }
      return;
    }

    setMemberHydrating(true);
    void finishRestore().finally(() => {
      setMemberHydrating(false);
    });
  }, [applyGoToAppResult, clearMemberSessionReady]);

  useEffect(() => {
    if (memberAccessReady) recordDailyActive();
  }, [isAuthed, memberAccessReady]);

  useEffect(() => {
    if (!memberAccessReady) return;
    void refreshPremiumStatus(user).then(() => {
      syncPremiumState();
      applyPendingQuickieIntentIfNeeded(user);
    });
  }, [memberAccessReady, syncPremiumState, user]);

  const finishPaymentReturnRedirect = useCallback(
    (
      kind: "premium" | "boost" | "quickie",
      returnPath = getPaymentReturnPath(),
      meta = getPaymentReturnMeta()
    ) => {
      logPaymentEvent("payment_return_redirect", {
        returnPath,
        kind,
        productType: meta.productType,
        productId: meta.productId,
        sourcePage: meta.sourcePage
      });
      setMemberAppEntered(true);
      const memberTab = memberTabFromPath(returnPath);
      if (memberTab) setTab(memberTab);
      setPaymentReturnPhase("success");
      window.setTimeout(() => {
        navigateToPath(returnPath, true);
        clearPaystackCallbackParams(returnPath);
        setPaymentReturnPhase("idle");
      }, 900);
    },
    []
  );

  const applyPaymentSuccess = useCallback(
    (kind: "premium" | "boost" | "quickie", route?: VerifiedPaymentRoute) => {
      const returnPath = normalizePaymentReturnPath(route?.returnPath || getPaymentReturnPath());
      const storedMeta = getPaymentReturnMeta();
      const meta = {
        productType: kind,
        productId: route?.productId || storedMeta.productId,
        sourcePage: normalizePaymentReturnPath(route?.sourcePage || storedMeta.sourcePage)
      };
      const boostId =
        route?.boostId ||
        (kind === "boost" ? route?.productId : undefined) ||
        localStorage.getItem(STORAGE_KEYS.paymentBoostId) ||
        "city-boost";
      clearPaymentSession();
      setPaymentFlowState("success");
      setPaymentFlowTick((v) => v + 1);

      if (kind === "boost") {
        const datingProfile = normalizeDatingProfile(readJson(STORAGE_KEYS.datingProfile, {}));
        activateBoost(boostId as BoostProduct["id"], user, datingProfile, {
          expiresAt: route?.expiresAt || null
        });
        setBoostTick((tick) => tick + 1);
        void refreshPremiumStatus(user).then(() => syncPremiumState());
        const boostCopy = boostSuccessCopy(boostId as BoostProduct["id"], datingProfile.city);
        setPaymentSuccess(boostCopy);
        notifyBoostActivated(boostId);
        trackEvent("boost_activated", { product: boostId, paid: "true" });
      } else if (kind === "quickie") {
        applyQuickieIntentAfterPayment(user, route?.quickiePassUntil);
        setPaymentSuccess({
          title: "Payment successful",
          body: "Fast Connection is active."
        });
        trackEvent("quickie_unlock");
      } else {
        void refreshPremiumStatus(user).then(() => syncPremiumState());
        setPaymentSuccess({
          title: MONETIZATION_COPY.paymentSuccessTitle,
          body: MONETIZATION_COPY.paymentSuccessBody
        });
        trackEvent("payment_successful");
        notifyPremiumActivated();
      }
      setNotifVersion((v) => v + 1);
      finishPaymentReturnRedirect(kind, returnPath, meta);
    },
    [finishPaymentReturnRedirect, syncPremiumState, user]
  );

  const processPaymentReturn = useCallback(async () => {
    if (paymentVerifyInFlight.current) return;

    const params = new URLSearchParams(window.location.search);
    const urlRef = params.get("trxref") || params.get("reference");
    const state = getPaymentFlowState();
    const callbackActive = isPaymentReturnPath() || hasPaystackCallbackInUrl();

    if (!callbackActive && !urlRef && (state === "initializing" || state === "checkout_open")) return;
    if (!callbackActive && !urlRef && state !== "verifying") return;

    paymentVerifyInFlight.current = true;
    if (callbackActive) {
      setPaymentReturnPhase("verifying");
      setMemberAppEntered(true);
    }
    try {
      logPaymentEvent("verification started", { reference: urlRef || localStorage.getItem(STORAGE_KEYS.paymentReference) });
      const result = await completePendingPayment(userRef.current);
      setPaymentFlowTick((v) => v + 1);

      if (result.ok) {
        logPaymentEvent("verification result", { ok: true, kind: result.kind });
        applyPaymentSuccess(result.kind, {
          productId: result.productId,
          returnPath: result.returnPath,
          sourcePage: result.sourcePage,
          boostId: result.boostId,
          quickiePassUntil: result.quickiePassUntil,
          expiresAt: result.expiresAt
        });
        return;
      }

      if (result.pending) {
        logPaymentEvent("verification result", { ok: false, pending: true, kind: result.kind });
        return;
      }

      if (result.cancelled) {
        setPaymentFlowState("cancelled");
        setAuthMessage(fastConnectionPaymentFailureMessage());
        if (callbackActive) {
          const returnPath = getPaymentReturnPath();
          setPaymentReturnPhase("idle");
          navigateToPath(returnPath, true);
          clearPaystackCallbackParams(returnPath);
        }
        return;
      }

      if (getPaymentFlowState() !== "failed") {
        setPaymentFlowState("failed");
      }
      logPaymentEvent("verification result", { ok: false, kind: result.kind, error: result.error });
      if (result.error) {
        setAuthMessage(
          result.kind === "quickie" ? fastConnectionPaymentFailureMessage() : result.error
        );
      }
      if (callbackActive) setPaymentReturnPhase("failed");
    } finally {
      paymentVerifyInFlight.current = false;
      setPaymentLoading(false);
    }
  }, [applyPaymentSuccess, user]);

  useEffect(() => {
    if (!isNative) return;
    const listener = CapApp.addListener("appUrlOpen", (event) => {
      const parsed = parsePaymentReturnUrl(event.url);
      if (!parsed) return;
      logPaymentEvent("checkout callback", { reference: parsed.reference, mode: "deep-link" });
      localStorage.setItem(STORAGE_KEYS.paymentReference, parsed.reference);
      setPaymentFlowState("verifying");
      setPaymentFlowTick((v) => v + 1);
    });
    return () => {
      void listener.then((handle) => handle.remove());
    };
  }, [isNative]);

  useEffect(() => {
    if (!isNative) return;
    const listener = CapApp.addListener("appStateChange", ({ isActive }) => {
      if (!isActive) return;
      sanitizeStalePaymentState();
      if (isAuthedRef.current) {
        const profile = userRef.current;
        if (profile.email || profile.phone) {
          void hydrateMemberData(profile);
          void refreshPremiumStatus(profile).then(() => syncPremiumState());
        }
      }
      const state = getPaymentFlowState();
      if (state === "checkout_open" || state === "verifying") {
        logPaymentEvent("app resumed during payment", { state });
        setPaymentFlowTick((v) => v + 1);
      }
    });
    return () => {
      void listener.then((handle) => handle.remove());
    };
  }, [isNative]);

  useEffect(() => {
    if (!isAuthed || paystackCallbackActive) return;
    void processPaymentReturn();
  }, [isAuthed, paystackCallbackActive, processPaymentReturn, paymentFlowTick]);

  /** Re-check Supabase session when returning from Paystack / back button — never logout on payment failure. */
  useEffect(() => {
    if (!supabase) return;

    const refreshSessionSilently = async () => {
      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = profileFromSessionUser(session.user);
        setUser((prev) => ({
          ...profile,
          phone: prev.phone || profile.phone,
          phoneVerified: Boolean(prev.phoneVerified ?? profile.phoneVerified)
        }));
        setIsAuthed(true);
        setAuthLoading(false);
        const blocking = requiresMemberRestoreBlocking(window.location.pathname, isNative);
        if (blocking || memberAppEntered) {
          void hydrateMemberData(profile);
        }
        await refreshPremiumStatus(profile);
        syncPremiumState();
        return;
      }
      if (
        isAuthedRef.current &&
        readJson<UserProfile>(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" }).email
      ) {
        if (isPublicWebRoute()) {
          return;
        }
        setIsAuthed(true);
      }
    };

    const onReturnToApp = () => {
      if (document.visibilityState && document.visibilityState !== "visible") return;
      sanitizeStalePaymentState();
      void refreshSessionSilently();
      const state = getPaymentFlowState();
      if (state === "checkout_open" || state === "verifying") {
        setPaymentFlowTick((v) => v + 1);
      }
    };

    document.addEventListener("visibilitychange", onReturnToApp);
    window.addEventListener("pageshow", onReturnToApp);
    return () => {
      document.removeEventListener("visibilitychange", onReturnToApp);
      window.removeEventListener("pageshow", onReturnToApp);
    };
  }, [isAuthed, isNative, memberAppEntered, syncPremiumState]);

  useEffect(() => {
    if (!isNative) return;

    const listener = CapApp.addListener("backButton", () => {
      if (isHardRoute()) {
        const hardBack = new CustomEvent("bamsignal:hard-back", { cancelable: true });
        window.dispatchEvent(hardBack);
        return;
      }

      const backEvent = new CustomEvent("bamsignal:back", { cancelable: true });
      window.dispatchEvent(backEvent);
      if (backEvent.defaultPrevented) return;

      if (isOnboardingRoute) return;
      if (pricingOpen) {
        setPricingOpen(false);
        return;
      }
      if (notificationsOpen) {
        setNotificationsOpen(false);
        return;
      }
      if (memberOverlay) {
        setMemberOverlay(null);
        return;
      }
      if (legalPath) {
        navigateToPath("/");
        setLegalPath(null);
        return;
      }
      if (authPath) {
        navigateToPath("/");
        setAuthPath(null);
        return;
      }
      if (tab !== "home") {
        setTab("home");
        return;
      }
      void CapApp.exitApp();
    });

    return () => {
      void listener.then((handle) => handle.remove());
    };
  }, [isNative, isOnboardingRoute, pricingOpen, notificationsOpen, memberOverlay, legalPath, authPath, tab]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const openAuth = useCallback(
    (mode: AuthMode = "login", nextTab: NavTab | null = null) => {
      setPendingTab(nextTab ?? (tab !== "home" ? tab : null));
      navigateToPath(mode === "signup" ? AUTH_SIGNUP_PATH : AUTH_LOGIN_PATH);
      setAuthPath(mode === "signup" ? AUTH_SIGNUP_PATH : AUTH_LOGIN_PATH);
    },
    [tab]
  );

  const closeAuth = useCallback(() => {
    setPendingTab(null);
    setAuthMessage("");
    if (getAuthPath()) {
      navigateToPath("/");
      setAuthPath(null);
    }
  }, []);

  useLayoutEffect(() => {
    const route = getSignalConciergeRoute(memberPathname);
    if (!route || !isSignalConciergeAuthenticatedRoute(route)) return;
    if (authLoading || isAuthed || getAuthPath()) return;
    openAuth("login");
  }, [memberPathname, authLoading, isAuthed, openAuth]);

  const enterMemberApp = useCallback(() => {
    if (openAppLoading) return;

    setOpenAppLoading(true);
    clearMemberSessionReady();
    clearOpenAppPendingState();
    markOpenAppPending();

    let released = false;
    let routed = false;
    const releaseOpenApp = () => {
      if (released) return;
      released = true;
      window.clearTimeout(failsafeTimer);
      clearOpenAppPendingState();
      setOpenAppLoading(false);
    };

    const applyOpenAppResult = (result: Awaited<ReturnType<typeof goToApp>>) => {
      if (routed) return;
      routed = true;

      if (!result.ok) {
        setMemberAppEntered(false);
        setIsAuthed(false);
        setProfileComplete(false);
        clearMemberSessionReady();
        setAuthPath(AUTH_SIGNUP_PATH);
        navigateToPath(AUTH_SIGNUP_PATH, true);
        return;
      }

      setUser(result.user);
      setIsAuthed(true);
      setMemberAppEntered(true);
      setAuthMessage("");
      setProfileComplete(result.route === "home");
      markMemberSessionReady();

      if (result.route === "home") {
        clearOnboardingDrafts();
        setTab("home");
        navigateToPath("/home", true);
        flowLog("home_enter", {
          source: result.source === "cache_fallback" ? "open_app_cache_fallback" : "open_app_server_confirmed"
        });
      } else {
        navigateToPath("/onboarding", true);
        flowLog("onboarding_start", { source: "open_app_server_confirmed" });
      }

      hydrateMemberAppInBackground(
        result.user,
        { loginEmail: result.user.email || undefined },
        (bootstrap) => {
          if (bootstrap.nextRoute === "home" && result.route === "onboarding") {
            setProfileComplete(true);
            clearOnboardingDrafts();
            setTab("home");
            navigateToPath("/home", true);
            flowLog("home_enter", { source: "open_app_hydrate_repair" });
          }
        }
      );
    };

    const failsafeTimer = window.setTimeout(() => {
      if (routed) {
        releaseOpenApp();
        return;
      }
      void validateServerSessionWithTimeout(500).then((validated) => {
        if (!validated.ok) {
          applyOpenAppResult({ ok: false, route: "login" });
          releaseOpenApp();
          return;
        }
        if (readOpenAppOnboardingCache(validated.authUserId)) {
          applyOpenAppResult({
            ok: true,
            route: "home",
            user: validated.user,
            authUserId: validated.authUserId,
            status: null,
            hydrated: false,
            source: "cache_fallback"
          });
        } else {
          applyOpenAppResult({ ok: false, route: "login" });
        }
        releaseOpenApp();
      });
    }, OPEN_APP_FAILSAFE_MS);

    void goToApp({ loginEmail: undefined }).then((result) => {
      applyOpenAppResult(result);
      releaseOpenApp();
    });
  }, [clearMemberSessionReady, markMemberSessionReady, openAppLoading]);

  useEffect(() => {
    if (!paystackCallbackActive || authLoading) return;

    let cancelled = false;
    const bootAndVerify = async () => {
      const callbackReference =
        new URLSearchParams(window.location.search).get("trxref") ||
        new URLSearchParams(window.location.search).get("reference");
      if (callbackReference?.trim()) {
        localStorage.setItem(STORAGE_KEYS.paymentReference, callbackReference.trim());
      }

      if (supabase && !isAuthedRef.current) {
        const {
          data: { session }
        } = await supabase.auth.getSession();
        if (session?.user) {
          await applyRestoredSession(profileFromSessionUser(session.user), { blocking: false });
        }
      }
      if (cancelled) return;
      if (!isAuthedRef.current) {
        const stored = readJson<UserProfile>(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" });
        if (stored.email || stored.phone) {
          setUser(safeUserProfile(stored));
          setIsAuthed(true);
          clearMemberSessionReady();
          setMemberHydrating(true);
          void goToApp({ loginEmail: stored.email || undefined })
            .then((result) => {
              if (!result.ok) return;
              applyGoToAppResult(result, { blocking: false, source: "payment_return_recover" });
            })
            .finally(() => {
              setMemberHydrating(false);
            });
        }
      }
      if (cancelled) return;
      if (!userRef.current.email && !userRef.current.phone) {
        setPaymentReturnPhase("failed");
        openAuth("login");
        return;
      }
      await processPaymentReturn();
    };

    void bootAndVerify();
    return () => {
      cancelled = true;
    };
  }, [applyGoToAppResult, paystackCallbackActive, authLoading, applyRestoredSession, openAuth, processPaymentReturn]);

  const handleAuthenticated = useCallback(
    async (profile: UserProfile, meta?: AuthMeta) => {
      setMemberAppEntered(true);
      setMemberHydrating(true);
      clearMemberSessionReady();
      const stored = readJson<UserProfile>(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" });
      const withPhone = resolveMemberIdentity({
        ...profile,
        phone: stored.phone || profile.phone,
        phoneVerified: Boolean(stored.phoneVerified ?? profile.phoneVerified)
      });
      setUser(withPhone);
      setIsAuthed(true);
      restoreComplianceFromMarker(withPhone);
      setAuthMessage("");
      recordStreakActivity();
      checkPremiumTrialExpiry();
      flowLog("auth_signed_in", {
        isNewSignup: Boolean(meta?.isNewSignup),
        recovered: Boolean(meta?.recovered)
      });
      const ref = new URLSearchParams(window.location.search).get("ref");
      const forceOnboarding = Boolean(meta?.isNewSignup);
      if (meta?.isNewSignup) {
        trackEvent("signup_completed");
        markJoinedAt();
        markFirstDayStep("welcome");
        maybeGrantPremiumTrial(true, { notify: false });
        if (ref) trackEvent("referral_signup", { code: ref.toUpperCase() });
        const current = getDatingProfile();
        writeJson(
          STORAGE_KEYS.datingProfile,
          normalizeDatingProfile({
            ...current,
            interests: [],
            interestsTouched: false,
            onboardingComplete: false,
            setupCompleted: false
          })
        );
      } else if (meta?.recovered) {
        flowLog("signup_recovered_existing");
      }
      const appResult = await goToApp({
        forceOnboarding,
        referralCode: ref,
        loginEmail: meta?.loginEmail || withPhone.email
      });
      if (!appResult.ok) {
        setMemberHydrating(false);
        clearMemberSessionReady();
        setAuthPath(AUTH_SIGNUP_PATH);
        navigateToPath(AUTH_SIGNUP_PATH, true);
        return;
      }
      setUser(appResult.user);
      restoreComplianceFromMarker(appResult.user);
      syncComplianceDoneMarkerFromProfile(appResult.user, getDatingProfile().compliance);
      void retryPendingComplianceSync(appResult.user);
      flowLog(appResult.hydrated ? "profile_hydrate_ok" : "profile_hydrate_failed", {
        repaired: appResult.status?.repaired,
        reason: appResult.status?.reason ?? null
      });
      const needsOnboarding = appResult.route === "onboarding";
      logRouteDecision(appResult.user, getDatingProfile(), needsOnboarding ? "onboarding" : "home", {
        source: "auth_login",
        isNewSignup: forceOnboarding,
        hydrated: appResult.hydrated,
        repaired: appResult.status?.repaired,
        reason: appResult.status?.reason ?? null
      });
      if (getAuthPath() || isPublicWebRoute()) {
        navigateToPath(needsOnboarding ? "/onboarding" : "/home", true);
        setAuthPath(null);
      }
      setProfileComplete(!needsOnboarding);
      markMemberSessionReady();
      if (needsOnboarding) {
        setPendingTab(null);
        flowLog("onboarding_start");
        setMemberHydrating(false);
        void refreshPremiumStatus(appResult.user).then(() => syncPremiumState());
        hydrateMemberAppInBackground(appResult.user, {
          forceOnboarding,
          referralCode: ref,
          loginEmail: meta?.loginEmail || withPhone.email
        });
        return;
      }
      void refreshPremiumStatus(appResult.user).then(() => syncPremiumState());
      clearOnboardingDrafts();
      if (pendingTab) {
        setTab(pendingTab);
        setPendingTab(null);
        if (memberAppEntered) {
          navigateToPath(memberPathForTab(pendingTab), true);
        }
      } else {
        setTab("home");
      }
      flowLog("home_enter");
      setMemberHydrating(false);
      hydrateMemberAppInBackground(appResult.user, {
        forceOnboarding,
        referralCode: ref,
        loginEmail: meta?.loginEmail || withPhone.email
      });
    },
    [clearMemberSessionReady, markMemberSessionReady, pendingTab]
  );

  useEffect(() => {
    if (!authLoading) {
      setBootStalled(false);
      return;
    }
    const timer = window.setTimeout(() => setBootStalled(true), 12000);
    return () => window.clearTimeout(timer);
  }, [authLoading]);

  useEffect(() => {
    if (import.meta.env.DEV) {
      rememberUsernameEmail(DEMO_USER.username, DEMO_USER.profile.email);
    }

    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    let cancelled = false;
    let bootstrapDone = false;
    let sessionRestored = false;
    const shouldBlockBoot = requiresMemberRestoreBlocking(window.location.pathname, isNative);

    const finishBootstrap = () => {
      if (!cancelled && !bootstrapDone) {
        bootstrapDone = true;
        setAuthLoading(false);
      }
    };

    const restoreFromSession = async (
      session: {
        user: {
          id?: string;
          email?: string | null;
          user_metadata?: Record<string, unknown>;
        };
      } | null,
      options?: { blocking?: boolean }
    ) => {
      if (!session?.user || sessionRestored) return;

      sessionRestored = true;
      const blocking = options?.blocking ?? shouldBlockBoot;
      const profile = profileFromSessionUser(session.user);
      const authUserId = String(session.user.id || "").trim();

      if (!blocking) {
        await applyRestoredSession(profile, { blocking: false });
        return;
      }

      flowLog("session_restore_start", { blocking: true });
      repairMemberCaches();
      const stored = readJson<UserProfile>(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" });
      const merged = resolveMemberIdentity({
        ...profile,
        phone: stored.phone || profile.phone,
        phoneVerified: Boolean(stored.phoneVerified ?? profile.phoneVerified)
      });
      setMemberHydrating(true);
      clearMemberSessionReady();
      setUser(merged);
      setIsAuthed(true);
      recordStreakActivity();
      checkPremiumTrialExpiry();

      try {
        const validated = await validateServerSessionWithTimeout(OPEN_APP_FAILSAFE_MS);
        if (!validated.ok) {
          setIsAuthed(false);
          setProfileComplete(false);
          clearMemberSessionReady();
          return;
        }
        const appSession = await goToApp({
          loginEmail: merged.email || undefined,
          validatedAuth: validated
        });
        if (!appSession.ok) {
          setIsAuthed(false);
          setProfileComplete(false);
          clearMemberSessionReady();
          return;
        }
        applyGoToAppResult(appSession, { blocking: false, source: "session_restore" });
        setProfileComplete(appSession.route === "home");
        hydrateMemberAppInBackground(merged, { loginEmail: merged.email || undefined });
        flowLog("session_restore_done");
      } finally {
        setMemberHydrating(false);
      }
    };

    const finishPublicBootstrap = (
      session: { user: { email?: string | null; user_metadata?: Record<string, unknown> } } | null
    ) => {
      finishBootstrap();
      if (!session?.user) return;
      const quickProfile = resolveMemberIdentity(profileFromSessionUser(session.user));
      setUser(quickProfile);
      setIsAuthed(true);
      void restoreFromSession(session, { blocking: false });
    };

    void supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (cancelled) return;
        if (!shouldBlockBoot) {
          finishPublicBootstrap(session);
          return;
        }
        finishBootstrap();
        void restoreFromSession(session, { blocking: true });
      })
      .catch(() => {
        if (!cancelled) finishBootstrap();
      });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (cancelled) return;

      if (event === "INITIAL_SESSION") {
        if (!shouldBlockBoot) {
          finishPublicBootstrap(session);
          return;
        }
        finishBootstrap();
        if (session?.user) {
          await restoreFromSession(session, { blocking: true });
        }
        return;
      }

      if (event === "SIGNED_IN" && session?.user) {
        // AuthPage calls onAuthenticated after password login / signup verify.
        if (getAuthPath()) return;
        const blocking = requiresMemberRestoreBlocking(window.location.pathname, isNative);
        await restoreFromSession(session, { blocking });
        return;
      }

      if ((event === "TOKEN_REFRESHED" || event === "USER_UPDATED") && session?.user) {
        const profile = resolveMemberIdentity(profileFromSessionUser(session.user));
        setUser(profile);
        setIsAuthed(true);
        const onMemberSurface =
          requiresMemberRestoreBlocking(window.location.pathname, isNative) ||
          !isPublicWebRoute();
        if (onMemberSurface && isMemberAppPath()) {
          clearMemberSessionReady();
          setMemberHydrating(true);
        }
        void goToApp()
          .then((sessionResult) => {
            if (!sessionResult.ok) {
              clearMemberSessionReady();
              return;
            }
            if (onMemberSurface) {
              setProfileComplete(sessionResult.route === "home");
              markMemberSessionReady();
              if (sessionResult.route === "onboarding" && !isOnboardingPath()) {
                navigateToPath("/onboarding", true);
              } else if (sessionResult.route === "home" && isOnboardingPath()) {
                navigateToPath("/home", true);
              }
            }
            if (sessionResult.route === "home") clearOnboardingDrafts();
          })
          .finally(() => {
            setMemberHydrating(false);
          });
        await refreshPremiumStatus(profile);
        syncPremiumState();
        return;
      }

      if (event === "SIGNED_OUT") {
        if (logoutInProgressRef.current) return;

        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const blocking = requiresMemberRestoreBlocking(window.location.pathname, isNative);
            await restoreFromSession(session, { blocking });
            return;
          }
          const refreshed = await supabase.auth.refreshSession();
          if (refreshed.data.session?.user) {
            const blocking = requiresMemberRestoreBlocking(window.location.pathname, isNative);
            await restoreFromSession(refreshed.data.session, { blocking });
            return;
          }
        }
        const stored = readJson<UserProfile>(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" });
        if (stored.email || stored.phone) {
          if (isPublicWebRoute()) {
            clearMemberSessionCaches();
            setIsAuthed(false);
            setMemberAppEntered(isNative);
            setProfileComplete(false);
            clearMemberSessionReady();
            setIsPremium(false);
            setUser({ name: "", email: "", phone: "" });
            setTab("home");
            return;
          }
          clearMemberSessionReady();
          setMemberHydrating(true);
          setIsAuthed(true);
          setUser((prev) => ({
            ...stored,
            phone: prev.phone || stored.phone,
            phoneVerified: Boolean(prev.phoneVerified ?? stored.phoneVerified)
          }));
          void goToApp({ loginEmail: stored.email || undefined })
            .then((result) => {
              if (!result.ok) {
                clearMemberSessionCaches();
                setIsAuthed(false);
                setProfileComplete(false);
                clearMemberSessionReady();
                setUser({ name: "", email: "", phone: "" });
                return;
              }
              applyGoToAppResult(result, { blocking: false, source: "signed_out_recover" });
            })
            .finally(() => {
              setMemberHydrating(false);
            });
          return;
        }
        clearMemberSessionCaches();
        setIsAuthed(false);
        setProfileComplete(false);
        clearMemberSessionReady();
        setIsPremium(false);
        setUser({ name: "", email: "", phone: "" });
        setTab("home");
      }
    });

    const fallback = window.setTimeout(finishBootstrap, 8000);

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      window.clearTimeout(fallback);
    };
  }, [applyGoToAppResult, applyRestoredSession, clearMemberSessionReady, isNative, markMemberSessionReady, syncPremiumState]);

  useEffect(() => {
    if (authLoading || memberHydrating || !isAuthed) return;
    const routeAuthPath = getAuthPath();
    if (!routeAuthPath) return;
    let cancelled = false;
    void goToApp({ loginEmail: user.email }).then((result) => {
      if (cancelled || !result.ok) return;
      const needsOnboarding = result.route === "onboarding";
      logRouteDecision(result.user, getDatingProfile(), needsOnboarding ? "onboarding" : "home", {
        source: "auth_path_guard",
        repaired: result.status?.repaired,
        reason: result.status?.reason ?? null
      });
      setUser(result.user);
      setProfileComplete(!needsOnboarding);
      markMemberSessionReady();
      navigateToPath(needsOnboarding ? "/onboarding" : "/home", true);
    });
    return () => {
      cancelled = true;
    };
  }, [authLoading, memberHydrating, memberSessionReady, isAuthed, memberPathname, user.email, markMemberSessionReady]);

  const reloadApp = useCallback(() => {
    window.location.reload();
  }, []);

  const finishOnboarding = useCallback(() => {
    setMemberAppEntered(true);
    setProfileComplete(true);
    markMemberSessionReady();
    clearOnboardingDrafts();
    setTab("home");
    navigateToPath("/home", true);
    setComplianceTick((tick) => tick + 1);
    void refreshPremiumStatus(user).then(() => {
      syncPremiumState();
      if (isPremiumTrialActive()) {
        notifyPremiumActivated();
      }
    });
  }, [markMemberSessionReady, syncPremiumState, user]);

  const resetLoggedOutState = useCallback(() => {
    clearMemberSessionCaches();
    setIsAuthed(false);
    setMemberAppEntered(isNative);
    setProfileComplete(false);
    clearMemberSessionReady();
    setIsPremium(false);
    setPaymentLoading(false);
    setPricingOpen(false);
    setNotificationsOpen(false);
    setMemberOverlay(null);
    setUser({ name: "", email: "", phone: "" });
    setTab("home");
    navigateToPath("/");
    setAuthPath(null);
    setLegalPath(null);
  }, [clearMemberSessionReady, isNative]);

  const handleLogout = useCallback(() => {
    logoutInProgressRef.current = true;
    resetLoggedOutState();
    void supabase?.auth.signOut().catch(() => undefined).finally(() => {
      window.setTimeout(() => {
        logoutInProgressRef.current = false;
      }, 3000);
    });
  }, [resetLoggedOutState]);

  const navigateTab = useCallback(
    (next: NavTab) => {
      if (isAuthed && !memberAppEntered && (next !== "home" || !showMarketingHome)) {
        enterMemberApp();
      }
      setMemberOverlay(null);
      setTab(next);
      if (isAuthed && memberAppEntered && profileComplete === true) {
        navigateToPath(memberPathForTab(next));
      }
    },
    [enterMemberApp, isAuthed, memberAppEntered, showMarketingHome, profileComplete]
  );

  const handleNotificationOpen = useCallback(
    (notification: AppNotification) => {
      setNotificationsOpen(false);
      setNotifVersion((v) => v + 1);
      const destination = notificationDestination(notification.type);
      if (!destination) return;
      if (destination.kind === "tab") {
        navigateTab(destination.tab);
        return;
      }
      setMemberOverlay(destination.overlay);
    },
    [navigateTab]
  );

  const handleUpgrade = useCallback(
    async (plan: PremiumPlan) => {
      if (!isAuthed) {
        openAuth("signup", tab === "home" ? "discover" : tab);
        return;
      }
      if (paymentLoading) return;

      setPaymentFlowTick((v) => v + 1);
      setPaymentLoading(true);
      setPaymentPhase("preparing");
      setAuthMessage("");
      trackEvent("payment_started", { plan: plan.id });
      try {
        const result = await startPlanPayment(
          plan,
          user,
          {
            onPhase: (phase) => setPaymentPhase(phase)
          },
          {
            returnPath: resolvePaymentReturnPath({ tab, pathname: memberPathname }),
            sourcePage: memberPathname || memberPathForTab(tab),
            productType: "premium",
            productId: plan.id
          }
        );
        setPaymentFlowTick((v) => v + 1);

        if (!result.ok) {
          if (result.cancelled) {
            if (checkoutWasOpened()) {
              setAuthMessage(USER_MESSAGES.paymentNotCompleted);
            }
            return;
          }
          setAuthMessage(result.error || MONETIZATION_COPY.checkoutStartFailed);
          return;
        }

        setPricingOpen(false);
        setMemberOverlay(null);
        if (result.needsVerify) {
          await processPaymentReturn();
        }
      } finally {
        setPaymentLoading(false);
        setPaymentPhase("idle");
      }
    },
    [isAuthed, memberPathname, openAuth, paymentLoading, processPaymentReturn, tab, user]
  );

  const startPremiumCheckout = useCallback(
    (plan?: PremiumPlan) => {
      const target = plan ?? defaultPremiumPlan(plans);
      if (target) void handleUpgrade(target);
    },
    [handleUpgrade, plans]
  );

  const handlePurchaseBoost = useCallback(
    async (product: BoostProduct) => {
      if (!isAuthed) {
        openAuth("signup", tab === "home" ? "discover" : tab);
        return;
      }
      if (!user.email) {
        setAuthMessage("Add a verified email before purchasing a boost.");
        return;
      }
      const memberCity = getMemberCity();
      if (boostNeedsMemberCity(product.id) && !memberCity) {
        setAuthMessage("Set your city in Edit Profile before buying this boost.");
        return;
      }

      const datingProfile = normalizeDatingProfile(readJson(STORAGE_KEYS.datingProfile, {}));

      setPaymentFlowTick((v) => v + 1);
      setPaymentLoading(true);
      setPaymentPhase("preparing");
      setAuthMessage("");
      try {
        const result = await startBoostPayment(
          product.id,
          user,
          memberCity || datingProfile.city || "",
          { onPhase: (phase) => setPaymentPhase(phase) },
          {
            returnPath: "/profile",
            sourcePage: "/profile",
            productType: "boost",
            productId: product.id
          }
        );
        setPaymentFlowTick((v) => v + 1);
        if (!result.ok) {
          if (result.cancelled) {
            if (checkoutWasOpened()) {
              setAuthMessage(USER_MESSAGES.paymentNotCompleted);
            }
            return;
          }
          setAuthMessage(result.error || MONETIZATION_COPY.checkoutStartFailed);
          return;
        }
        setPricingOpen(false);
        if (result.needsVerify) {
          await processPaymentReturn();
        }
      } finally {
        setPaymentLoading(false);
        setPaymentPhase("idle");
      }
    },
    [isAuthed, openAuth, processPaymentReturn, tab, user]
  );

  const paymentOverlayMessage =
    paymentPhase === "opening"
      ? MONETIZATION_COPY.checkoutOpening
      : MONETIZATION_COPY.checkoutLoading;

  const upgradeById = useCallback(
    (planId: string) => {
      const plan = plans.find((p) => p.id === planId);
      if (plan) void handleUpgrade(plan);
    },
    [handleUpgrade, plans]
  );

  const premiumCheckoutValue = useMemo(
    () => ({
      busy: paymentLoading,
      phase: paymentPhase,
      label: paymentOverlayMessage,
      startPremiumCheckout
    }),
    [paymentLoading, paymentOverlayMessage, paymentPhase, startPremiumCheckout]
  );

  const openHardLogin = () => {
    navigateToPath(HARD_AUTH_PATH);
    setShowAdminHub(false);
    setShowAdminAuth(true);
  };

  const goHome = () => {
    closeAuth();
    setTab("home");
    setShowBlogIndex(false);
    setBlogSlug(null);
    setMomentSlug(null);
    if (getLegalPath() || isBlogIndex() || getBlogSlug() || getMomentSlug()) {
      navigateToPath("/");
      setLegalPath(null);
    }
  };

  const showPaymentRecovery =
    isAuthed &&
    !safeModeActive &&
    !paymentSuccess &&
    !paymentLoading &&
    !isActivePaymentFlow() &&
    shouldShowPaymentRecovery();
  void paymentFlowTick;
  const notificationUnread = useMemo(() => unreadCount(), [notifVersion]);
  const incomingSignals = filterBlockedByProfileId(
    readJson<{ profileId: string }[]>(STORAGE_KEYS.likedBy, [])
  ).length;
  const messageCount = filterBlockedByProfileId(readJson<Match[]>(STORAGE_KEYS.matches, [])).length;

  if (
    normalizePath(window.location.pathname) === "/store-screenshots" &&
    (import.meta.env.VITE_STORE_SCREENSHOTS === "true" || import.meta.env.DEV)
  ) {
    return (
      <Suspense fallback={<LazyRouteFallback />}>
        <LazyPublicMarketingRoutes
          variant="store-screenshots"
          theme={theme}
          onToggleTheme={toggleTheme}
          onLogoClick={goHome}
          onLogin={() => openAuth("login")}
          onSignup={() => openAuth("signup", "discover")}
        />
      </Suspense>
    );
  }

  if (paystackCallbackActive) {
    return (
      <div className={`app ${theme}`}>
        <PaymentReturnScreen phase={paymentReturnPhase === "idle" ? "verifying" : paymentReturnPhase} />
      </div>
    );
  }

  if (showAdminAuth || showAdminHub) {
    return (
      <Suspense fallback={<LazyRouteFallback subtitle="Loading command center…" />}>
        <LazyAdminConsoleRoot
          mode={showAdminAuth ? "auth" : "hub"}
          onAuthed={() => {
            setShowAdminAuth(false);
            setShowAdminHub(true);
          }}
          onLogout={openHardLogin}
          onUnauthorized={openHardLogin}
        />
      </Suspense>
    );
  }

  if (activeAuthPath && !paystackCallbackActive) {
    return (
      <div className={`app ${theme}`}>
        <LoveAuthRoutePage
          path={activeAuthPath}
          onAuthenticated={handleAuthenticated}
          message={authMessage}
          onMessage={setAuthMessage}
        />
      </div>
    );
  }

  const memberRouteGuard = isMemberAppPath(currentPathname)
    ? evaluateMemberRouteGuard({
        authLoading,
        memberHydrating,
        memberSessionReady,
        isAuthed,
        profileComplete,
        pathname: currentPathname
      })
    : null;

  const onPublicWebRoute = isPublicWebRoute(currentPathname) && !paystackCallbackActive;

  const shouldBlockForAuthRestore =
    !onPublicWebRoute &&
    (memberRouteGuard?.phase === "loading" ||
      (requiresMemberRestoreBlocking(window.location.pathname, isNative) &&
        (authLoading || memberHydrating)));

  if (shouldBlockForAuthRestore) {
    return (
      <div className={`app ${theme}`}>
        <Preloader
          exiting={false}
          subtitle={memberHydrating ? "Restoring your account…" : "Restoring your session…"}
          showReload={bootStalled}
          onReload={reloadApp}
        />
      </div>
    );
  }

  if (
    memberRouteGuard &&
    (memberRouteGuard.phase === "redirect" || memberRouteGuard.phase === "unauthenticated")
  ) {
    return (
      <div className={`app ${theme}`}>
        <Preloader
          exiting={false}
          subtitle="Redirecting…"
          showReload={bootStalled}
          onReload={reloadApp}
        />
      </div>
    );
  }

  if (booting) {
    return (
      <div className={`app ${theme}`}>
        <Preloader exiting={bootExit} />
      </div>
    );
  }

  if (momentSlug && getMomentPage(momentSlug)) {
    return (
      <div className={`app ${theme} platform-root`}>
        <div className="platform-shell platform-shell--legal">
          <TopNav
            theme={theme}
            onToggleTheme={toggleTheme}
            isPremium={isPremium}
            isGuest={isGuest}
            onLogin={() => openAuth("login")}
            onLogoClick={goHome}
            showNotifications={isAuthed}
            notificationCount={notificationUnread}
            onNotificationsClick={() => setNotificationsOpen(true)}
            showFoundingMember={false}
            memberFirstName={
              isAuthed ? memberFirstName(user) : undefined
            }
          />
          <main className="app-main app-main--legal">
            <Suspense fallback={<LazyRouteFallback />}>
              <LazyMomentPage
                momentId={momentSlug as MomentPageId}
                onSignup={() => openAuth("signup", "discover")}
              />
            </Suspense>
          </main>
        </div>
      </div>
    );
  }

  if (showBlogIndex || blogSlug) {
    const post = blogSlug ? getBlogPost(blogSlug) : null;
    return (
      <Suspense fallback={<LazyRouteFallback subtitle="Loading guides…" />}>
        <LazyPublicMarketingRoutes
          variant={post ? "blog-post" : blogSlug ? "blog-missing" : "blog-index"}
          theme={theme}
          onToggleTheme={toggleTheme}
          onLogoClick={goHome}
          onLogin={() => openAuth("login")}
          onSignup={() => openAuth("signup", "discover")}
          onBackToBlog={() => navigateToPath("/blog")}
          blogPost={post}
        />
      </Suspense>
    );
  }

  if (shouldShowPublicNotFound(window.location.pathname, isNative) && !activeAuthPath) {
    return (
      <Suspense fallback={<LazyRouteFallback />}>
        <LazyPublicMarketingRoutes
          variant="not-found"
          theme={theme}
          onToggleTheme={toggleTheme}
          onLogoClick={goHome}
          onLogin={() => openAuth("login")}
          onSignup={() => openAuth("signup", "discover")}
        />
      </Suspense>
    );
  }

  if (nigeriaRoute) {
    return (
      <Suspense fallback={<LazyRouteFallback subtitle="Loading…" />}>
        <LazyPublicMarketingRoutes
          variant="nigeria"
          theme={theme}
          onToggleTheme={toggleTheme}
          onLogoClick={goHome}
          onLogin={() => openAuth("login")}
          onSignup={() => openAuth("signup", "discover")}
          nigeriaRoute={nigeriaRoute}
        />
      </Suspense>
    );
  }

  if (seoRoute) {
    return (
      <Suspense fallback={<LazyRouteFallback subtitle="Loading…" />}>
        <LazyPublicMarketingRoutes
          variant="seo"
          theme={theme}
          onToggleTheme={toggleTheme}
          onLogoClick={goHome}
          onLogin={() => openAuth("login")}
          onSignup={() => openAuth("signup", "discover")}
          seoRoute={seoRoute}
        />
      </Suspense>
    );
  }

  if (signalConciergeRoute) {
    if (
      isUnknownSignalConciergeSubroute(currentPathname) ||
      (isSignalConciergeAuthenticatedRoute(signalConciergeRoute) && (authLoading || !isAuthed))
    ) {
      return (
        <div className={`app ${theme}`}>
          <Preloader
            exiting={false}
            subtitle={
              isUnknownSignalConciergeSubroute(currentPathname)
                ? "Redirecting…"
                : authLoading
                  ? "Restoring your session…"
                  : "Redirecting to login…"
            }
            showReload={bootStalled}
            onReload={reloadApp}
          />
        </div>
      );
    }

    const signalConciergeShellProps = {
      theme,
      onToggleTheme: toggleTheme,
      onLogoClick: goHome,
      onLogin: isAuthed ? undefined : () => openAuth("login")
    };

    return (
      <Suspense fallback={<LazyRouteFallback subtitle="Loading Signal Concierge…" />}>
        {signalConciergeRoute === "landing" ? (
          <LazySignalConciergeLandingPage {...signalConciergeShellProps} />
        ) : signalConciergeRoute === "apply" ? (
          <LazySignalConciergeApplicationPage {...signalConciergeShellProps} />
        ) : signalConciergeRoute === "status" ? (
          <LazySignalConciergeStatusPage {...signalConciergeShellProps} />
        ) : signalConciergeRoute === "consultation" ? (
          <LazySignalConciergeConsultationPage {...signalConciergeShellProps} />
        ) : signalConciergeRoute === "shareStory" ? (
          <LazyShareYourStoryPage {...signalConciergeShellProps} />
        ) : signalConciergeRoute === "privacy" ? (
          <LazySignalConciergePrivacyPage {...signalConciergeShellProps} />
        ) : (
          <LazySignalConciergeFaqPage {...signalConciergeShellProps} />
        )}
      </Suspense>
    );
  }

  if (signalEventsRoute) {
    const signalEventsShellProps = {
      theme,
      onToggleTheme: toggleTheme,
      onLogoClick: goHome,
      onLogin: isAuthed ? undefined : () => openAuth("login")
    };

    return (
      <Suspense fallback={<LazyRouteFallback subtitle="Loading Signal Events…" />}>
        {signalEventsRoute.kind === "hub" && signalEventsRoute.route === "landing" ? (
          <LazySignalEventsHubPage {...signalEventsShellProps} />
        ) : signalEventsRoute.kind === "hub" && signalEventsRoute.route === "communities" ? (
          <LazySignalEventsCommunitiesPage {...signalEventsShellProps} />
        ) : signalEventsRoute.kind === "hub" && signalEventsRoute.route === "diaspora" ? (
          <LazySignalEventsDiasporaPage {...signalEventsShellProps} />
        ) : signalEventsRoute.kind === "hub" && signalEventsRoute.route === "communityJourney" ? (
          <LazySignalEventsCommunityJourneyPage {...signalEventsShellProps} />
        ) : signalEventsRoute.kind === "hub" && signalEventsRoute.route === "diasporaCorridors" ? (
          <LazySignalEventsDiasporaCorridorsPage {...signalEventsShellProps} />
        ) : signalEventsRoute.kind === "hub" && signalEventsRoute.route === "corridorStories" ? (
          <LazySignalEventsCorridorStoriesPage {...signalEventsShellProps} />
        ) : signalEventsRoute.kind === "hub" && signalEventsRoute.route === "legacyCities" ? (
          <LazySignalEventsLegacyCitiesPage {...signalEventsShellProps} />
        ) : signalEventsRoute.kind === "hub" && signalEventsRoute.route === "cityAmbassadors" ? (
          <LazySignalEventsCityAmbassadorsPage {...signalEventsShellProps} />
        ) : signalEventsRoute.kind === "hub" && signalEventsRoute.route === "globalRelationshipMap" ? (
          <LazySignalEventsGlobalRelationshipMapPage {...signalEventsShellProps} />
        ) : signalEventsRoute.kind === "city" ? (
          <LazySignalEventsCityPage
            {...signalEventsShellProps}
            citySlug={signalEventsRoute.citySlug}
          />
        ) : (
          <LazySignalEventsHubPage {...signalEventsShellProps} />
        )}
      </Suspense>
    );
  }

  if (bamSignalFoundationRoute) {
    const foundationShellProps = {
      theme,
      onToggleTheme: toggleTheme,
      onLogoClick: goHome,
      onLogin: isAuthed ? undefined : () => openAuth("login")
    };

    return (
      <Suspense fallback={<LazyRouteFallback subtitle="Loading BamSignal Foundation…" />}>
        {bamSignalFoundationRoute === "landing" ? (
          <LazyBamSignalFoundationLandingPage {...foundationShellProps} />
        ) : bamSignalFoundationRoute === "programs" ? (
          <LazyBamSignalFoundationProgramsPage {...foundationShellProps} />
        ) : (
          <LazyBamSignalFoundationStoriesPage {...foundationShellProps} />
        )}
      </Suspense>
    );
  }

  if (bamSignalInstituteRoute) {
    const instituteShellProps = {
      theme,
      onToggleTheme: toggleTheme,
      onLogoClick: goHome,
      onLogin: isAuthed ? undefined : () => openAuth("login")
    };

    return (
      <Suspense fallback={<LazyRouteFallback subtitle="Loading BamSignal Institute…" />}>
        {bamSignalInstituteRoute === "landing" ? (
          <LazyBamSignalInstituteLandingPage {...instituteShellProps} />
        ) : bamSignalInstituteRoute === "programs" ? (
          <LazyBamSignalInstituteProgramsPage {...instituteShellProps} />
        ) : bamSignalInstituteRoute === "annualInsights" ? (
          <LazyBamSignalInstituteAnnualInsightsPage {...instituteShellProps} />
        ) : bamSignalInstituteRoute === "annualRelationshipReports" ? (
          <LazyBamSignalInstituteAnnualRelationshipReportsPage {...instituteShellProps} />
        ) : bamSignalInstituteRoute === "relationshipLab" ? (
          <LazyBamSignalInstituteRelationshipLabPage {...instituteShellProps} />
        ) : bamSignalInstituteRoute === "bamSignalInsights" ? (
          <LazyBamSignalInstituteInsightsPage {...instituteShellProps} />
        ) : bamSignalInstituteRoute === "researchPartnerships" ? (
          <LazyBamSignalInstituteResearchPartnershipsPage {...instituteShellProps} />
        ) : bamSignalInstituteRoute === "relationshipIndex" ? (
          <LazyBamSignalInstituteRelationshipIndexPage {...instituteShellProps} />
        ) : bamSignalInstituteRoute === "bamSignalObservatory" ? (
          <LazyBamSignalInstituteObservatoryPage {...instituteShellProps} />
        ) : bamSignalInstituteRoute === "hallOfLegacy" ? (
          <LazyBamSignalInstituteHallOfLegacyPage {...instituteShellProps} />
        ) : bamSignalInstituteRoute === "africanRelationshipArchive" ? (
          <LazyBamSignalInstituteAfricanRelationshipArchivePage {...instituteShellProps} />
        ) : bamSignalInstituteRoute === "bamSignalAcademy" ? (
          <LazyBamSignalInstituteAcademyPage {...instituteShellProps} />
        ) : bamSignalInstituteRoute === "academyPrograms" ? (
          <LazyBamSignalInstituteAcademyProgramsPage {...instituteShellProps} />
        ) : bamSignalInstituteRoute === "learningPaths" ? (
          <LazyBamSignalInstituteLearningPathsPage {...instituteShellProps} />
        ) : bamSignalInstituteRoute === "relationshipMasterclasses" ? (
          <LazyBamSignalInstituteRelationshipMasterclassesPage {...instituteShellProps} />
        ) : bamSignalInstituteRoute === "premaritalJourney" ? (
          <LazyBamSignalInstitutePremaritalJourneyPage {...instituteShellProps} />
        ) : bamSignalInstituteRoute === "bamSignalLibrary" ? (
          <LazyBamSignalInstituteLibraryPage {...instituteShellProps} />
        ) : bamSignalInstituteRoute === "relationshipCertificates" ? (
          <LazyBamSignalInstituteRelationshipCertificatesPage {...instituteShellProps} />
        ) : bamSignalInstituteRoute === "bamSignalFellows" ? (
          <LazyBamSignalInstituteFellowsPage {...instituteShellProps} />
        ) : bamSignalInstituteRoute === "africanRelationshipCurriculum" ? (
          <LazyBamSignalInstituteAfricanRelationshipCurriculumPage {...instituteShellProps} />
        ) : bamSignalInstituteRoute === "bamSignalTrust" ? (
          <LazyBamSignalInstituteTrustPage {...instituteShellProps} />
        ) : bamSignalInstituteRoute === "verifiedProfessionals" ? (
          <LazyBamSignalInstituteVerifiedProfessionalsPage {...instituteShellProps} />
        ) : bamSignalInstituteRoute === "relationshipCoachNetwork" ? (
          <LazyBamSignalInstituteRelationshipCoachNetworkPage {...instituteShellProps} />
        ) : bamSignalInstituteRoute === "familyAdvisors" ? (
          <LazyBamSignalInstituteFamilyAdvisorsPage {...instituteShellProps} />
        ) : bamSignalInstituteRoute === "faithNetwork" ? (
          <LazyBamSignalInstituteFaithNetworkPage {...instituteShellProps} />
        ) : bamSignalInstituteRoute === "diasporaServices" ? (
          <LazyBamSignalInstituteDiasporaServicesPage {...instituteShellProps} />
        ) : bamSignalInstituteRoute === "weddingNetwork" ? (
          <LazyBamSignalInstituteWeddingNetworkPage {...instituteShellProps} />
        ) : bamSignalInstituteRoute === "lifePartners" ? (
          <LazyBamSignalInstituteLifePartnersPage {...instituteShellProps} />
        ) : bamSignalInstituteRoute === "trustScore" ? (
          <LazyBamSignalInstituteTrustScorePage {...instituteShellProps} />
        ) : bamSignalInstituteRoute === "trustMilestones" ? (
          <LazyBamSignalInstituteTrustMilestonesPage {...instituteShellProps} />
        ) : bamSignalInstituteRoute === "legacyProfessionals" ? (
          <LazyBamSignalInstituteLegacyProfessionalsPage {...instituteShellProps} />
        ) : bamSignalInstituteRoute === "relationshipConnect" ? (
          <LazyBamSignalInstituteRelationshipConnectPage {...instituteShellProps} />
        ) : bamSignalInstituteRoute === "bamSignalSummit" ? (
          <LazyBamSignalInstituteBamSignalSummitPage {...instituteShellProps} />
        ) : bamSignalInstituteRoute === "bamSignalHonors" ? (
          <LazyBamSignalInstituteBamSignalHonorsPage {...instituteShellProps} />
        ) : bamSignalInstituteRoute === "legacyEndowment" ? (
          <LazyBamSignalInstituteLegacyEndowmentPage {...instituteShellProps} />
        ) : bamSignalInstituteRoute === "bamSignalMuseum" ? (
          <LazyBamSignalInstituteBamSignalMuseumPage {...instituteShellProps} />
        ) : bamSignalInstituteRoute === "legacyChair" ? (
          <LazyBamSignalInstituteLegacyChairPage {...instituteShellProps} />
        ) : bamSignalInstituteRoute === "centuryVision" ? (
          <LazyBamSignalInstituteCenturyVisionPage {...instituteShellProps} />
        ) : bamSignalInstituteRoute === "bamSignalHouse" ? (
          <LazyBamSignalInstituteBamSignalHousePage {...instituteShellProps} />
        ) : bamSignalInstituteRoute === "houseExperiences" ? (
          <LazyBamSignalInstituteHouseExperiencesPage {...instituteShellProps} />
        ) : bamSignalInstituteRoute === "greatRoom" ? (
          <LazyBamSignalInstituteGreatRoomPage {...instituteShellProps} />
        ) : bamSignalInstituteRoute === "houseLibrary" ? (
          <LazyBamSignalInstituteHouseLibraryPage {...instituteShellProps} />
        ) : (
          <LazyBamSignalInstituteLandingPage {...instituteShellProps} />
        )}
      </Suspense>
    );
  }

  if (legalPath) {
    return (
      <div className={`app ${theme} platform-root`}>
        <div className="platform-shell platform-shell--legal">
          <TopNav
            theme={theme}
            onToggleTheme={toggleTheme}
            isPremium={isPremium}
            isGuest={isGuest}
            onLogin={() => openAuth("login")}
            onLogoClick={goHome}
            showNotifications={isAuthed}
            notificationCount={notificationUnread}
            onNotificationsClick={() => setNotificationsOpen(true)}
            showFoundingMember={false}
            memberFirstName={
              isAuthed ? memberFirstName(user) : undefined
            }
          />
          <main className="app-main app-main--legal">
            <Suspense fallback={<LazyRouteFallback />}>
              <LazyLegalPage path={legalPath} />
            </Suspense>
          </main>
          <SiteFooter onLogoClick={goHome} />
        </div>

        <NotificationCenter
          open={notificationsOpen}
          onClose={() => {
            setNotificationsOpen(false);
            setNotifVersion((v) => v + 1);
          }}
          onReadChange={() => setNotifVersion((v) => v + 1)}
          onOpenNotification={handleNotificationOpen}
        />

        <PricingModal
          open={pricingOpen}
          onClose={() => setPricingOpen(false)}
          plans={plans}
          onSelectPlan={(plan) => void handleUpgrade(plan)}
          onPurchaseBoost={handlePurchaseBoost}
          loading={paymentLoading}
          memberCity={getMemberCity()}
        />
      </div>
    );
  }

  return (
    <PremiumCheckoutProvider value={premiumCheckoutValue}>
    <div className={`app ${theme} platform-root ${memberAppEntered && !isPublicSurface ? "platform-root--member" : ""}`}>
      <div
        className="platform-shell"
      >
        {!isOnboardingRoute && !showComplianceGate && !activeAuthPath && (
          <TopNav
            theme={theme}
            onToggleTheme={toggleTheme}
            isPremium={isPremium}
            isGuest={!isAuthed}
            onLogin={() => openAuth("login")}
            onLogoClick={goHome}
            showOpenApp={isAuthed && isPublicHome}
            onOpenApp={enterMemberApp}
            openAppLoading={openAppLoading}
            showNotifications={isAuthed && memberAppEntered && !isPublicSurface}
            notificationCount={notificationUnread}
            onNotificationsClick={() => setNotificationsOpen(true)}
            showEarlyAccess={false}
            showMemberNav={isAuthed && memberAppEntered && !isPublicSurface}
            memberTab={tab}
            onMemberNavigate={navigateTab}
            likeCount={incomingSignals}
            messageCount={messageCount}
            showBrandText={showGuestChrome}
            showGreeting={false}
          />
        )}

        {recoveryBanner ? (
          <p
            className="compliance-sync-banner"
            role="status"
            onClick={() => {
              dismissRecoveryBanner();
              clearSafeMode();
              setRecoveryBanner(false);
            }}
          >
            Recovered your session.
          </p>
        ) : null}

        {memberAccessReady ? <BoostActiveBanner user={user} refreshKey={boostTick} /> : null}

        {complianceSyncPending && memberAccessReady ? (
          <p className="compliance-sync-banner" role="status">
            Finishing account setup…
          </p>
        ) : null}

        {paymentLoading && memberAccessReady && (
          <PaymentLoadingOverlay message={paymentOverlayMessage} />
        )}

        {showPaymentRecovery && memberAccessReady && (
          <PaymentRecoveryBanner
            onRetry={() => {
              clearPaymentSession();
              setPaymentFlowTick((v) => v + 1);
              startPremiumCheckout();
            }}
            onDismiss={() => {
              clearPaymentSession();
              setPaymentFlowTick((v) => v + 1);
            }}
          />
        )}

        {paymentSuccess && memberAccessReady && (
          <PaymentSuccessToast
            title={paymentSuccess.title}
            body={paymentSuccess.body}
            onContinue={() => setPaymentSuccess(null)}
          />
        )}

        <main
          className={`app-main ${
            showMarketingHome
              ? "app-main--experience"
              : isAuthed
                ? isOnboardingRoute
                  ? "app-main--onboarding"
                  : showComplianceGate
                    ? "app-main--compliance"
                    : "app-main--member"
                : "app-main--experience"
          }`}
        >
          {memberSurfaceBooting && (
            <LazyRouteFallback
              subtitle={memberHydrating ? "Restoring your account…" : "Restoring your session…"}
            />
          )}
          {isAuthed &&
            memberAppEntered &&
            memberSessionReady &&
            !memberHydrating &&
            isOnboardingRoute &&
            profileComplete === false && (
            <MemberRouteBoundary sessionKey={memberSessionEpoch} name="onboarding">
              <OnboardingPage user={user} onUserChange={setUser} onComplete={finishOnboarding} />
            </MemberRouteBoundary>
          )}
          {isAuthed && memberAccessReady && memberOverlay === "premium" && (
            <Suspense fallback={<LazyRouteFallback subtitle="Loading Signal Pass…" />}>
              <LazyPremiumPage
                isPremium={isPremium}
                plans={plans}
                onBack={() => setMemberOverlay(null)}
                onSelectPlan={(plan) => void handleUpgrade(plan)}
                loading={paymentLoading}
              />
            </Suspense>
          )}
          {isAuthed && memberAccessReady && memberOverlay === "visitors" && (
            <Suspense fallback={<LazyRouteFallback />}>
              <LazyVisitorsPage
                viewers={readJson(STORAGE_KEYS.profileViews, { count: 0, viewers: [] }).viewers}
                viewsToday={getProfileViewsToday()}
                isPremium={isPremium}
                onBack={() => setMemberOverlay(null)}
                onUpgrade={startPremiumCheckout}
                onSendSignal={() => {
                  setMemberOverlay(null);
                  setTab("discover");
                }}
                onCompleteProfile={() => {
                  setMemberOverlay(null);
                  setTab("me");
                }}
              />
            </Suspense>
          )}
          {isAuthed && memberAccessReady && memberOverlay === "safety" && (
            <Suspense fallback={<LazyRouteFallback subtitle="Loading Safety Center…" />}>
              <LazySafetyCenterPage
                onBack={() => setMemberOverlay(null)}
                onOpenProfile={() => {
                  setMemberOverlay(null);
                  setTab("me");
                }}
              />
            </Suspense>
          )}
          {memberAccessReady && !memberOverlay && tab === "home" && currentPathname === "/home" && (
            <MemberRouteBoundary sessionKey={memberSessionEpoch} name="home">
              <HomePage
                user={user}
                userName={user.name}
                isPremium={isPremium}
                phoneVerified={Boolean(user.phoneVerified)}
                onDiscover={() => setTab("discover")}
                onOpenPremium={startPremiumCheckout}
              />
            </MemberRouteBoundary>
          )}
          {memberAccessReady && !memberOverlay && currentPathname === "/fast-connection" && (
            <MemberRouteBoundary sessionKey={memberSessionEpoch} name="fast-connection">
              <Suspense fallback={<LazyRouteFallback subtitle="Loading Fast Connection…" />}>
                <LazyFastConnectionPage
                  user={user}
                  isPremium={isPremium}
                  onHome={() => navigateToPath("/home")}
                  onOpenPremium={startPremiumCheckout}
                />
              </Suspense>
            </MemberRouteBoundary>
          )}
          {showMarketingHome && tab === "home" && !isOnboardingRoute && (
            <PublicRouteBoundary name="landing">
              <LandingPage
                onSignup={() => openAuth("signup")}
                onGuestAction={() => openAuth("signup", "discover")}
                showEarlyAccess={false}
                onLogoClick={goHome}
              />
            </PublicRouteBoundary>
          )}
          {memberAccessReady && tab === "discover" && (
            <MemberRouteBoundary sessionKey={memberSessionEpoch} name="discover">
              <DiscoverPage
                isPremium={isPremium}
                plans={plans}
                onMatch={() => undefined}
                onUpgrade={handleUpgrade}
                onStartPremiumCheckout={startPremiumCheckout}
                paymentLoading={paymentLoading}
                onOpenSafety={() => setMemberOverlay("safety")}
              />
            </MemberRouteBoundary>
          )}
          {tab === "discover" && isGuest && <GuestDiscoverPage onJoin={() => openAuth("signup", "discover")} />}
          {tab === "likes" && isGuest && (
            <GuestGate tab="likes" onJoin={() => openAuth("signup", "likes")} onLogin={() => openAuth("login", "likes")} />
          )}
          {memberAccessReady && tab === "likes" && (
            <MemberRouteBoundary sessionKey={memberSessionEpoch} name="likes">
              <LikesPage
                isPremium={isPremium}
                onUpgrade={startPremiumCheckout}
                paymentLoading={paymentLoading}
                onCompleteProfile={() => setTab("me")}
                onDiscover={() => setTab("discover")}
                onOpenSafety={() => setMemberOverlay("safety")}
                onOpenChats={() => {
                  setTab("chats");
                  navigateToPath(memberPathForTab("chats"), true);
                }}
              />
            </MemberRouteBoundary>
          )}
          {tab === "chats" && isGuest && (
            <GuestGate tab="chats" onJoin={() => openAuth("signup", "chats")} onLogin={() => openAuth("login", "chats")} />
          )}
          {memberAccessReady && tab === "chats" && (
            <MemberRouteBoundary sessionKey={memberSessionEpoch} name="chats">
              <ChatsPage
                isPremium={isPremium}
                plans={plans}
                onUpgrade={handleUpgrade}
                paymentLoading={paymentLoading}
                onDiscover={() => {
                  setTab("discover");
                  navigateToPath(memberPathForTab("discover"), true);
                }}
                onBuildProfile={() => {
                  setTab("me");
                  navigateToPath("/profile", true);
                }}
                phoneVerified={Boolean(user.phoneVerified)}
              />
            </MemberRouteBoundary>
          )}
          {tab === "me" && isGuest && (
            <GuestGate tab="me" onJoin={() => openAuth("signup", "me")} onLogin={() => openAuth("login", "me")} />
          )}
          {memberAccessReady && tab === "me" && currentPathname === "/saved-profiles" && (
            <MemberRouteBoundary sessionKey={memberSessionEpoch} name="saved-profiles">
              <SavedProfilesPage onBack={() => navigateToPath("/profile")} />
            </MemberRouteBoundary>
          )}
          {memberAccessReady && tab === "me" && currentPathname === "/voice-vibe" && (
            <MemberRouteBoundary sessionKey={memberSessionEpoch} name="voice-vibe">
              <VoiceVibePage
                user={user}
                profile={getDatingProfile()}
                isPremium={isPremium}
                onProfileChange={(next) => {
                  writeJson(STORAGE_KEYS.datingProfile, normalizeDatingProfile(next));
                }}
                onBack={() => navigateToPath("/profile")}
              />
            </MemberRouteBoundary>
          )}
          {memberAccessReady && tab === "me" && currentPathname === "/trusted-member" && (
            <MemberRouteBoundary sessionKey={memberSessionEpoch} name="trusted-member">
              <TrustedMemberPage
                user={user}
                profile={getDatingProfile()}
                phoneVerified={Boolean(user.phoneVerified)}
                onProfileChange={(next) => {
                  writeJson(STORAGE_KEYS.datingProfile, normalizeDatingProfile(next));
                }}
                onUserChange={setUser}
                onBack={() => navigateToPath("/profile")}
              />
            </MemberRouteBoundary>
          )}
          {memberAccessReady && tab === "me" && currentPathname !== "/voice-vibe" && currentPathname !== "/trusted-member" && currentPathname !== "/saved-profiles" && (
            <MemberRouteBoundary sessionKey={memberSessionEpoch} name="profile">
              <ProfilePage
                user={user}
                isPremium={isPremium}
                theme={theme}
                onToggleTheme={toggleTheme}
                onUserChange={setUser}
                onLogout={handleLogout}
                onUpgrade={startPremiumCheckout}
                onReturnToDashboard={() => {
                  setTab("home");
                  navigateToPath("/home");
                }}
                onOpenSafetyCenter={() => setMemberOverlay("safety")}
                onPurchaseBoost={(product) => void handlePurchaseBoost(product)}
                boostCheckoutLoading={paymentLoading}
              />
            </MemberRouteBoundary>
          )}
        </main>

        {!isNative && isGuest && !isOnboardingRoute && tab !== "home" && (
          <SiteFooter className="site-footer--compact" onLogoClick={goHome} />
        )}
      </div>

      {showComplianceGate && (
        <ComplianceGateModal user={user} onComplete={() => setComplianceTick((tick) => tick + 1)} />
      )}

      {!isOnboardingRoute && !showComplianceGate && !activeAuthPath && (
        <BottomNav
          active={tab}
          onNavigate={navigateTab}
          isGuest={showGuestChrome}
          onJoin={() => openAuth("signup")}
          likeCount={isAuthed && memberAppEntered ? incomingSignals : 0}
        />
      )}

      <NotificationCenter
        open={notificationsOpen}
        onClose={() => {
          setNotificationsOpen(false);
          setNotifVersion((v) => v + 1);
        }}
        onReadChange={() => setNotifVersion((v) => v + 1)}
        onOpenNotification={handleNotificationOpen}
      />

      <PricingModal
        open={pricingOpen}
        onClose={() => setPricingOpen(false)}
        plans={plans}
        onSelectPlan={(plan) => void handleUpgrade(plan)}
        onPurchaseBoost={handlePurchaseBoost}
        loading={paymentLoading}
        memberCity={getMemberCity()}
      />
    </div>
    </PremiumCheckoutProvider>
  );
}
