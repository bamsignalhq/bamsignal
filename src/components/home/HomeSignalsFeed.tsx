import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ProfileDetailSheet } from "../ProfileDetailSheet";
import { ReportBlockModal } from "../ReportBlockModal";
import { HomeFeedCard } from "./HomeFeedCard";
import { HomeSponsoredBanner } from "./HomeSponsoredBanner";
import { BRAND, ERROR_COPY, SUCCESS_COPY } from "../../constants/copy";
import { HOME_FEED_PROFILE_COUNT } from "../../constants/homeFeedAds";
import { STORAGE_KEYS } from "../../constants/limits";
import type { HomeFeedAdsSettings } from "../../constants/homeFeedAds";
import { fetchDiscoverProfiles, searchMemberProfiles } from "../../services/discoverProfiles";
import { sendSignalRemote } from "../../services/memberData";
import type { DatingProfile, DiscoverProfile, MatchPreferences, ReportRecord, UserProfile } from "../../types";
import type { HomeAdvancedFilters } from "../../types";
import {
  computeCompatibilityPercent,
  getProfileMatchReasons
} from "../../utils/compatibility";
import { isSampleHomeProfile, padHomeFeedWithSamples } from "../../utils/homeFeedSamples";
import { getMemberCity } from "../../utils/memberCity";
import { buildHomeFeedGridItems, filterProfilesByName } from "../../utils/homeFeed";
import { homeAdvancedToSearchFilters, filterProfilesByDistance } from "../../utils/homeFilters";
import { effectiveHomeDistanceKm } from "../../utils/cityMetroRadius";
import { rankProfiles } from "../../utils/matching";
import { normalizeMatchPreferences } from "../../utils/profile";
import { blockUser, filterDiscoverDeck, isAutoFlagged } from "../../utils/safety";
import {
  evaluateSignalGate,
  recordSignalUsage
} from "../../utils/signalLimits";
import { readJson } from "../../utils/storage";
import { incrementSignalsSent } from "../../utils/streaks";
import { trackEvent } from "../../utils/analytics";
import { getVerificationTier } from "../../utils/verification";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { flowLog } from "../../utils/flowLog";

type HomeSignalsFeedProps = {
  user: UserProfile;
  viewer: DatingProfile;
  isPremium: boolean;
  adSettings: HomeFeedAdsSettings;
  nameQuery: string;
  ageMin: number;
  ageMax: number;
  state: string;
  city: string;
  searchCities?: string[];
  defaultCity?: string;
  defaultState?: string;
  distanceKm: number;
  advanced: HomeAdvancedFilters;
  filtersApplied: boolean;
  pendingProfileId?: string | null;
  onUpgrade: () => void;
  onViewMore: () => void;
  onResetFilters?: () => void;
  onSignalSent?: () => void;
};

function getExcludedProfileIds(): string[] {
  const blocked = readJson<string[]>(STORAGE_KEYS.blocked, []);
  const reports = readJson<ReportRecord[]>(STORAGE_KEYS.reports, []);
  const reported = reports.map((r) => r.profileId);
  return [...new Set([...blocked, ...reported])];
}

function profileToDatingStub(profile: DiscoverProfile): DatingProfile {
  return {
    photos: profile.photos ?? [profile.photo],
    age: profile.age,
    gender: profile.gender ?? "Man",
    city: profile.city,
    bio: profile.bio,
    lookingFor: profile.lookingFor ?? "Women",
    intents: profile.intents,
    interests: profile.interests ?? [],
    verified: Boolean(profile.verified),
    premium: Boolean(profile.premium)
  };
}

