import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { AdminShell } from "./components/admin/AdminShell";
import { AdminToastProvider } from "./components/admin/AdminToast";
import { AdminConsentProvider } from "./components/admin/AdminConsentProvider";
import { AdminHubPage } from "./pages/AdminHubPage";
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
  resolveComplianceUserKey,
  shouldBlockForCompliance
} from "./utils/compliance";
import {
  restoreComplianceFromMarker,
  retryPendingComplianceSync,
  syncComplianceDoneMarkerFromProfile
} from "./services/compliance";
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
import { goToApp } from "./services/goToApp";
import { supabase } from "./services/supabase";
import { filterBlockedByProfileId } from "./utils/safety";
import { recordDailyActive, trackEvent } from "./utils/analytics";
import { getProfileViewsToday } from "./utils/profileViews";
import { unreadCount, notificationDestination, type AppNotification } from "./utils/notifications";
import { activateBoost } from "./utils/activeBoosts";
import { activateQuickiePass, cacheSubscriptionCatalogPricing } from "./utils/quickie";
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
import { LegalPage } from "./pages/LegalPage";
import { PremiumPage } from "./pages/PremiumPage";
import { VisitorsPage } from "./pages/VisitorsPage";
import { SafetyCenterPage } from "./pages/SafetyCenterPage";
import { SiteFooter } from "./components/SiteFooter";
import { LoveAuthRoutePage } from "./pages/LoveAuthRoutePage";
import { StoreScreenshotsPage } from "./pages/StoreScreenshotsPage";
import { AdminAuthPage } from "./pages/AdminAuthPage";
import { BlogIndexPage } from "./pages/BlogIndexPage";
import { BlogPostPage } from "./pages/BlogPostPage";
import { SeoLayout } from "./pages/seo/SeoLayout";
import { SeoRouter } from "./pages/seo/SeoRouter";
import { NigeriaLocationRouter } from "./pages/seo/NigeriaLocationRouter";
import { PublicNotFoundPage } from "./pages/seo/PublicNotFoundPage";
import { MomentPage } from "./pages/MomentPage";
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
import { clearOnboardingDrafts, logRouteDecision, shouldRouteToOnboarding } from "./utils/onboardingStatus";
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
  resolvePaymentReturnPath
} from "./utils/paymentReturn";

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
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentPhase, setPaymentPhase] = useState<CheckoutPhase>("idle");
  const [pricingOpen, setPricingOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [memberOverlay, setMemberOverlay] = useState<"visitors" | "premium" | "safety" | null>(null);
  const [notifVersion, setNotifVersion] = useState(0);
  const [paymentSuccess, setPaymentSuccess] = useState<{ title: string; body: string } | null>(null);
  const [paymentReturnPhase, setPaymentReturnPhase] = useState<"idle" | "verifying" | "success" | "failed">("idle");
  const [openAppLoading, setOpenAppLoading] = useState(false);
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

  const isGuest = !isAuthed;
  const isPublicHome =
    !isNative && normalizePath(window.location.pathname) === "/" && !paystackCallbackActive;
  const isOnboardingRoute = isOnboardingPath(memberPathname);
  const showMarketingHome =
    isPublicHome && (!isAuthed || !memberAppEntered) && !isOnboardingRoute && !paystackCallbackActive;
  const showGuestChrome = isGuest || showMarketingHome;
  void complianceTick;
  const complianceUserKey = resolveComplianceUserKey(user);
  const showComplianceGate =
    isAuthed &&
    memberAppEntered &&
    !memberHydrating &&
    !isOnboardingRoute &&
    profileComplete === true &&
    shouldBlockForCompliance(getDatingProfile().compliance, complianceUserKey);
  const complianceSyncPending = hasComplianceSyncPending();
  const memberAccessReady =
    isAuthed && memberAppEntered && profileComplete === true && !showComplianceGate;

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
    const retry = () => {
      void retryPendingComplianceSync(user).then((ok) => {
        if (cancelled || !ok) return;
        setComplianceTick((tick) => tick + 1);
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

  useEffect(() => {
    if (!isMemberAppPath(memberPathname)) return;
    const guard = evaluateMemberRouteGuard({
      authLoading,
      memberHydrating,
      isAuthed,
      profileComplete,
      pathname: memberPathname
    });
    if (
      (guard.phase === "redirect" || guard.phase === "unauthenticated") &&
      guard.redirectTo &&
      normalizePath(memberPathname) !== normalizePath(guard.redirectTo)
    ) {
      navigateToPath(guard.redirectTo, true);
    }
  }, [authLoading, memberHydrating, isAuthed, profileComplete, memberPathname]);

  useEffect(() => {
    if (!isNative && isPublicWebRoute()) {
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
    writeJson(STORAGE_KEYS.userProfile, safeUserProfile(user));
  }, [user]);

  const applyRestoredSession = useCallback(async (profile: UserProfile, options?: { blocking?: boolean }) => {
    const blocking = options?.blocking ?? true;
    flowLog("session_restore_start", { blocking });
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
    const session = await goToApp({ forceOnboarding: false });
    if (!session.ok) {
      if (blocking) setMemberHydrating(false);
      return;
    }
    setUser(session.user);
    restoreComplianceFromMarker(session.user);
    syncComplianceDoneMarkerFromProfile(session.user, getDatingProfile().compliance);
    void retryPendingComplianceSync(session.user);
    flowLog("profile_hydrate", { ok: true, route: session.route, reason: session.status?.reason });
    const datingProfile = getDatingProfile();
    const needsOnboarding = session.route === "onboarding";
    setProfileComplete(!needsOnboarding);
    if (blocking || memberAppEntered || !isPublicWebRoute()) {
      if (isMemberAppPath() || requiresMemberRestoreBlocking(window.location.pathname, isNative)) {
        navigateToPath(needsOnboarding ? "/onboarding" : "/home", true);
      }
    }
    logRouteDecision(session.user, datingProfile, needsOnboarding ? "onboarding" : "home", {
      source: "session_restore",
      hydrated: session.hydrated,
      repaired: session.status?.repaired,
      reason: session.status?.reason ?? null,
      blocking
    });
    if (!needsOnboarding) {
      clearOnboardingDrafts();
      flowLog("session_restore_home");
    } else {
      flowLog("session_restore_onboarding");
    }
    const premium = await refreshPremiumStatus(session.user);
    setIsPremium(
      needsOnboarding
        ? Boolean(premium.isPremium)
        : premium.isPremium || isPremiumTrialActive()
    );
    flowLog("session_restore_done");
    if (blocking) {
      setMemberHydrating(false);
    }
  }, [memberAppEntered]);

  useEffect(() => {
    if (memberAccessReady) recordDailyActive();
  }, [isAuthed, memberAccessReady]);

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
    (kind: "premium" | "boost" | "quickie") => {
      const returnPath = getPaymentReturnPath();
      const meta = getPaymentReturnMeta();
      const boostId = localStorage.getItem(STORAGE_KEYS.paymentBoostId) || "city-boost";
      clearPaymentSession();
      setPaymentFlowState("success");
      setPaymentFlowTick((v) => v + 1);

      if (kind === "boost") {
        const datingProfile = normalizeDatingProfile(readJson(STORAGE_KEYS.datingProfile, {}));
        activateBoost(boostId as BoostProduct["id"], user, datingProfile);
        const boostCopy = boostSuccessCopy(boostId as BoostProduct["id"], datingProfile.city);
        setPaymentSuccess(boostCopy);
        notifyBoostActivated(boostId);
        trackEvent("boost_activated", { product: boostId, paid: "true" });
      } else if (kind === "quickie") {
        activateQuickiePass();
        setPaymentSuccess({
          title: "Payment successful",
          body: "Your Fast Connection Pass is active."
        });
        trackEvent("quickie_unlock");
      } else {
        void refreshPremiumStatus(user).then((premium) => {
          setIsPremium(premium.isPremium || isPremiumTrialActive());
        });
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
    [finishPaymentReturnRedirect, user]
  );

  const processPaymentReturn = useCallback(async () => {
    if (paymentVerifyInFlight.current) return;

    const params = new URLSearchParams(window.location.search);
    const urlRef = params.get("trxref") || params.get("reference");
    const state = getPaymentFlowState();
    const callbackActive = isPaymentReturnPath() || Boolean(urlRef?.trim());

    if (!urlRef && (state === "initializing" || state === "checkout_open")) return;
    if (!urlRef && state !== "verifying") return;

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
        applyPaymentSuccess(result.kind);
        return;
      }

      if (result.pending) {
        logPaymentEvent("verification result", { ok: false, pending: true, kind: result.kind });
        return;
      }

      if (result.cancelled) {
        setPaymentFlowState("cancelled");
        setAuthMessage(USER_MESSAGES.paymentNotCompleted);
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
      if (result.error) setAuthMessage(result.error);
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
          void refreshPremiumStatus(profile).then((premium) => {
            setIsPremium(premium.isPremium || isPremiumTrialActive());
          });
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
        const premium = await refreshPremiumStatus(profile);
        setIsPremium(premium.isPremium || isPremiumTrialActive());
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
  }, [isAuthed, isNative, memberAppEntered]);

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

  const enterMemberApp = useCallback(async () => {
    if (openAppLoading) return;
    setOpenAppLoading(true);
    setMemberHydrating(true);
    try {
      const result = await goToApp();
      if (!result.ok) {
        openAuth("login");
        return;
      }

      setUser(result.user);
      setIsAuthed(true);
      setMemberAppEntered(true);
      setAuthMessage("");

      if (result.route === "home") {
        clearOnboardingDrafts();
        setProfileComplete(true);
        setTab("home");
        navigateToPath("/home");
        flowLog("home_enter", { source: "open_app" });
        return;
      }

      setProfileComplete(false);
      setTab("home");
      navigateToPath("/onboarding");
      flowLog("onboarding_start", { source: "open_app" });
    } finally {
      setMemberHydrating(false);
      setOpenAppLoading(false);
    }
  }, [openAppLoading, openAuth]);

  useEffect(() => {
    if (!paystackCallbackActive || authLoading) return;

    let cancelled = false;
    const bootAndVerify = async () => {
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
  }, [paystackCallbackActive, authLoading, applyRestoredSession, openAuth, processPaymentReturn]);

  const handleAuthenticated = useCallback(
    async (profile: UserProfile, meta?: AuthMeta) => {
      setMemberAppEntered(true);
      setMemberHydrating(true);
      const stored = readJson<UserProfile>(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" });
      const withPhone = resolveMemberIdentity({
        ...profile,
        phone: stored.phone || profile.phone,
        phoneVerified: Boolean(stored.phoneVerified ?? profile.phoneVerified)
      });
      setUser(withPhone);
      setIsAuthed(true);
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
      const appResult = await goToApp({ forceOnboarding, referralCode: ref });
      if (!appResult.ok) {
        setMemberHydrating(false);
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
      if (needsOnboarding) {
        setPendingTab(null);
        flowLog("onboarding_start");
        setMemberHydrating(false);
        void refreshPremiumStatus(appResult.user).then((premium) => {
          setIsPremium(Boolean(premium.isPremium));
        });
        return;
      }
      void refreshPremiumStatus(appResult.user).then((premium) => {
        setIsPremium(premium.isPremium || isPremiumTrialActive());
      });
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
    },
    [pendingTab]
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
      session: { user: { email?: string | null; user_metadata?: Record<string, unknown> } } | null,
      options?: { blocking?: boolean }
    ) => {
      if (!session?.user || sessionRestored) return;
      sessionRestored = true;
      const blocking = options?.blocking ?? shouldBlockBoot;
      await applyRestoredSession(profileFromSessionUser(session.user), { blocking });
    };

    void supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (cancelled) return;
        if (!shouldBlockBoot) {
          finishBootstrap();
          if (session?.user) {
            void restoreFromSession(session, { blocking: false });
          }
          return;
        }
        void restoreFromSession(session, { blocking: true }).finally(finishBootstrap);
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
          finishBootstrap();
          if (session?.user) {
            await restoreFromSession(session, { blocking: false });
          }
          return;
        }
        await restoreFromSession(session, { blocking: true });
        finishBootstrap();
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
        void goToApp().then((sessionResult) => {
          if (!sessionResult.ok) return;
          if (onMemberSurface) {
            setProfileComplete(sessionResult.route === "home");
            if (sessionResult.route === "onboarding" && !isOnboardingPath()) {
              navigateToPath("/onboarding", true);
            } else if (sessionResult.route === "home" && isOnboardingPath()) {
              navigateToPath("/home", true);
            }
          }
          if (sessionResult.route === "home") clearOnboardingDrafts();
        });
        const premium = await refreshPremiumStatus(profile);
        setIsPremium(premium.isPremium || isPremiumTrialActive());
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
            setIsPremium(false);
            setUser({ name: "", email: "", phone: "" });
            setTab("home");
            return;
          }
          setIsAuthed(true);
          setUser((prev) => ({
            ...stored,
            phone: prev.phone || stored.phone,
            phoneVerified: Boolean(prev.phoneVerified ?? stored.phoneVerified)
          }));
          return;
        }
        clearMemberSessionCaches();
        setIsAuthed(false);
        setProfileComplete(false);
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
  }, [applyRestoredSession, isNative]);

  useEffect(() => {
    if (authLoading || memberHydrating || !isAuthed || !authPath) return;
    const profile = getDatingProfile();
    const needsOnboarding = shouldRouteToOnboarding(user, profile);
    logRouteDecision(user, profile, needsOnboarding ? "onboarding" : "home", { source: "auth_path_guard" });
    navigateToPath(needsOnboarding ? "/onboarding" : "/");
    setAuthPath(null);
    if (needsOnboarding) {
      setProfileComplete(false);
    }
  }, [authLoading, memberHydrating, isAuthed, authPath, user]);

  const reloadApp = useCallback(() => {
    window.location.reload();
  }, []);

  const finishOnboarding = useCallback(() => {
    setMemberAppEntered(true);
    setProfileComplete(true);
    clearOnboardingDrafts();
    setTab("home");
    navigateToPath("/home", true);
    void refreshPremiumStatus(user).then((premium) => {
      const trialActive = isPremiumTrialActive();
      setIsPremium(premium.isPremium || trialActive);
      if (trialActive && !premium.isPremium) {
        notifyPremiumActivated();
      }
    });
  }, [user]);

  const resetLoggedOutState = useCallback(() => {
    clearMemberSessionCaches();
    setIsAuthed(false);
    setMemberAppEntered(isNative);
    setProfileComplete(false);
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
  }, [isNative]);

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
      const durationHours = product.id === "profile-boost" ? 48 : 24;

      setPaymentFlowTick((v) => v + 1);
      setPaymentLoading(true);
      setPaymentPhase("preparing");
      setAuthMessage("");
      try {
        const result = await startBoostPayment(
          product.id,
          product.price,
          user,
          memberCity || datingProfile.city || "",
          durationHours,
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
    return <StoreScreenshotsPage />;
  }

  if (paystackCallbackActive) {
    return (
      <div className={`app ${theme}`}>
        <PaymentReturnScreen phase={paymentReturnPhase === "idle" ? "verifying" : paymentReturnPhase} />
      </div>
    );
  }

  if (showAdminAuth || showAdminHub) {
    if (showAdminAuth) {
      return (
        <AdminToastProvider>
          <div className="admin-console-root">
            <AdminAuthPage
              onAuthed={() => {
                setShowAdminAuth(false);
                setShowAdminHub(true);
              }}
            />
          </div>
        </AdminToastProvider>
      );
    }

    return (
      <AdminToastProvider>
        <AdminConsentProvider>
          <AdminShell authorized={null} onUnauthorized={openHardLogin}>
            <AdminHubPage onLogout={openHardLogin} />
          </AdminShell>
        </AdminConsentProvider>
      </AdminToastProvider>
    );
  }

  const memberRouteGuard = isMemberAppPath(memberPathname)
    ? evaluateMemberRouteGuard({
        authLoading,
        memberHydrating,
        isAuthed,
        profileComplete,
        pathname: memberPathname
      })
    : null;

  const shouldBlockForAuthRestore =
    memberRouteGuard?.phase === "loading" ||
    (requiresMemberRestoreBlocking(window.location.pathname, isNative) &&
      (authLoading || memberHydrating));

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

  if (booting) {
    return (
      <div className={`app ${theme}`}>
        <Preloader exiting={bootExit} />
      </div>
    );
  }

  if (authPath) {
    return (
      <div className={`app ${theme}`}>
        <LoveAuthRoutePage
          path={authPath}
          onAuthenticated={handleAuthenticated}
          message={authMessage}
          onMessage={setAuthMessage}
        />
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
            <MomentPage momentId={momentSlug as MomentPageId} onSignup={() => openAuth("signup", "discover")} />
          </main>
        </div>
      </div>
    );
  }

  if (showBlogIndex || blogSlug) {
    const post = blogSlug ? getBlogPost(blogSlug) : null;
    return (
      <div className={`app ${theme} platform-root`}>
        <SeoLayout
          theme={theme}
          onToggleTheme={toggleTheme}
          onLogoClick={goHome}
          onLogin={() => openAuth("login")}
          onSignup={() => openAuth("signup", "discover")}
        >
          {post ? (
            <BlogPostPage post={post} onSignup={() => openAuth("signup", "discover")} />
          ) : blogSlug ? (
            <div className="seo-not-found">
              <h1>Guide not found</h1>
              <p>This article is not available.</p>
              <button type="button" className="seo-header__join" onClick={() => navigateToPath("/blog")}>
                Back to blog
              </button>
            </div>
          ) : (
            <BlogIndexPage onSignup={() => openAuth("signup", "discover")} />
          )}
        </SeoLayout>
      </div>
    );
  }

  if (shouldShowPublicNotFound(window.location.pathname, isNative) && !authPath) {
    return (
      <div className={`app ${theme} platform-root`}>
        <SeoLayout
          theme={theme}
          onToggleTheme={toggleTheme}
          onLogoClick={goHome}
          onLogin={() => openAuth("login")}
          onSignup={() => openAuth("signup", "discover")}
        >
          <PublicNotFoundPage />
        </SeoLayout>
      </div>
    );
  }

  if (nigeriaRoute) {
    return (
      <div className={`app ${theme} platform-root`}>
        <SeoLayout
          theme={theme}
          onToggleTheme={toggleTheme}
          onLogoClick={goHome}
          onLogin={() => openAuth("login")}
          onSignup={() => openAuth("signup", "discover")}
        >
          <NigeriaLocationRouter route={nigeriaRoute} />
        </SeoLayout>
      </div>
    );
  }

  if (seoRoute) {
    return (
      <div className={`app ${theme} platform-root`}>
        <SeoLayout
          theme={theme}
          onToggleTheme={toggleTheme}
          onLogoClick={goHome}
          onLogin={() => openAuth("login")}
          onSignup={() => openAuth("signup", "discover")}
        >
          <SeoRouter route={seoRoute} />
        </SeoLayout>
      </div>
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
            <LegalPage path={legalPath} />
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
    <div className={`app ${theme} platform-root ${memberAppEntered ? "platform-root--member" : ""}`}>
      <div
        className="platform-shell"
      >
        {!isOnboardingRoute && !showComplianceGate && (
          <TopNav
            theme={theme}
            onToggleTheme={toggleTheme}
            isPremium={isPremium}
            isGuest={!isAuthed}
            onLogin={() => openAuth("login")}
            onLogoClick={goHome}
            showOpenApp={isAuthed && !memberAppEntered && isPublicHome}
            onOpenApp={enterMemberApp}
            openAppLoading={openAppLoading}
            showNotifications={isAuthed && memberAppEntered}
            notificationCount={notificationUnread}
            onNotificationsClick={() => setNotificationsOpen(true)}
            showEarlyAccess={false}
            showMemberNav={isAuthed && memberAppEntered}
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
          {isAuthed && memberAppEntered && isOnboardingRoute && profileComplete === false && (
            <MemberRouteBoundary name="onboarding">
              <OnboardingPage user={user} onUserChange={setUser} onComplete={finishOnboarding} />
            </MemberRouteBoundary>
          )}
          {isAuthed && memberAccessReady && memberOverlay === "premium" && (
            <PremiumPage
              isPremium={isPremium}
              plans={plans}
              onBack={() => setMemberOverlay(null)}
              onSelectPlan={(plan) => void handleUpgrade(plan)}
              loading={paymentLoading}
            />
          )}
          {isAuthed && memberAccessReady && memberOverlay === "visitors" && (
            <VisitorsPage
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
          )}
          {isAuthed && memberAccessReady && memberOverlay === "safety" && (
            <SafetyCenterPage
              onBack={() => setMemberOverlay(null)}
              onOpenProfile={() => {
                setMemberOverlay(null);
                setTab("me");
              }}
            />
          )}
          {memberAccessReady && !memberOverlay && tab === "home" && memberPathname === "/home" && (
            <MemberRouteBoundary name="home">
              <HomePage
                user={user}
                userName={user.name}
                isPremium={isPremium}
                onDiscover={() => setTab("discover")}
                onOpenPremium={startPremiumCheckout}
              />
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
            <MemberRouteBoundary name="discover">
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
            <MemberRouteBoundary name="likes">
              <LikesPage
                isPremium={isPremium}
                onUpgrade={startPremiumCheckout}
                paymentLoading={paymentLoading}
                onCompleteProfile={() => setTab("me")}
                onDiscover={() => setTab("discover")}
                onOpenSafety={() => setMemberOverlay("safety")}
              />
            </MemberRouteBoundary>
          )}
          {tab === "chats" && isGuest && (
            <GuestGate tab="chats" onJoin={() => openAuth("signup", "chats")} onLogin={() => openAuth("login", "chats")} />
          )}
          {memberAccessReady && tab === "chats" && (
            <MemberRouteBoundary name="chats">
              <ChatsPage
                isPremium={isPremium}
                plans={plans}
                onUpgrade={handleUpgrade}
                paymentLoading={paymentLoading}
                onDiscover={() => setTab("discover")}
              />
            </MemberRouteBoundary>
          )}
          {tab === "me" && isGuest && (
            <GuestGate tab="me" onJoin={() => openAuth("signup", "me")} onLogin={() => openAuth("login", "me")} />
          )}
          {memberAccessReady && tab === "me" && (
            <MemberRouteBoundary name="profile">
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

      {!isOnboardingRoute && !showComplianceGate && (
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
