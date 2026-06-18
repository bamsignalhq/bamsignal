import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { getDatingProfile, normalizeDatingProfile, normalizeMatchPreferences } from "../utils/profile";
import { readJson } from "../utils/storage";
import { useAndroidBack } from "../hooks/useAndroidBack";

type HomePageProps = {
  user: UserProfile;
  userName: string;
  isPremium: boolean;
  onDiscover: () => void;
  onOpenPremium: () => void;
};

export function HomePage({ user, userName, isPremium, onDiscover, onOpenPremium }: HomePageProps) {
  const firstName = firstNameFromDisplayName(userName || user.name);
  const viewer = normalizeDatingProfile(getDatingProfile());
  const prefs = normalizeMatchPreferences(readJson(STORAGE_KEYS.matchPreferences, {}));
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

  const fetchCitiesForFeed = useMemo(() => {
    const usingSavedSearch =
      city === filterDefaults.city &&
      state === filterDefaults.state &&
      searchCities.length > 0;
    if (usingSavedSearch && searchCities.length > 1) return searchCities;
    if (city.trim()) return [city.trim()];
    if (searchCities.length) return searchCities;
    return [];
  }, [city, state, searchCities, filterDefaults.city, filterDefaults.state]);

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
          onUpgrade={onOpenPremium}
          refreshKey={signalRefresh}
        />
      </header>

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
    </div>
  );
}