export function HomeSignalsFeed({
  user,
  viewer,
  isPremium,
  adSettings,
  nameQuery,
  ageMin,
  ageMax,
  state,
  city,
  searchCities = [],
  defaultCity = "",
  defaultState = "",
  distanceKm,
  advanced,
  filtersApplied,
  pendingProfileId,
  onUpgrade,
  onViewMore,
  onResetFilters,
  onSignalSent
}: HomeSignalsFeedProps) {
  const prefs = useMemo(
    () => normalizeMatchPreferences(readJson(STORAGE_KEYS.matchPreferences, {})),
    []
  );
  const [baseProfiles, setBaseProfiles] = useState<DiscoverProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const loadedOnceRef = useRef(false);
  const [displayLimit, setDisplayLimit] = useState(HOME_FEED_PROFILE_COUNT);
  const [toast, setToast] = useState("");
  const [signalingId, setSignalingId] = useState<string | null>(null);
  const [detailProfile, setDetailProfile] = useState<DiscoverProfile | null>(null);
  const [safetyOpen, setSafetyOpen] = useState(false);

  const debouncedAgeMin = useDebouncedValue(ageMin, 300);
  const debouncedAgeMax = useDebouncedValue(ageMax, 300);
  const debouncedState = useDebouncedValue(state, 300);
  const debouncedCity = useDebouncedValue(city, 300);
  const debouncedAdvanced = useDebouncedValue(advanced, 300);
  const debouncedNameQuery = useDebouncedValue(nameQuery, 300);

  const fetchCities = useMemo(() => {
    const quickCity = debouncedCity.trim();
    const quickState = debouncedState.trim();
    const usingSavedSearch =
      quickCity === defaultCity &&
      quickState === defaultState &&
      searchCities.length > 0;
    if (usingSavedSearch && searchCities.length > 1) return searchCities;
    if (quickCity) return [quickCity];
    if (searchCities.length) return searchCities;
    return [];
  }, [debouncedCity, debouncedState, searchCities, defaultCity, defaultState]);

  const fetchCity = fetchCities[0] || viewer.city || getMemberCity() || "";
  const fetchState = debouncedState.trim() || viewer.state || "";
  const effectiveDistanceKm = effectiveHomeDistanceKm(
    fetchCity,
    fetchState,
    distanceKm
  );

  const profiles = useMemo(() => {
    let deck = filterProfilesByDistance(baseProfiles, effectiveDistanceKm);
    deck = rankProfiles(deck, viewer, prefs as MatchPreferences);
    return padHomeFeedWithSamples(deck, {
      city: fetchCity,
      viewerCity: viewer.city || "",
      excludeIds: getExcludedProfileIds()
    });
  }, [baseProfiles, effectiveDistanceKm, viewer, prefs, fetchCity]);

  const loadFeed = useCallback(async () => {
    if (!loadedOnceRef.current) setLoading(true);
    setDisplayLimit(HOME_FEED_PROFILE_COUNT);
    flowLog("home_feed_load_start");
    try {
      const exclude = getExcludedProfileIds();
      const searchFilters = homeAdvancedToSearchFilters(debouncedAdvanced);

      let fetched: DiscoverProfile[] = [];

      if (fetchCities.length > 0 || fetchState) {
        fetched = await searchMemberProfiles(user, {
          cities: fetchCities.length > 1 ? fetchCities : undefined,
          city: fetchCities.length === 1 ? fetchCities[0] : "",
          state: fetchCities.length > 0 ? fetchState : fetchState,
          ageMin: debouncedAgeMin,
          ageMax: debouncedAgeMax,
          excludeProfileIds: exclude,
          limit: 96,
          ...searchFilters
        });
      }

      if (fetched.length < HOME_FEED_PROFILE_COUNT && fetchCity) {
        const discover = await fetchDiscoverProfiles(user, fetchCity, exclude);
        const seen = new Set(fetched.map((p) => p.id));
        for (const profile of discover) {
          if (!seen.has(profile.id)) {
            fetched.push(profile);
            seen.add(profile.id);
          }
        }
      }

      const blocked = readJson<string[]>(STORAGE_KEYS.blocked, []);
      let deck = filterDiscoverDeck(fetched, viewer, blocked, []).filter((p) => !isAutoFlagged(p.id));

      deck = deck.filter((p) => p.age >= debouncedAgeMin && p.age <= debouncedAgeMax);

      if (debouncedAdvanced.verifiedOnly) {
        deck = deck.filter((p) => p.verified);
      }

      setBaseProfiles(deck);
      loadedOnceRef.current = true;
      flowLog("home_feed_load_ok", { count: deck.length });
    } finally {
      setLoading(false);
    }
  }, [
    user,
    viewer,
    fetchCities,
    fetchCity,
    fetchState,
    debouncedAgeMin,
    debouncedAgeMax,
    debouncedAdvanced
  ]);

  useEffect(() => {
    void loadFeed();
  }, [loadFeed]);

  useEffect(() => {
    if (!pendingProfileId || !profiles.length) return;
    const match = profiles.find((p) => p.id === pendingProfileId);
    if (match) setDetailProfile(match);
  }, [pendingProfileId, profiles]);

  const displayProfiles = useMemo(
    () => filterProfilesByName(profiles, debouncedNameQuery),
    [profiles, debouncedNameQuery]
  );

  const visibleProfiles = useMemo(
    () => displayProfiles.slice(0, displayLimit),
    [displayProfiles, displayLimit]
  );

  const gridItems = useMemo(
    () => buildHomeFeedGridItems(visibleProfiles, adSettings, displayLimit),
    [visibleProfiles, adSettings, displayLimit]
  );

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  };

  const handleSignal = async (profile: DiscoverProfile) => {
    if (isSampleHomeProfile(profile)) {
      showToast("Preview profile — more people join near you every day.");
      return;
    }

    const gate = evaluateSignalGate(isPremium, user);
    if (!gate.allowed) {
      localStorage.setItem(STORAGE_KEYS.pendingSignalProfileId, profile.id);
      onUpgrade();
      return;
    }

    setSignalingId(profile.id);
    const sent = await sendSignalRemote(user, profile.id, "signal");
    setSignalingId(null);

    if (!sent.ok) {
      showToast(sent.error || ERROR_COPY.signalFailed);
      return;
    }

    recordSignalUsage(isPremium, gate.usesDailySlot);
    incrementSignalsSent();
    onSignalSent?.();
    trackEvent("signal_sent", { profileId: profile.id, source: "home_feed" });
    showToast(BRAND.signalSent);
  };

  const detailVerification = detailProfile
    ? getVerificationTier(
        profileToDatingStub(detailProfile),
        Boolean(detailProfile.premium),
        Boolean(detailProfile.verified)
      )
    : undefined;

  const hasMore = displayProfiles.length > displayLimit;

  return (
    <section className="home-signals-feed" aria-label="Signals near you">
      <header className="home-signals-feed__head home-signals-feed__head--minimal">
        <h2>{SUCCESS_COPY.peopleNearYou}</h2>
      </header>

      {toast ? (
        <p className="home-signals-feed__toast" role="status">
          {toast}
        </p>
      ) : null}

      {loading ? (
        <div className="discover-feed-grid discover-feed-grid--loading" aria-busy="true">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="discover-feed-card discover-feed-card--skeleton" />
          ))}
        </div>
      ) : gridItems.length === 0 ? (
        <div className="home-signals-feed__empty card">
          <p>{SUCCESS_COPY.homeFeedEmpty}</p>
          <p className="home-signals-feed__empty-hint">{SUCCESS_COPY.homeFeedEmptyHint}</p>
          {filtersApplied ? (
            <button type="button" className="btn-secondary btn-sm" onClick={() => onResetFilters?.()}>
              Reset filters
            </button>
          ) : null}
        </div>
      ) : (
        <>
          <div className="discover-feed-grid">
            {gridItems.map((item, index) => {
              if (item.type === "ad") {
                const slot = adSettings.slots[item.slotIndex];
                return (
                  <HomeSponsoredBanner
                    key={`ad-${item.slotIndex}-${index}`}
                    slot={slot}
                    slotLabel={`Banner ${item.slotIndex + 1}`}
                  />
                );
              }

              const profile = item.profile;
              const verification = getVerificationTier(
                profileToDatingStub(profile),
                Boolean(profile.premium),
                Boolean(profile.verified)
              );

              return (
                <HomeFeedCard
                  key={profile.id}
                  profile={profile}
                  verification={verification}
                  signaling={signalingId === profile.id}
                  onOpen={() => setDetailProfile(profile)}
                  onSignal={() => void handleSignal(profile)}
                />
              );
            })}
          </div>

          {hasMore || displayProfiles.length >= HOME_FEED_PROFILE_COUNT ? (
            <button
              type="button"
              className="home-signals-feed__more btn-secondary btn-full"
              onClick={() => {
                if (hasMore) setDisplayLimit((n) => n + HOME_FEED_PROFILE_COUNT);
                else onViewMore();
              }}
            >
              View more
            </button>
          ) : null}
        </>
      )}

      {detailProfile ? (
        <ProfileDetailSheet
          profile={detailProfile}
          open={Boolean(detailProfile)}
          onClose={() => setDetailProfile(null)}
          matchReasons={getProfileMatchReasons(viewer, detailProfile)}
          compatibilityPercent={computeCompatibilityPercent(viewer, detailProfile)}
          verification={detailVerification}
          viewer={user}
          isPremium={isPremium}
          onSendSignal={() => void handleSignal(detailProfile)}
          onReport={() => setSafetyOpen(true)}
          onBlock={() => {
            blockUser(detailProfile.id);
            setDetailProfile(null);
            void loadFeed();
          }}
        />
      ) : null}

      {detailProfile && safetyOpen ? (
        <ReportBlockModal
          open
          userName={detailProfile.name}
          profileId={detailProfile.id}
          onClose={() => setSafetyOpen(false)}
          onBlock={() => {
            blockUser(detailProfile.id);
            setSafetyOpen(false);
            setDetailProfile(null);
            void loadFeed();
          }}
        />
      ) : null}
    </section>
  );
}
