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
import { NotificationCenter } from "./components/NotificationCenter";
import type { PremiumPlan } from "./constants/plans";
import type { BoostProduct } from "./constants/boosts";
import { STORAGE_KEYS } from "./constants/limits";
import { OnboardingPage } from "./pages/OnboardingPage";
import type { AuthMeta, AuthMode, Match, NavTab, Theme, UserProfile } from "./types";
import { getSavedTheme, readJson, writeJson } from "./utils/storage";
import { isOnboardingComplete, getDatingProfile, normalizeDatingProfile } from "./utils/profile";
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
import { hydrateMemberData, registerMember } from "./services/memberData";
import { syncMemberProfileRemote } from "./services/cityHome";
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
  navigateToPath,
  normalizePath,
  redirectLegacyConsolePaths,
  redirectLegacyAdmin,
  HARD_AUTH_PATH,
  type AuthPath
} from "./constants/routes";
import { getLegalPath, type LegalPath } from "./constants/footer";
import { resolveHardHubPath } from "./utils/adminSession";
import { profileFromSessionUser, rememberUsernameEmail } from "./utils/authIdentity";
import { clearMemberSessionCaches } from "./utils/authSession";
import { safeUserProfile } from "./utils/safeProfile";
import { boostNeedsMemberCity } from "./constants/boosts";
import { PAYMENT_START_ERROR } from "./config/paystack";
import { boostSuccessCopy } from "./constants/boosts";
import { MONETIZATION_COPY } from "./constants/copy";
import { USER_MESSAGES } from "./constants/userMessages";
import { DEMO_USER } from "./constants/demoAccounts";
import { getMemberCity } from "./utils/memberCity";
import { flowLog } from "./utils/flowLog";
import { repairMemberCaches } from "./utils/repairMemberCaches";
import { memberFirstName } from "./utils/safeProfile";
import { usePlans } from "./context/PlansContext";

