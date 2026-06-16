import { useCallback, useEffect, useMemo, useState } from "react";
import { greetingForHour } from "../constants/copy";
import { DEFAULT_HOME_FEED_ADS } from "../constants/homeFeedAds";
import { STORAGE_KEYS } from "../constants/limits";
import type { PremiumPlan } from "../constants/plans";
import {
  HomeAdvancedFiltersSheet,
  emptyHomeAdvancedFilters
} from "../components/home/HomeAdvancedFiltersSheet";
import { PaywallModal } from "../components/PaywallModal";
import { DiscoverFeedToolbar } from "../components/discover/DiscoverFeedToolbar";
import { DiscoverGridFeed } from "../components/discover/DiscoverGridFeed";
import { StateCitySelect } from "../components/StateCitySelect";
import { fetchDiscoverProfiles, searchMemberProfiles } from "../services/discoverProfiles";
import { fetchHomeFeedAds } from "../services/homeFeedAds";
import type { DiscoverProfile, Match, MatchPreferences, UserProfile } from "../types";
import { buildDensityAwareDeck } from "../utils/cityDensity";
import { markFirstDayStep } from "../utils/firstDayJourney";
import {
  evaluateDiscoverStateChange,
  recordDiscoverStateChange
} from "../utils/discoverLocation";
import { applyDiscoverPreferences } from "../utils/discoverFilters";
import { getMemberCity } from "../utils/memberCity";
import {
  advancedFromMatchPreferences,
  homeAdvancedFilterCount,
  homeAdvancedToSearchFilters
} from "../utils/homeFilters";
import { rankProfiles } from "../utils/matching";
import { normalizeDatingProfile, normalizeMatchPreferences } from "../utils/profile";
import { filterDiscoverDeck, isAutoFlagged } from "../utils/safety";
import { readJson, writeJson } from "../utils/storage";
import { trackEvent } from "../utils/analytics";
import { trackUpgradeImpression } from "../utils/premiumConversion";
import { HOME_FEED_PROFILE_COUNT } from "../constants/homeFeedAds";
import { filterProfilesByName } from "../utils/homeFeed";

type DiscoverPageProps = {
  isPremium: boolean;
  plans: PremiumPlan[];
  onMatch: (match: Match) => void;
  onUpgrade: (plan: PremiumPlan) => void;
  paymentLoading?: boolean;
};

function getExcludedProfileIds(): string[] {
  return readJson<string[]>(STORAGE_KEYS.blocked, []);
}

