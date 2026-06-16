import { useCallback, useEffect, useMemo, useState } from "react";
import { greetingForHour } from "../constants/copy";
import { stateForCity } from "../constants/profileOptions";
import { DEFAULT_HOME_FEED_ADS } from "../constants/homeFeedAds";
import { STORAGE_KEYS } from "../constants/limits";
import {
  HomeAdvancedFiltersSheet,
  emptyHomeAdvancedFilters
} from "../components/home/HomeAdvancedFiltersSheet";
import { HomeFeedFilters } from "../components/home/HomeFeedFilters";
import { HomeFilterChips } from "../components/home/HomeFilterChips";
import { HomeProfileVisitorsCard, HomeSavedSearches } from "../components/home/HomeSavedSearches";
import { HomeQuickFilterSheet } from "../components/home/HomeQuickFilterSheet";
import { HomeSignalLimitBar } from "../components/home/HomeSignalLimitBar";
import { HomeSignalsFeed } from "../components/home/HomeSignalsFeed";
import { fetchHomeFeedAds } from "../services/homeFeedAds";
import { fetchVisitorsRemote } from "../services/memberData";
import type { SavedSearch, UserProfile } from "../types";
import { getMemberCity } from "../utils/memberCity";
import {
  advancedFromMatchPreferences,
  buildHomeAdvancedChips,
  deleteSavedSearch,
  getSavedSearches,
  homeHasCustomFilters
} from "../utils/homeFilters";
import { getDatingProfile, normalizeDatingProfile, normalizeMatchPreferences } from "../utils/profile";
import { getProfileViews, setProfileViewsFromServer } from "../utils/profileViews";
import { readJson } from "../utils/storage";

type HomePageProps = {
  user: UserProfile;
  userName: string;
  isPremium: boolean;
  onDiscover: () => void;
  onOpenPremium: () => void;
};

export function HomePage({ user, userName, isPremium, onDiscover, onOpenPremium }: HomePageProps) {
  void userName;
  const viewer = normalizeDatingProfile(getDatingProfile());
  const prefs = normalizeMatchPreferences(readJson(STORAGE_KEYS.matchPreferences, {}));
  const defaultAgeMin = prefs.ageMin ?? 22;
  const defaultAgeMax = prefs.ageMax ?? 35;
  const defaultState = prefs.states[0] || viewer.state || "";
  const defaultCity = prefs.cities[0] || viewer.city || getMemberCity() || "";

  const [adSettings, setAdSettings] = useState(DEFAULT_HOME_FEED_ADS);
  const [nameQuery, setNameQuery] = useState("");
  const [ageMin, setAgeMin] = useState(defaultAgeMin);
  const [ageMax, setAgeMax] = useState(defaultAgeMax);
  const [state, setState] = useState(defaultState);
  const [city, setCity] = useState(defaultCity);
  const [advanced, setAdvanced] = useState(() => advancedFromMatchPreferences(prefs));
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [quickFiltersOpen, setQuickFiltersOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [signalTick, setSignalTick] = useState(0);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(() => getSavedSearches());
  const [visitorCount, setVisitorCount] = useState(() => getProfileViews().count);
  const [pendingProfileId, setPendingProfileId] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEYS.pendingSignalProfileId)
  );

  useEffect(() => {
    void fetchHomeFeedAds().then(setAdSettings);
    void fetchVisitorsRemote(user).then((viewers) => {
      if (viewers.length) setProfileViewsFromServer(viewers);
      setVisitorCount(getProfileViews().count);
    });
  }, [user]);

  const advancedChips = useMemo(() => buildHomeAdvancedChips(advanced), [advanced]);

  const hasCustomFilters = useMemo(
    () =>
      homeHasCustomFilters({
        ageMin,
        ageMax,
        city,
        state,
        advanced,
        defaultAgeMin,
        defaultAgeMax,
        defaultCity,
        defaultState
      }),
    [ageMin, ageMax, city, state, advanced, defaultAgeMin, defaultAgeMax, defaultCity, defaultState]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setRefreshKey((k) => k + 1);
    }, 280);
    return () => window.clearTimeout(timer);
  }, [nameQuery, ageMin, ageMax, state, city, advanced]);

  const handleLocationChange = useCallback((nextState: string, nextCity: string) => {
    const resolvedState = nextCity ? stateForCity(nextCity) || nextState : nextState;
    setState(resolvedState);
    setCity(nextCity);
  }, []);

  const resetFilters = () => {
    setAgeMin(defaultAgeMin);
    setAgeMax(defaultAgeMax);
    setState(defaultState);
    setCity(defaultCity);
    setAdvanced(emptyHomeAdvancedFilters());
    setNameQuery("");
    setQuickFiltersOpen(false);
    setRefreshKey((k) => k + 1);
  };

  const applySavedSearch = (search: SavedSearch) => {
    setAgeMin(search.ageMin);
    setAgeMax(search.ageMax);
    setState(search.state);
    setCity(search.city);
    setAdvanced(search.advanced);
    setRefreshKey((k) => k + 1);
  };

  const handleSignalSent = () => {
    setSignalTick((t) => t + 1);
    localStorage.removeItem(STORAGE_KEYS.pendingSignalProfileId);
    setPendingProfileId(null);
  };

  return (
    <div className="page home-page home-page--compact member-content-pad">
      <header className="home-top home-top--compact">
        <h1 className="home-top__greeting">{greetingForHour()} 👋</h1>
        <HomeSignalLimitBar isPremium={isPremium} onUpgrade={onOpenPremium} refreshKey={signalTick} />
      </header>

      <section className="home-discovery home-discovery--compact" aria-label="Find people">
        <HomeFeedFilters
          nameQuery={nameQuery}
          onNameQueryChange={setNameQuery}
          ageMin={ageMin}
          ageMax={ageMax}
          city={city}
          state={state}
          onOpenQuickFilters={() => setQuickFiltersOpen(true)}
          onOpenAdvanced={() => setAdvancedOpen(true)}
        />

        <HomeFilterChips chips={advancedChips} />

        {hasCustomFilters ? (
          <button type="button" className="home-discovery__reset" onClick={resetFilters}>
            Reset
          </button>
        ) : null}
      </section>

      <HomeSavedSearches
        searches={savedSearches}
        onApply={applySavedSearch}
        onDelete={(id) => {
          deleteSavedSearch(id);
          setSavedSearches(getSavedSearches());
        }}
      />

      <HomeProfileVisitorsCard
        isPremium={isPremium}
        visitorCount={visitorCount}
        onUpgrade={onOpenPremium}
      />

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
        advanced={advanced}
        refreshKey={refreshKey}
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
        onAgeMinChange={setAgeMin}
        onAgeMaxChange={setAgeMax}
        onLocationChange={handleLocationChange}
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
