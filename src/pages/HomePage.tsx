import { useCallback, useEffect, useMemo, useState } from "react";
import { useMemberProfileListener } from "../hooks/useMemberProfileListener";
import { greetingForHour } from "../constants/copy";
import { firstNameFromDisplayName } from "../constants/homeFilters";
import { DEFAULT_HOME_FEED_ADS } from "../constants/homeFeedAds";
import { STORAGE_KEYS } from "../constants/limits";
import {
  HomeAdvancedFiltersSheet,
  emptyHomeAdvancedFilters
} from "../components/home/HomeAdvancedFiltersSheet";
import { HomeFeedFilters } from "../components/home/HomeFeedFilters";
import { HomeSignalLimitBar } from "../components/home/HomeSignalLimitBar";
import { SignalLimitModal } from "../components/premium/SignalLimitModal";
import { HomeQuickFilterSheet } from "../components/home/HomeQuickFilterSheet";
import { HomeSignalsFeed } from "../components/home/HomeSignalsFeed";
import { fetchHomeFeedAds } from "../services/homeFeedAds";
import type { UserProfile } from "../types";
import { clampHomeDistanceForCity } from "../utils/cityMetroRadius";
import { resolveHomeFilterDefaults } from "../utils/homeFilterDefaults";
import { sanitizeStateCityPair } from "../utils/searchLocationPrefs";
import {
  advancedFromMatchPreferences,
  homeHasCustomFilters
} from "../utils/homeFilters";
import { normalizePath } from "../constants/routes";
import { useAndroidBack } from "../hooks/useAndroidBack";
import { FastConnectionActivationSheet } from "../components/profile/FastConnectionActivationSheet";
import { FastConnectionExpiryBanner } from "../components/profile/FastConnectionExpiryBanner";
import { useFastConnectionActivationPrompt } from "../hooks/useFastConnectionActivationPrompt";
import { useFastConnectionExpiryReminder } from "../hooks/useFastConnectionExpiryReminder";
import { navigateToPath } from "../constants/routes";
import { debugRender } from "../utils/debugRecursion";
import { ProfileImprovementNudge } from "../components/nudges/ProfileImprovementNudge";
import { useMemberToast } from "../hooks/useMemberToast";

type HomePageProps = {
  user: UserProfile;
  userName: string;
  isPremium: boolean;
  phoneVerified?: boolean;
  onDiscover: () => void;
  onOpenPremium: () => void;
};