export function DiscoverPage({
  isPremium,
  plans,
  onUpgrade,
  paymentLoading
}: DiscoverPageProps) {
  const user = readJson<UserProfile>(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" });
  const firstName = user.name.split(" ")[0] || "there";
  const viewer = normalizeDatingProfile(readJson(STORAGE_KEYS.datingProfile, {}));
  const prefs = normalizeMatchPreferences(readJson(STORAGE_KEYS.matchPreferences, {}));

  const [adSettings, setAdSettings] = useState(DEFAULT_HOME_FEED_ADS);
  const [nameQuery, setNameQuery] = useState("");
  const [ageMin, setAgeMin] = useState(prefs.ageMin ?? 22);
  const [ageMax, setAgeMax] = useState(prefs.ageMax ?? 35);
  const [state, setState] = useState(prefs.states[0] || viewer.state || "");
  const [city, setCity] = useState(prefs.cities[0] || viewer.city || getMemberCity() || "");
  const [advanced, setAdvanced] = useState(() => advancedFromMatchPreferences(prefs));
  const [matchPrefs, setMatchPrefs] = useState(prefs);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rawProfiles, setRawProfiles] = useState<DiscoverProfile[]>([]);
  const [densityMessage, setDensityMessage] = useState<string | undefined>();

  const [ageSheetOpen, setAgeSheetOpen] = useState(false);
  const [locationSheetOpen, setLocationSheetOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);

  const blocked = readJson<string[]>(STORAGE_KEYS.blocked, []);
  const discoverState = (viewer.state ?? state) || "Lagos";
  const resolvedCity = city.trim() || viewer.city || getMemberCity() || "";
  const locationLabel = resolvedCity || state || "Anywhere";

  useEffect(() => {
    markFirstDayStep("discover_opened");
    void fetchHomeFeedAds().then(setAdSettings);
  }, []);

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    const exclude = getExcludedProfileIds();
    const searchFilters = homeAdvancedToSearchFilters(advanced);
    let fetched: DiscoverProfile[] = [];

    if (resolvedCity || state) {
      fetched = await searchMemberProfiles(user, {
        city: resolvedCity,
        state: resolvedCity ? "" : state,
        ageMin,
        ageMax,
        excludeProfileIds: exclude,
        limit: 96,
        ...searchFilters
      });
    }

    if (fetched.length < HOME_FEED_PROFILE_COUNT && resolvedCity) {
      const discover = await fetchDiscoverProfiles(user, resolvedCity, exclude);
      const seen = new Set(fetched.map((p) => p.id));
      for (const profile of discover) {
        if (!seen.has(profile.id)) {
          fetched.push(profile);
          seen.add(profile.id);
        }
      }
    }

    let deck = filterDiscoverDeck(fetched, viewer, blocked, []).filter((p) => !isAutoFlagged(p.id));
    deck = deck.filter((p) => p.age >= ageMin && p.age <= ageMax);
    if (advanced.verifiedOnly) deck = deck.filter((p) => p.verified);

    const { deck: densityDeck, density } = buildDensityAwareDeck(deck, viewer, matchPrefs, blocked, []);
    const preferred = applyDiscoverPreferences(densityDeck, matchPrefs, viewer);
    const ranked = rankProfiles(preferred, viewer, matchPrefs);

    setRawProfiles(ranked);
    setDensityMessage(density.message);
    setLoading(false);
  }, [
    user,
    viewer,
    matchPrefs,
    blocked,
    resolvedCity,
    state,
    ageMin,
    ageMax,
    advanced,
    refreshKey
  ]);

  useEffect(() => {
    void loadProfiles();
  }, [loadProfiles]);

  const profiles = useMemo(
    () => filterProfilesByName(rawProfiles, nameQuery),
    [rawProfiles, nameQuery]
  );

  const updateDiscoverLocation = (nextState: string, nextCity: string) => {
    const prevState = discoverState;
    if (nextState !== prevState) {
      const gate = evaluateDiscoverStateChange(prevState, nextState, isPremium);
      if (!gate.allowed) {
        trackEvent("paywall_seen", { source: "discover_state_change" });
        trackUpgradeImpression("discover_state_change");
        setPaywallOpen(true);
        return;
      }
      recordDiscoverStateChange();
    }
    setState(nextState);
    setCity(nextCity);
    const nextViewer = { ...viewer, state: nextState, city: nextCity };
    writeJson(STORAGE_KEYS.datingProfile, { ...nextViewer, premium: isPremium });
    setLocationSheetOpen(false);
    setRefreshKey((k) => k + 1);
  };

  const applyAgeFilter = () => {
    setAgeSheetOpen(false);
    setRefreshKey((k) => k + 1);
  };

  const applyAdvancedFilters = () => {
    setAdvancedOpen(false);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="page discover-page discover-page--grid member-content-pad">
      <header className="discover-page__greeting">
        <h1>
          {greetingForHour()}, {firstName} 👋
        </h1>
      </header>

      <DiscoverFeedToolbar
        nameQuery={nameQuery}
        onNameQueryChange={setNameQuery}
        ageMin={ageMin}
        ageMax={ageMax}
        locationLabel={locationLabel}
        advancedCount={homeAdvancedFilterCount(advanced)}
        onOpenAge={() => setAgeSheetOpen(true)}
        onOpenLocation={() => setLocationSheetOpen(true)}
        onOpenAdvanced={() => setAdvancedOpen(true)}
      />

      {densityMessage ? (
        <p className="discover-page__density" role="status">
          {densityMessage}
        </p>
      ) : null}

      <DiscoverGridFeed
        user={user}
        viewer={viewer}
        profiles={profiles}
        loading={loading}
        isPremium={isPremium}
        adSettings={adSettings}
        onUpgrade={() => setPaywallOpen(true)}
        onReload={() => setRefreshKey((k) => k + 1)}
        onViewAll={() => {
          if (profiles.length > HOME_FEED_PROFILE_COUNT) {
            window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
          }
        }}
      />

      {ageSheetOpen ? (
        <div className="discover-filter-sheet" role="dialog" aria-modal="true" aria-label="Age filter">
          <button type="button" className="discover-filter-sheet__backdrop" onClick={() => setAgeSheetOpen(false)} aria-label="Close" />
          <div className="discover-filter-sheet__panel card">
            <h3>Age range</h3>
            <div className="discover-filter-sheet__age">
              <label>
                Min
                <input
                  type="number"
                  min={18}
                  max={99}
                  value={ageMin}
                  onChange={(e) => setAgeMin(Number(e.target.value) || 18)}
                />
              </label>
              <span aria-hidden>–</span>
              <label>
                Max
                <input
                  type="number"
                  min={18}
                  max={99}
                  value={ageMax}
                  onChange={(e) => setAgeMax(Number(e.target.value) || 99)}
                />
              </label>
            </div>
            <button type="button" className="btn-primary btn-full" onClick={applyAgeFilter}>
              Apply
            </button>
          </div>
        </div>
      ) : null}

      {locationSheetOpen ? (
        <div className="discover-filter-sheet" role="dialog" aria-modal="true" aria-label="Location filter">
          <button
            type="button"
            className="discover-filter-sheet__backdrop"
            onClick={() => setLocationSheetOpen(false)}
            aria-label="Close"
          />
          <div className="discover-filter-sheet__panel card">
            <h3>Location</h3>
            <StateCitySelect
              state={state || discoverState}
              city={city}
              onLocationChange={updateDiscoverLocation}
              stateLabel="State"
              cityLabel="City"
            />
          </div>
        </div>
      ) : null}

      <HomeAdvancedFiltersSheet
        open={advancedOpen}
        filters={advanced}
        onChange={setAdvanced}
        onClose={() => setAdvancedOpen(false)}
        onClear={() => setAdvanced(emptyHomeAdvancedFilters())}
        onApply={applyAdvancedFilters}
      />

      <PaywallModal
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        plans={plans}
        onSelectPlan={(plan) => {
          onUpgrade(plan);
          setPaywallOpen(false);
        }}
        loading={paymentLoading}
      />
    </div>
  );
}