export function App() {
  const isNative = Capacitor.getPlatform() !== "web";
  const { plans } = usePlans();
  const [booting, setBooting] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [bootExit, setBootExit] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => getSavedTheme());
  const [tab, setTab] = useState<NavTab>("home");
  const [legalPath, setLegalPath] = useState<LegalPath | null>(() => getLegalPath());
  const [authPath, setAuthPath] = useState<AuthPath | null>(() => getAuthPath());
  const [blogSlug, setBlogSlug] = useState<string | null>(() => getBlogSlug());
  const [momentSlug, setMomentSlug] = useState<string | null>(() => getMomentSlug());
  const [showBlogIndex, setShowBlogIndex] = useState(() => isBlogIndex());
  const [showAdminAuth, setShowAdminAuth] = useState(() => isAdminAuthRoute());
  const [showAdminHub, setShowAdminHub] = useState(() => isAdminHubRoute() && !isAdminAuthRoute());
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [pendingTab, setPendingTab] = useState<NavTab | null>(null);
  const [isAuthed, setIsAuthed] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [isPremium, setIsPremium] = useState(() => isPremiumActive());
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [memberOverlay, setMemberOverlay] = useState<"visitors" | "premium" | "safety" | null>(null);
  const [notifVersion, setNotifVersion] = useState(0);
  const [paymentSuccess, setPaymentSuccess] = useState<{ title: string; body: string } | null>(null);
  const [paymentFlowTick, setPaymentFlowTick] = useState(0);
  const [bootStalled, setBootStalled] = useState(false);
  const paymentVerifyInFlight = useRef(false);
  const [user, setUser] = useState<UserProfile>(() =>
    safeUserProfile(readJson(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" }))
  );
  const isAuthedRef = useRef(isAuthed);
  const userRef = useRef(user);
  const logoutInProgressRef = useRef(false);

  const isGuest = !isAuthed;

  useEffect(() => {
    if (!isNative) return;
    document.documentElement.classList.add("capacitor-native");
  }, [isNative]);

  useEffect(() => {
    void fetchSubscriptionCatalog().then(cacheSubscriptionCatalogPricing);
  }, []);

  useEffect(() => {
    const syncRoute = () => {
      redirectLegacyConsolePaths();
      setLegalPath(getLegalPath());
      setAuthPath(getAuthPath());
      setBlogSlug(getBlogSlug());
      setMomentSlug(getMomentSlug());
      setShowBlogIndex(isBlogIndex());
      setShowAdminAuth(isAdminAuthRoute());
      const hub = isAdminHubRoute() && !isAdminAuthRoute();
      setShowAdminHub(hub);
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
  }, []);

  useEffect(() => {
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

  const applyRestoredSession = useCallback(async (profile: UserProfile) => {
    flowLog("session_restore_start");
    repairMemberCaches();
    const stored = readJson<UserProfile>(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" });
    const merged: UserProfile = {
      ...profile,
      phone: stored.phone || profile.phone,
      phoneVerified: Boolean(stored.phoneVerified ?? profile.phoneVerified)
    };
    setUser(merged);
    setIsAuthed(true);
    if (!isOnboardingComplete()) {
      setShowOnboarding(true);
      flowLog("session_restore_onboarding");
    } else {
      setShowOnboarding(false);
      flowLog("session_restore_home");
    }
    recordStreakActivity();
    checkPremiumTrialExpiry();
    let hydrated = await hydrateMemberData(merged);
    if (!hydrated) {
      flowLog("profile_repair_register");
      await registerMember(merged);
      hydrated = await hydrateMemberData(merged);
    }
    flowLog("profile_hydrate", { ok: hydrated });
    const premium = await refreshPremiumStatus(merged);
    setIsPremium(
      !isOnboardingComplete()
        ? Boolean(premium.isPremium)
        : premium.isPremium || isPremiumTrialActive()
    );
    flowLog("session_restore_done");
  }, []);

  useEffect(() => {
    if (isAuthed && !showOnboarding) recordDailyActive();
  }, [isAuthed, showOnboarding]);

  const applyPaymentSuccess = useCallback(
    (kind: "premium" | "boost" | "quickie") => {
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
    },
    [user]
  );

  const processPaymentReturn = useCallback(async () => {
    if (paymentVerifyInFlight.current) return;

    const params = new URLSearchParams(window.location.search);
    const urlRef = params.get("trxref") || params.get("reference");
    const state = getPaymentFlowState();

    if (!urlRef && (state === "initializing" || state === "checkout_open")) return;
    if (!urlRef && state !== "verifying") return;

    paymentVerifyInFlight.current = true;
    try {
      if (urlRef && window.location.pathname === "/payment/success") {
        navigateToPath("/");
      }

      logPaymentEvent("verification started", { reference: urlRef || localStorage.getItem(STORAGE_KEYS.paymentReference) });
      const result = await completePendingPayment(user);
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
        return;
      }

      if (getPaymentFlowState() !== "failed") {
        setPaymentFlowState("failed");
      }
      logPaymentEvent("verification result", { ok: false, kind: result.kind, error: result.error });
      if (result.error) setAuthMessage(result.error);
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
    if (!isAuthed) return;
    void processPaymentReturn();
  }, [isAuthed, processPaymentReturn, paymentFlowTick]);

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
        void hydrateMemberData(profile);
        const premium = await refreshPremiumStatus(profile);
        setIsPremium(premium.isPremium || isPremiumTrialActive());
        return;
      }
      if (isAuthedRef.current && readJson<UserProfile>(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" }).email) {
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
  }, [isAuthed]);

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

      if (showOnboarding) return;
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
  }, [isNative, showOnboarding, pricingOpen, notificationsOpen, memberOverlay, legalPath, authPath, tab]);

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

  const handleAuthenticated = useCallback(
    async (profile: UserProfile, meta?: AuthMeta) => {
      const stored = readJson<UserProfile>(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" });
      const withPhone = {
        ...profile,
        phone: stored.phone || profile.phone,
        phoneVerified: Boolean(stored.phoneVerified ?? profile.phoneVerified)
      };
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
      const registered = await registerMember(withPhone, ref);
      flowLog(registered ? "profile_register_ok" : "profile_register_failed");
      const hydrated = await hydrateMemberData(withPhone);
      if (!hydrated) {
        flowLog("profile_hydrate_failed");
        const repaired = await registerMember(withPhone, ref);
        if (repaired) {
          await hydrateMemberData(withPhone);
          flowLog("profile_repair_ok");
        }
      } else {
        flowLog("profile_hydrate_ok");
      }
      const premium = await refreshPremiumStatus(withPhone);
      const enteringOnboarding = Boolean(meta?.isNewSignup || !isOnboardingComplete());
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
            onboardingComplete: false
          })
        );
      } else if (meta?.recovered) {
        flowLog("signup_recovered_existing");
      }
      setIsPremium(
        enteringOnboarding
          ? Boolean(premium.isPremium)
          : premium.isPremium || isPremiumTrialActive()
      );
      if (getAuthPath()) {
        navigateToPath("/");
        setAuthPath(null);
      }
      if (meta?.isNewSignup || !isOnboardingComplete()) {
        setShowOnboarding(true);
        setPendingTab(null);
        flowLog("onboarding_start");
        return;
      }
      if (pendingTab) {
        setTab(pendingTab);
        setPendingTab(null);
      } else {
        setTab("home");
      }
      flowLog("home_enter");
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

    const finishBootstrap = () => {
      if (!cancelled && !bootstrapDone) {
        bootstrapDone = true;
        setAuthLoading(false);
      }
    };

    const restoreFromSession = async (session: { user: { email?: string | null; user_metadata?: Record<string, unknown> } } | null) => {
      if (!session?.user || sessionRestored) return;
      sessionRestored = true;
      await applyRestoredSession(profileFromSessionUser(session.user));
    };

    void supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (cancelled) return;
        void restoreFromSession(session).finally(finishBootstrap);
      })
      .catch(() => {
        if (!cancelled) finishBootstrap();
      });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (cancelled) return;

      if (event === "INITIAL_SESSION") {
        await restoreFromSession(session);
        finishBootstrap();
        return;
      }

      if (event === "SIGNED_IN" && session?.user) {
        // AuthPage calls onAuthenticated after password login / signup verify.
        if (getAuthPath()) return;
        await restoreFromSession(session);
        return;
      }

      if ((event === "TOKEN_REFRESHED" || event === "USER_UPDATED") && session?.user) {
        const profile = profileFromSessionUser(session.user);
        setUser(profile);
        setIsAuthed(true);
        void hydrateMemberData(profile);
        const premium = await refreshPremiumStatus(profile);
        setIsPremium(premium.isPremium || isPremiumTrialActive());
        return;
      }

      if (event === "SIGNED_OUT") {
        if (logoutInProgressRef.current) return;

        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            await restoreFromSession(session);
            return;
          }
          const refreshed = await supabase.auth.refreshSession();
          if (refreshed.data.session?.user) {
            await restoreFromSession(refreshed.data.session);
            return;
          }
        }
        const stored = readJson<UserProfile>(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" });
        if (stored.email || stored.phone) {
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
        setShowOnboarding(false);
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
  }, [applyRestoredSession]);

  useEffect(() => {
    if (authLoading || !isAuthed || !authPath) return;
    if (!isOnboardingComplete()) {
      navigateToPath("/");
      setAuthPath(null);
      setShowOnboarding(true);
      return;
    }
    navigateToPath("/");
    setAuthPath(null);
  }, [authLoading, isAuthed, authPath]);

  const reloadApp = useCallback(() => {
    window.location.reload();
  }, []);

  const finishOnboarding = useCallback(() => {
    setShowOnboarding(false);
    localStorage.removeItem(STORAGE_KEYS.onboardingStep);
    setTab("home");
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
    setShowOnboarding(false);
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
  }, []);

  const handleLogout = useCallback(() => {
    logoutInProgressRef.current = true;
    resetLoggedOutState();
    void supabase?.auth.signOut().catch(() => undefined).finally(() => {
      window.setTimeout(() => {
        logoutInProgressRef.current = false;
      }, 3000);
    });
  }, [resetLoggedOutState]);

  const navigateTab = useCallback((next: NavTab) => {
    setMemberOverlay(null);
    setTab(next);
  }, []);

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
      setPaymentFlowTick((v) => v + 1);
      setPaymentLoading(true);
      setAuthMessage("");
      trackEvent("payment_started", { plan: plan.id });
      try {
        const result = await startPlanPayment(plan, user);
        setPaymentFlowTick((v) => v + 1);

        if (!result.ok) {
          if (result.cancelled) {
            setAuthMessage(USER_MESSAGES.paymentNotCompleted);
            return;
          }
          setAuthMessage(result.error || PAYMENT_START_ERROR);
          return;
        }

        setPricingOpen(false);
        if (result.needsVerify) {
          await processPaymentReturn();
        }
      } finally {
        setPaymentLoading(false);
      }
    },
    [isAuthed, openAuth, processPaymentReturn, tab, user]
  );

  const openPricing = useCallback(() => {
    setPricingOpen(true);
  }, []);

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
      syncMemberProfileRemote(user, datingProfile);

      const durationHours = product.id === "profile-boost" ? 48 : 24;

      setPaymentFlowTick((v) => v + 1);
      setPaymentLoading(true);
      setAuthMessage("");
      try {
        const result = await startBoostPayment(
          product.id,
          product.price,
          user,
          memberCity || datingProfile.city || "",
          durationHours
        );
        setPaymentFlowTick((v) => v + 1);
        if (!result.ok) {
          if (result.cancelled) {
            setAuthMessage(USER_MESSAGES.paymentNotCompleted);
            return;
          }
          setAuthMessage(result.error || PAYMENT_START_ERROR);
          return;
        }
        setPricingOpen(false);
        if (result.needsVerify) {
          await processPaymentReturn();
        }
      } finally {
        setPaymentLoading(false);
      }
    },
    [isAuthed, openAuth, processPaymentReturn, tab, user]
  );

  const upgradeById = useCallback(
    (planId: string) => {
      const plan = plans.find((p) => p.id === planId);
      if (plan) void handleUpgrade(plan);
    },
    [handleUpgrade, plans]
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

  if (authLoading) {
    return (
      <div className={`app ${theme}`}>
        <Preloader
          exiting={false}
          subtitle="Restoring your session…"
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
            {post ? (
              <BlogPostPage post={post} onSignup={() => openAuth("signup", "discover")} />
            ) : blogSlug ? (
              <div className="page empty-state">
                <h2>Guide not found</h2>
                <button type="button" className="btn-secondary" onClick={() => navigateToPath("/blog")}>
                  Back to blog
                </button>
              </div>
            ) : (
              <BlogIndexPage onSignup={() => openAuth("signup", "discover")} />
            )}
          </main>
          <SiteFooter onLogoClick={goHome} />
        </div>
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
    <div className={`app ${theme} platform-root ${isAuthed ? "platform-root--member" : ""}`}>
      <div
        className="platform-shell"
      >
        {!showOnboarding && (
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
            showEarlyAccess={false}
            showMemberNav={isAuthed}
            memberTab={tab}
            onMemberNavigate={navigateTab}
            likeCount={incomingSignals}
            messageCount={messageCount}
            showBrandText={!isAuthed}
            showGreeting={false}
          />
        )}

        {paymentLoading && !showOnboarding && <PaymentLoadingOverlay />}

        {showPaymentRecovery && !showOnboarding && (
          <PaymentRecoveryBanner
            onRetry={() => {
              clearPaymentSession();
              setPaymentFlowTick((v) => v + 1);
              setPricingOpen(true);
            }}
            onDismiss={() => {
              clearPaymentSession();
              setPaymentFlowTick((v) => v + 1);
            }}
          />
        )}

        {paymentSuccess && !showOnboarding && (
          <PaymentSuccessToast
            title={paymentSuccess.title}
            body={paymentSuccess.body}
            onContinue={() => setPaymentSuccess(null)}
          />
        )}

        <main
          className={`app-main ${
            isAuthed
              ? showOnboarding
                ? "app-main--onboarding"
                : "app-main--member"
              : "app-main--experience"
          }`}
        >
          {isAuthed && showOnboarding && (
            <OnboardingPage user={user} onUserChange={setUser} onComplete={finishOnboarding} />
          )}
          {isAuthed && !showOnboarding && memberOverlay === "premium" && (
            <PremiumPage
              isPremium={isPremium}
              plans={plans}
              onBack={() => setMemberOverlay(null)}
              onSelectPlan={(plan) => void handleUpgrade(plan)}
              loading={paymentLoading}
            />
          )}
          {isAuthed && !showOnboarding && memberOverlay === "visitors" && (
            <VisitorsPage
              viewers={readJson(STORAGE_KEYS.profileViews, { count: 0, viewers: [] }).viewers}
              viewsToday={getProfileViewsToday()}
              isPremium={isPremium}
              onBack={() => setMemberOverlay(null)}
              onUpgrade={() => {
                setMemberOverlay("premium");
              }}
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
          {isAuthed && !showOnboarding && memberOverlay === "safety" && (
            <SafetyCenterPage
              onBack={() => setMemberOverlay(null)}
              onOpenProfile={() => {
                setMemberOverlay(null);
                setTab("me");
              }}
            />
          )}
          {isAuthed && !showOnboarding && !memberOverlay && tab === "home" && (
            <HomePage
              user={user}
              userName={user.name}
              isPremium={isPremium}
              onDiscover={() => setTab("discover")}
              onOpenPremium={() => setMemberOverlay("premium")}
            />
          )}
          {tab === "home" && isGuest && (
            <LandingPage
              onSignup={() => openAuth("signup")}
              onGuestAction={() => openAuth("signup", "discover")}
              showEarlyAccess={false}
              onLogoClick={goHome}
            />
          )}
          {isAuthed && !showOnboarding && tab === "discover" && (
            <DiscoverPage
              isPremium={isPremium}
              plans={plans}
              onMatch={() => undefined}
              onUpgrade={handleUpgrade}
              paymentLoading={paymentLoading}
              onOpenSafety={() => setMemberOverlay("safety")}
            />
          )}
          {tab === "discover" && isGuest && <GuestDiscoverPage onJoin={() => openAuth("signup", "discover")} />}
          {tab === "likes" && isGuest && (
            <GuestGate tab="likes" onJoin={() => openAuth("signup", "likes")} onLogin={() => openAuth("login", "likes")} />
          )}
          {isAuthed && !showOnboarding && tab === "likes" && (
            <LikesPage
              isPremium={isPremium}
              onUpgrade={openPricing}
              onCompleteProfile={() => setTab("me")}
              onDiscover={() => setTab("discover")}
              onOpenSafety={() => setMemberOverlay("safety")}
            />
          )}
          {tab === "chats" && isGuest && (
            <GuestGate tab="chats" onJoin={() => openAuth("signup", "chats")} onLogin={() => openAuth("login", "chats")} />
          )}
          {isAuthed && !showOnboarding && tab === "chats" && (
            <ChatsPage
              isPremium={isPremium}
              plans={plans}
              onUpgrade={handleUpgrade}
              paymentLoading={paymentLoading}
              onDiscover={() => setTab("discover")}
            />
          )}
          {tab === "me" && isGuest && (
            <GuestGate tab="me" onJoin={() => openAuth("signup", "me")} onLogin={() => openAuth("login", "me")} />
          )}
          {isAuthed && !showOnboarding && tab === "me" && (
            <ProfilePage
              user={user}
              isPremium={isPremium}
              theme={theme}
              onToggleTheme={toggleTheme}
              onUserChange={setUser}
              onLogout={handleLogout}
              onUpgrade={openPricing}
              onReturnToDashboard={() => setTab("home")}
            />
          )}
        </main>

        {!isNative && isGuest && !showOnboarding && tab !== "home" && (
          <SiteFooter className="site-footer--compact" onLogoClick={goHome} />
        )}
      </div>

      {!showOnboarding && (
        <BottomNav
          active={tab}
          onNavigate={navigateTab}
          isGuest={isGuest}
          onJoin={() => openAuth("signup")}
          likeCount={isAuthed ? incomingSignals : 0}
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
  );
}
