import { useCallback, useEffect, useState } from "react";
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
import { AdminHubPage } from "./pages/AdminHubPage";
import { PaymentRecoveryBanner, PaymentSuccessToast } from "./components/PaymentRecoveryBanner";
import { NotificationCenter } from "./components/NotificationCenter";
import type { PremiumPlan } from "./constants/plans";
import type { BoostProduct } from "./constants/boosts";
import { STORAGE_KEYS } from "./constants/limits";
import { OnboardingPage } from "./pages/OnboardingPage";
import type { AuthMeta, AuthMode, Match, NavTab, Theme, UserProfile } from "./types";
import { getSavedTheme, readJson, writeJson } from "./utils/storage";
import { isOnboardingComplete } from "./utils/profile";
import { recordStreakActivity } from "./utils/streaks";
import { isPremiumActive, startBoostPayment, startPlanPayment, verifyBoostPayment, verifyPayment } from "./services/payments";
import { maybeGrantPremiumTrial, checkPremiumTrialExpiry } from "./utils/premiumTrial";
import { markFirstDayStep } from "./utils/firstDayJourney";
import { markJoinedAt } from "./utils/launchSeed";
import { hydrateMemberData, registerMember } from "./services/memberData";
import { supabase } from "./services/supabase";
import { filterBlockedByProfileId } from "./utils/safety";
import { recordDailyActive, trackEvent } from "./utils/analytics";
import { getProfileViewsToday } from "./utils/profileViews";
import { unreadCount } from "./utils/notifications";
import { notifyPremiumActivated, notifyBoostActivated } from "./utils/notifyHelpers";
import { activateBoost } from "./utils/activeBoosts";
import { LegalPage } from "./pages/LegalPage";
import { PremiumPage } from "./pages/PremiumPage";
import { VisitorsPage } from "./pages/VisitorsPage";
import { SafetyCenterPage } from "./pages/SafetyCenterPage";
import { SiteFooter } from "./components/SiteFooter";
import { LoveAuthRoutePage } from "./pages/LoveAuthRoutePage";
import { AdminAuthPage } from "./pages/AdminAuthPage";
import { BlogIndexPage } from "./pages/BlogIndexPage";
import { BlogPostPage } from "./pages/BlogPostPage";
import { getBlogPost } from "./data/blogPosts";
import {
  ADMIN_AUTH_PATH,
  ADMIN_HUB_PATH,
  AUTH_LOGIN_PATH,
  AUTH_SIGNUP_PATH,
  getAuthPath,
  getBlogSlug,
  isAdminAuthRoute,
  isAdminHubRoute,
  isBlogIndex,
  navigateToPath,
  redirectLegacyAdmin,
  type AuthPath
} from "./constants/routes";
import { getLegalPath, type LegalPath } from "./constants/footer";
import { isAdminSessionActive } from "./utils/adminSession";
import { profileFromSessionUser, rememberUsernameEmail } from "./utils/authIdentity";
import { DEMO_USER } from "./constants/demoAccounts";
import { usePlans } from "./context/PlansContext";

