import { useCallback, useEffect, useMemo, useState } from "react";
import { greetingForHour } from "../constants/copy";
import { DEFAULT_HOME_FEED_ADS } from "../constants/homeFeedAds";
import { STORAGE_KEYS } from "../constants/limits";
import {
  HomeAdvancedFiltersSheet,
  emptyHomeAdvancedFilters
} from "../components/home/HomeAdvancedFiltersSheet";
import { HomeFeedFilters } from "../components/home/HomeFeedFilters";
import { HomeFilterChips } from "../components/home/HomeFilterChips";
import { HomeProfileVisitorsCard, HomeSavedSearches } from "../components/home/HomeSavedSearches";
import { HomeSignalLimitBar } from "../components/home/HomeSignalLimitBar";
import { HomeSignalsFeed } from "../components/home/HomeSignalsFeed";
import { fetchHomeFeedAds } from "../services/homeFeedAds";
import { fetchVisitorsRemote } from "../services/memberData";
import type { SavedSearch, UserProfile } from "../types";
import { getMemberCity } from "../utils/memberCity";
import {
  advancedFromMatchPreferences,
  buildHomeFilterChips,
  deleteSavedSearch,
  getSavedSearches,
  homeAdvancedFilterCount,
  removeHomeFilterChip,
  saveHomeSearch
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
  const viewer = normalizeDatingProfile(getDatingProfile());
  const prefs = normalizeMatchPreferences(readJson(STORAGE_KEYS.matchPreferences, {}));
  const firstName = userName.split(" ")[0] || "there";

  const [adSettings, setAdSettings] = useState(DEFAULT_HOME_FEED_ADS);
  const [nameQuery, setNameQuery] = useState("");
  const [ageMin, setAgeMin] = useState(prefs.ageMin ?? 22);
  const [ageMax, setAgeMax] = useState(prefs.ageMax ?? 35);
  const [state, setState] = useState(prefs.states[0] || viewer.state || "");
  const [city, setCity] = useState(prefs.cities[0] || viewer.city || getMemberCity() || "");
  const [advanced, setAdvanced] = useState(() => advancedFromMatchPreferences(prefs));
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filtersLoading, setFiltersLoading] = useState(false);
  const [signalTick, setSignalTick] = useState(0);
  const [resultCount, setResultCount] = useState(0);
  const [filtersApplied, setFiltersApplied] = useState(false);
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

  const chips = useMemo(
    () => buildHomeFilterChips({ ageMin, ageMax, city, state, advanced }),
    [ageMin, ageMax, city, state, advanced]
  );

  const applyFilters = useCallback(() => {
    setFiltersLoading(true);
    setFiltersApplied(true);
    setRefreshKey((k) => k + 1);
    window.setTimeout(() => setFiltersLoading(false), 400);
  }, []);

  const resetFilters = () => {
    const resetPrefs = normalizeMatchPreferences({});
    setAgeMin(resetPrefs.ageMin ?? 18);
    setAgeMax(resetPrefs.ageMax ?? 99);
    setState(viewer.state || "");
    setCity(viewer.city || getMemberCity() || "");
    setAdvanced(emptyHomeAdvancedFilters());
    setNameQuery("");
    setFiltersApplied(false);
    setRefreshKey((k) => k + 1);
  };

  const handleRemoveChip = (chip: (typeof chips)[number]) => {
    const next = removeHomeFilterChip(advanced, chip, ageMin, ageMax, city, state);
    setAdvanced(next.advanced);
    setAgeMin(next.ageMin);
    setAgeMax(next.ageMax);
    setCity(next.city);
    setState(next.state);
    setRefreshKey((k) => k + 1);
  };

  const handleSaveSearch = () => {
    const saved = saveHomeSearch({ ageMin, ageMax, state, city, advanced, resultCount });
    setSavedSearches(getSavedSearches());
    void saved;
  };

  const applySavedSearch = (search: SavedSearch) => {
    setAgeMin(search.ageMin);
    setAgeMax(search.ageMax);
    setState(search.state);
    setCity(search.city);
    setAdvanced(search.advanced);
    setFiltersApplied(true);
    setRefreshKey((k) => k + 1);
  };

  const handleSignalSent = () => {
    setSignalTick((t) => t + 1);
    localStorage.removeItem(STORAGE_KEYS.pendingSignalProfileId);
    setPendingProfileId(null);
  };

  return (
    <div className="page home-page home-page--fintech member-content-pad">
      <header className="home-top">
        <div className="home-top__intro">
          <p className="home-top__eyebrow">{greetingForHour()}</p>
          <h1>{firstName}</h1>
        </div>
        <HomeSignalLimitBar isPremium={isPremium} onUpgrade={onOpenPremium} refreshKey={signalTick} />
      </header>

      <section className="home-discovery card" aria-label="Discover people">
        <HomeFeedFilters
          nameQuery={nameQuery}
          onNameQueryChange={setNameQuery}
          ageMin={ageMin}
          ageMax={ageMax}
          onAgeMinChange={setAgeMin}
          onAgeMaxChange={setAgeMax}
          state={state}
          city={city}
          onLocationChange={(nextState, nextCity) => {
            setState(nextState);
            setCity(nextCity);
          }}
          advancedCount={homeAdvancedFilterCount(advanced)}
          onOpenAdvanced={() => setAdvancedOpen(true)}
          onApply={applyFilters}
          loading={filtersLoading}
        />

        <HomeFilterChips
          chips={chips}
          onRemove={handleRemoveChip}
          onReset={resetFilters}
          onSave={handleSaveSearch}
          showSave={filtersApplied && chips.length > 0}
        />
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
        filtersApplied={filtersApplied}
        pendingProfileId={pendingProfileId}
        onUpgrade={onOpenPremium}
        onViewMore={onDiscover}
        onResetFilters={resetFilters}
        onResultCount={setResultCount}
        onSignalSent={handleSignalSent}
      />

      <HomeAdvancedFiltersSheet
        open={advancedOpen}
        filters={advanced}
        onChange={setAdvanced}
        onClose={() => setAdvancedOpen(false)}
        onClear={() => setAdvanced(emptyHomeAdvancedFilters())}
        onApply={applyFilters}
      />
    </div>
  );
}