export function HomePage({ user, userName, isPremium, phoneVerified = false, onDiscover, onOpenPremium }: HomePageProps) {
  debugRender("HomePage", { tab: "home", isPremium, phoneVerified });
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    if (normalizePath(window.location.pathname) !== "/home") {
      console.warn("[route-bug] HomePage mounted outside /home", window.location.pathname);
    }
    if (document.querySelector(".app-main--onboarding")) {
      console.warn("[route-bug] Onboarding attempted inside /home");
    }
  }, []);

  const firstName = firstNameFromDisplayName(userName || user.name);
  const { profile: viewer, prefs } = useMemberProfileListener();
  const filterDefaults = useMemo(
    () => resolveHomeFilterDefaults(viewer, prefs),
    [
      viewer.city,
      viewer.state,
      viewer.age,
      prefs.ageMin,
      prefs.ageMax,
      prefs.distanceMax,
      prefs.states,
      prefs.cities
    ]
  );

  const searchCities = filterDefaults.searchCities;

  const [adSettings, setAdSettings] = useState(DEFAULT_HOME_FEED_ADS);
  const [nameQuery, setNameQuery] = useState("");
  const [ageMin, setAgeMin] = useState(filterDefaults.ageMin);
  const [ageMax, setAgeMax] = useState(filterDefaults.ageMax);
  const [state, setState] = useState(filterDefaults.state);
  const [city, setCity] = useState(filterDefaults.city);
  const [distanceKm, setDistanceKm] = useState<number>(filterDefaults.distanceKm);
  const [advanced, setAdvanced] = useState(() => advancedFromMatchPreferences(prefs));
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [quickFiltersOpen, setQuickFiltersOpen] = useState(false);
  const [pendingProfileId, setPendingProfileId] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEYS.pendingSignalProfileId)
  );
  const [signalRefresh, setSignalRefresh] = useState(0);
  const [signalLimitOpen, setSignalLimitOpen] = useState(false);
  const { showToast, ToastHost } = useMemberToast();

  const {
    open: fastConnectionActivationOpen,
    loading: fastConnectionActivationLoading,
    snooze: snoozeFastConnectionActivation,
    activate: activateFastConnection
  } = useFastConnectionActivationPrompt({
    user,
    enabled: true,
    onPaymentError: (message) => showToast(message, { tone: "error", duration: 4000 })
  });

  const {
    bannerMessage: fastConnectionExpiryBanner,
    dismissBanner: dismissFastConnectionExpiryBanner,
    renew: renewFastConnectionFromBanner
  } = useFastConnectionExpiryReminder({
    user,
    enabled: true,
    onRenewNavigate: () => navigateToPath("/fast-connection")
  });

  useEffect(() => {
    setState(filterDefaults.state);
    setCity(filterDefaults.city);
  }, [JSON.stringify(prefs.states), JSON.stringify(prefs.cities), filterDefaults.state, filterDefaults.city]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchHomeFeedAds().then(setAdSettings);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [user]);

  const hasCustomFilters = useMemo(
    () =>
      homeHasCustomFilters({
        ageMin,
        ageMax,
        city,
        state,
        distanceKm,
        advanced,
        defaultAgeMin: filterDefaults.ageMin,
        defaultAgeMax: filterDefaults.ageMax,
        defaultCity: filterDefaults.city,
        defaultState: filterDefaults.state,
        defaultDistanceKm: filterDefaults.distanceKm
      }),
    [
      ageMin,
      ageMax,
      city,
      state,
      distanceKm,
      advanced,
      filterDefaults.ageMin,
      filterDefaults.ageMax,
      filterDefaults.city,
      filterDefaults.state,
      filterDefaults.distanceKm
    ]
  );

  const handleLocationChange = useCallback((nextState: string, nextCity: string) => {
    const aligned = sanitizeStateCityPair(nextState, nextCity);
    setState(aligned.state);
    setCity(aligned.city);
    setDistanceKm((current) => clampHomeDistanceForCity(aligned.city, aligned.state, current));
  }, []);

  const resetFilters = () => {
    setAgeMin(filterDefaults.ageMin);
    setAgeMax(filterDefaults.ageMax);
    setState(filterDefaults.state);
    setCity(filterDefaults.city);
    setDistanceKm(filterDefaults.distanceKm);
    setAdvanced(emptyHomeAdvancedFilters());
    setNameQuery("");
    setQuickFiltersOpen(false);
  };

  const handleSignalSent = () => {
    localStorage.removeItem(STORAGE_KEYS.pendingSignalProfileId);
    setPendingProfileId(null);
    setSignalRefresh((v) => v + 1);
  };

  useAndroidBack(() => {
    if (advancedOpen) {
      setAdvancedOpen(false);
      return true;
    }
    if (quickFiltersOpen) {
      setQuickFiltersOpen(false);
      return true;
    }
    return false;
  });

  return (
    <div className="page home-page home-page--compact member-content-pad">
      <header className="home-top home-top--compact home-top--row">
        <h1 className="home-top__greeting">
          {greetingForHour()}, {firstName} 👋
        </h1>
        <HomeSignalLimitBar
          isPremium={isPremium}
          onAtLimit={() => setSignalLimitOpen(true)}
          refreshKey={signalRefresh}
        />
      </header>

      <ProfileImprovementNudge
        profile={viewer}
        phoneVerified={phoneVerified}
        isPremium={isPremium}
      />

      <section className="home-discovery home-discovery--compact" aria-label="Filters">
        <HomeFeedFilters
          nameQuery={nameQuery}
          onNameQueryChange={setNameQuery}
          ageMin={ageMin}
          ageMax={ageMax}
          city={city}
          state={state}
          distanceKm={distanceKm}
          hasCustomFilters={hasCustomFilters}
          onOpenQuickFilters={() => setQuickFiltersOpen(true)}
          onOpenAdvanced={() => setAdvancedOpen(true)}
          onReset={resetFilters}
        />
      </section>

      <HomeSignalsFeed
        user={user}
        viewer={viewer}
        prefs={prefs}
        isPremium={isPremium}
        adSettings={adSettings}
        nameQuery={nameQuery}
        ageMin={ageMin}
        ageMax={ageMax}
        state={state}
        city={city}
        searchCities={searchCities}
        defaultCity={filterDefaults.city}
        defaultState={filterDefaults.state}
        distanceKm={distanceKm}
        advanced={advanced}
        filtersApplied={hasCustomFilters}
        pendingProfileId={pendingProfileId}
        onUpgrade={onOpenPremium}
        onSignalLimit={() => setSignalLimitOpen(true)}
        onViewMore={onDiscover}
        onResetFilters={resetFilters}
        onSignalSent={handleSignalSent}
      />

      <HomeQuickFilterSheet
        open={quickFiltersOpen}
        ageMin={ageMin}
        ageMax={ageMax}
        state={state}
        city={city}
        distanceKm={distanceKm}
        onAgeMinChange={setAgeMin}
        onAgeMaxChange={setAgeMax}
        onLocationChange={handleLocationChange}
        onDistanceKmChange={setDistanceKm}
        onClose={() => setQuickFiltersOpen(false)}
      />

      <HomeAdvancedFiltersSheet
        open={advancedOpen}
        filters={advanced}
        onChange={setAdvanced}
        onClose={() => setAdvancedOpen(false)}
        onClear={() => setAdvanced(emptyHomeAdvancedFilters())}
        onApply={() => setAdvancedOpen(false)}
      />

      <SignalLimitModal
        open={signalLimitOpen}
        onClose={() => setSignalLimitOpen(false)}
        onGetSignalPass={onOpenPremium}
      />

      <ToastHost />

      {fastConnectionExpiryBanner ? (
        <FastConnectionExpiryBanner
          message={fastConnectionExpiryBanner}
          onRenew={() => void renewFastConnectionFromBanner()}
          onDismiss={dismissFastConnectionExpiryBanner}
        />
      ) : null}

      <FastConnectionActivationSheet
        open={fastConnectionActivationOpen}
        onClose={snoozeFastConnectionActivation}
        onActivate={() => void activateFastConnection()}
        loading={fastConnectionActivationLoading}
      />
    </div>
  );
}