export function App() {
  const isNative = Capacitor.getPlatform() !== "web";
  const { plans } = usePlans();
  const [booting, setBooting] = useState(true);
  const [bootExit, setBootExit] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => getSavedTheme());
  const [tab, setTab] = useState<NavTab>("home");
  const [legalPath, setLegalPath] = useState<LegalPath | null>(() => getLegalPath());
  const [authPath, setAuthPath] = useState<AuthPath | null>(() => getAuthPath());
  const [blogSlug, setBlogSlug] = useState<string | null>(() => getBlogSlug());
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
  const [user, setUser] = useState<UserProfile>(() =>
    readJson(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" })
  );

  const isGuest = !isAuthed;

  useEffect(() => {
    const syncRoute = () => {
      redirectLegacyAdmin();
      setLegalPath(getLegalPath());
      setAuthPath(getAuthPath());
      setBlogSlug(getBlogSlug());
      setShowBlogIndex(isBlogIndex());
      setShowAdminAuth(isAdminAuthRoute());
      setShowAdminHub(isAdminHubRoute() && !isAdminAuthRoute());
    };
    window.addEventListener("popstate", syncRoute);
    syncRoute();
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const minMs = isNative ? 2200 : 1500;
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
    writeJson(STORAGE_KEYS.userProfile, user);
  }, [user]);

  useEffect(() => {
    if (import.meta.env.DEV) {
      rememberUsernameEmail(DEMO_USER.username, DEMO_USER.profile.email);
    }

    supabase?.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setUser(profileFromSessionUser(data.session.user));
        setIsAuthed(true);
        if (!isOnboardingComplete()) {
          setShowOnboarding(true);
        }
        recordStreakActivity();
      }
    });
  }, []);

  useEffect(() => {
    if (isAuthed && !showOnboarding) recordDailyActive();
  }, [isAuthed, showOnboarding]);

  useEffect(() => {
    if (!isAuthed) return;

    const params = new URLSearchParams(window.location.search);
    const urlRef = params.get("trxref") || params.get("reference");
    if (urlRef) {
      localStorage.setItem(STORAGE_KEYS.paymentReference, urlRef);
      localStorage.setItem(STORAGE_KEYS.paymentPending, "1");
      if (window.location.pathname === "/payment/success") {
        navigateToPath("/");
      }
    }

    const ref = localStorage.getItem(STORAGE_KEYS.paymentReference);
    if (!ref) return;

    const paymentKind = localStorage.getItem(STORAGE_KEYS.paymentKind) || "premium";

    if (paymentKind === "boost") {
      const datingProfile = readJson(STORAGE_KEYS.datingProfile, { city: "Lagos" });
      const boostId = localStorage.getItem(STORAGE_KEYS.paymentBoostId) || "city-boost";
      verifyBoostPayment(user, boostId, datingProfile.city).then((result) => {
        if (result.ok) {
          activateBoost(boostId as BoostProduct["id"], user, datingProfile);
          localStorage.removeItem(STORAGE_KEYS.paymentPending);
          localStorage.removeItem(STORAGE_KEYS.paymentReference);
          localStorage.removeItem(STORAGE_KEYS.paymentKind);
          localStorage.removeItem(STORAGE_KEYS.paymentBoostId);
          setPaymentSuccess({
            title: "Payment successful",
            body:
              boostId === "city-boost"
                ? "Your City Boost is now active."
                : `${boostId.replace(/-/g, " ")} is now active.`
          });
          notifyBoostActivated(boostId);
          setNotifVersion((v) => v + 1);
          trackEvent("boost_activated", { product: boostId, paid: "true" });
        } else {
          localStorage.setItem(STORAGE_KEYS.paymentPending, "1");
        }
      });
      return;
    }

    if (isPremium) return;

    verifyPayment(user).then((result) => {
      if (result.ok) {
        setIsPremium(true);
        localStorage.removeItem(STORAGE_KEYS.paymentPending);
        localStorage.removeItem(STORAGE_KEYS.paymentReference);
        localStorage.removeItem(STORAGE_KEYS.paymentKind);
        setPaymentSuccess({
          title: "Payment successful",
          body: "Your Signal Pass is now active."
        });
        trackEvent("payment_successful");
        notifyPremiumActivated();
        setNotifVersion((v) => v + 1);
      } else {
        localStorage.setItem(STORAGE_KEYS.paymentPending, "1");
      }
    });
  }, [isAuthed, isPremium, user]);

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
    (profile: UserProfile, meta?: AuthMeta) => {
      const withPhone = {
        ...profile,
        phoneVerified: Boolean(profile.phone || profile.phoneVerified)
      };
      setUser(withPhone);
      setIsAuthed(true);
      setAuthMessage("");
      recordStreakActivity();
      checkPremiumTrialExpiry();
      void registerMember(withPhone).then(() => hydrateMemberData(withPhone));
      if (meta?.isNewSignup) {
        trackEvent("signup_completed");
        markJoinedAt();
        markFirstDayStep("welcome");
        if (maybeGrantPremiumTrial(true)) setIsPremium(true);
        const ref = new URLSearchParams(window.location.search).get("ref");
        if (ref) trackEvent("referral_signup", { code: ref.toUpperCase() });
      }
      if (getAuthPath()) {
        navigateToPath("/");
        setAuthPath(null);
      }
      if (meta?.isNewSignup || !isOnboardingComplete()) {
        setShowOnboarding(true);
        setPendingTab(null);
        return;
      }
      if (pendingTab) {
        setTab(pendingTab);
        setPendingTab(null);
      } else {
        setTab("home");
      }
    },
    [pendingTab]
  );

  useEffect(() => {
    if (!supabase) return;
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" || !session?.user || !getAuthPath()) return;
      handleAuthenticated(profileFromSessionUser(session.user), { isNewSignup: false });
    });
    return () => subscription.unsubscribe();
  }, [handleAuthenticated]);

  const finishOnboarding = useCallback(() => {
    setShowOnboarding(false);
    setTab("discover");
  }, []);

  const handleLogout = useCallback(() => {
    setIsAuthed(false);
    setShowOnboarding(false);
    setIsPremium(false);
    setUser({ name: "", email: "", phone: "" });
    setTab("home");
  }, []);

  const navigateTab = useCallback((next: NavTab) => {
    setMemberOverlay(null);
    setTab(next);
  }, []);

  const handleUpgrade = useCallback(
    async (plan: PremiumPlan) => {
      if (!isAuthed) {
        openAuth("signup", tab === "home" ? "discover" : tab);
        return;
      }
      setPaymentLoading(true);
      trackEvent("payment_started", { plan: plan.id });
      localStorage.setItem(STORAGE_KEYS.paymentPending, "1");
      const result = await startPlanPayment(plan, user);
      setPaymentLoading(false);
      if (!result.ok) {
        setAuthMessage(result.error || "Payment failed.");
        localStorage.setItem(STORAGE_KEYS.paymentPending, "1");
      } else {
        setPricingOpen(false);
      }
    },
    [isAuthed, openAuth, tab, user]
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
      const datingProfile = readJson(STORAGE_KEYS.datingProfile, { city: "Lagos" });

      setPaymentLoading(true);
      localStorage.setItem(STORAGE_KEYS.paymentKind, "boost");
      localStorage.setItem(STORAGE_KEYS.paymentBoostId, product.id);
      const result = await startBoostPayment(product.id, product.price, user, datingProfile.city);
      setPaymentLoading(false);
      if (!result.ok) {
        setAuthMessage(result.error || "Checkout could not start.");
        return;
      }
      setPricingOpen(false);
      setAuthMessage(`Complete payment to activate ${product.name}.`);
    },
    [isAuthed, openAuth, tab, user]
  );

  const upgradeById = useCallback(
    (planId: string) => {
      const plan = plans.find((p) => p.id === planId);
      if (plan) void handleUpgrade(plan);
    },
    [handleUpgrade, plans]
  );

  const openAdmin = () => {
    if (isAdminSessionActive()) {
      navigateToPath(ADMIN_HUB_PATH);
      setShowAdminHub(true);
      setShowAdminAuth(false);
      return;
    }
    navigateToPath(ADMIN_AUTH_PATH);
    setShowAdminAuth(true);
    setShowAdminHub(false);
  };

  const closeAdmin = () => {
    navigateToPath("/");
    setShowAdminHub(false);
    setShowAdminAuth(false);
  };

  const goHome = () => {
    closeAuth();
    setTab("home");
    setShowBlogIndex(false);
    setBlogSlug(null);
    if (getLegalPath() || isBlogIndex() || getBlogSlug()) {
      navigateToPath("/");
      setLegalPath(null);
    }
  };

  const showPaymentRecovery =
    isAuthed &&
    !paymentSuccess &&
    (localStorage.getItem(STORAGE_KEYS.paymentPending) === "1" ||
      Boolean(localStorage.getItem(STORAGE_KEYS.paymentReference)));
  void notifVersion;
  const notificationUnread = unreadCount();
  const incomingSignals = filterBlockedByProfileId(
    readJson<{ profileId: string }[]>(STORAGE_KEYS.likedBy, [])
  ).length;
  const messageCount = filterBlockedByProfileId(readJson<Match[]>(STORAGE_KEYS.matches, [])).length;

  if (booting) {
    return (
      <div className={`app ${theme}`}>
        <Preloader exiting={bootExit} />
      </div>
    );
  }

  if (showAdminAuth) {
    return (
      <div className={`app ${theme}`}>
        <AdminAuthPage
          onAuthed={() => {
            setShowAdminAuth(false);
            setShowAdminHub(true);
          }}
          onBack={() => {
            navigateToPath("/");
            setShowAdminAuth(false);
          }}
        />
      </div>
    );
  }

  if (showAdminHub) {
    if (!isAdminSessionActive()) {
      return (
        <div className={`app ${theme}`}>
          <AdminAuthPage
            onAuthed={() => {
              setShowAdminAuth(false);
              setShowAdminHub(true);
            }}
            onBack={closeAdmin}
          />
        </div>
      );
    }
    return (
      <div className={`app ${theme} platform-root`}>
        <div className="platform-shell platform-shell--admin">
          <TopNav
            theme={theme}
            onToggleTheme={toggleTheme}
            isPremium={isPremium}
            isGuest={false}
            onLogoClick={closeAdmin}
          />
          <main className="app-main app-main--member">
            <AdminHubPage onBack={closeAdmin} />
          </main>
        </div>
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
            onGetStarted={() => openAuth("signup")}
            onLogoClick={goHome}
            showNotifications={isAuthed}
            notificationCount={notificationUnread}
            onNotificationsClick={() => setNotificationsOpen(true)}
            showFoundingMember={false}
            memberFirstName={
              isAuthed ? user.name.split(" ")[0] || user.username || undefined : undefined
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
            onGetStarted={() => openAuth("signup")}
            onLogoClick={goHome}
            showNotifications={isAuthed}
            notificationCount={notificationUnread}
            onNotificationsClick={() => setNotificationsOpen(true)}
            showFoundingMember={false}
            memberFirstName={
              isAuthed ? user.name.split(" ")[0] || user.username || undefined : undefined
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
        />

        <PricingModal
          open={pricingOpen}
          onClose={() => setPricingOpen(false)}
          plans={plans}
          onSelectPlan={(plan) => void handleUpgrade(plan)}
          onPurchaseBoost={handlePurchaseBoost}
          loading={paymentLoading}
        />
      </div>
    );
  }

  return (
    <div className={`app ${theme} platform-root ${isAuthed ? "platform-root--member" : ""}`}>
      <div className="platform-shell">
        <TopNav
          theme={theme}
          onToggleTheme={toggleTheme}
          isPremium={isPremium}
          isGuest={isGuest}
          onGetStarted={() => openAuth("signup")}
          onLogoClick={goHome}
          showNotifications={isAuthed && !showOnboarding}
          notificationCount={notificationUnread}
          onNotificationsClick={() => setNotificationsOpen(true)}
          showEarlyAccess={false}
          showMemberNav={isAuthed && !showOnboarding}
          memberTab={tab}
          onMemberNavigate={navigateTab}
          likeCount={incomingSignals}
          messageCount={messageCount}
          memberFirstName={
            isAuthed && !showOnboarding ? user.name.split(" ")[0] || user.username || "there" : undefined
          }
        />

        {showPaymentRecovery && !showOnboarding && (
          <PaymentRecoveryBanner
            onRetry={() => setPricingOpen(true)}
            onDismiss={() => {
              localStorage.removeItem(STORAGE_KEYS.paymentPending);
              localStorage.removeItem(STORAGE_KEYS.paymentReference);
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

        <main className={`app-main ${isAuthed ? "app-main--member" : "app-main--experience"}`}>
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
              onOpenPricing={openPricing}
              onOpenPremium={() => setMemberOverlay("premium")}
              onOpenProfile={() => setTab("me")}
              onOpenLikes={() => setTab("likes")}
              onOpenVisitors={() => setMemberOverlay("visitors")}
              onOpenSafety={() => setMemberOverlay("safety")}
            />
          )}
          {tab === "home" && isGuest && (
            <LandingPage
              onSignup={() => openAuth("signup")}
              onOpenPricing={openPricing}
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
              onOpenAdmin={openAdmin}
            />
          )}
        </main>

        {isGuest && !showOnboarding && tab !== "home" && (
          <SiteFooter className="site-footer--compact" onLogoClick={goHome} />
        )}

        {!showOnboarding && (
          <BottomNav
            active={tab}
            onNavigate={navigateTab}
            isGuest={isGuest}
            onJoin={() => openAuth("signup")}
            likeCount={isAuthed ? incomingSignals : 0}
          />
        )}
      </div>

      <NotificationCenter
        open={notificationsOpen}
        onClose={() => {
          setNotificationsOpen(false);
          setNotifVersion((v) => v + 1);
        }}
      />

      <PricingModal
        open={pricingOpen}
        onClose={() => setPricingOpen(false)}
        plans={plans}
        onSelectPlan={(plan) => void handleUpgrade(plan)}
        onPurchaseBoost={handlePurchaseBoost}
        loading={paymentLoading}
      />
    </div>
  );
}
