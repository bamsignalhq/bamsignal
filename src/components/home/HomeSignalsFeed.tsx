import { useCallback, useEffect, useMemo, useState } from "react";
import { ProfileDetailSheet } from "../ProfileDetailSheet";
import { ReportBlockModal } from "../ReportBlockModal";
import { HomeFeedCard } from "./HomeFeedCard";
import { HomeSponsoredBanner } from "./HomeSponsoredBanner";
import { BRAND } from "../../constants/copy";
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
import { getMemberCity } from "../../utils/memberCity";
import { buildHomeFeedGridItems, filterProfilesByName } from "../../utils/homeFeed";
import { homeAdvancedToSearchFilters } from "../../utils/homeFilters";
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
  advanced: HomeAdvancedFilters;
  refreshKey: number;
  filtersApplied: boolean;
  pendingProfileId?: string | null;
  onUpgrade: () => void;
  onViewMore: () => void;
  onResetFilters?: () => void;
  onResultCount?: (count: number) => void;
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
  advanced,
  refreshKey,
  filtersApplied,
  pendingProfileId,
  onUpgrade,
  onViewMore,
  onResetFilters,
  onResultCount,
  onSignalSent
}: HomeSignalsFeedProps) {
  const prefs = normalizeMatchPreferences(readJson(STORAGE_KEYS.matchPreferences, {}));
  const [profiles, setProfiles] = useState<DiscoverProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayLimit, setDisplayLimit] = useState(HOME_FEED_PROFILE_COUNT);
  const [toast, setToast] = useState("");
  const [signalingId, setSignalingId] = useState<string | null>(null);
  const [detailProfile, setDetailProfile] = useState<DiscoverProfile | null>(null);
  const [safetyOpen, setSafetyOpen] = useState(false);

  const resolvedCity = city.trim() || viewer.city || getMemberCity() || "";
  const resolvedState = state.trim() || viewer.state || "";
  const cityLabel = resolvedCity || "your city";

  const loadFeed = useCallback(async () => {
    setLoading(true);
    setDisplayLimit(HOME_FEED_PROFILE_COUNT);
    const exclude = getExcludedProfileIds();
    const searchFilters = homeAdvancedToSearchFilters(advanced);

    let fetched: DiscoverProfile[] = [];

    if (resolvedCity || resolvedState) {
      fetched = await searchMemberProfiles(user, {
        city: resolvedCity,
        state: resolvedCity ? "" : resolvedState,
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

    const blocked = readJson<string[]>(STORAGE_KEYS.blocked, []);
    let deck = filterDiscoverDeck(fetched, viewer, blocked, []).filter((p) => !isAutoFlagged(p.id));

    deck = deck.filter((p) => p.age >= ageMin && p.age <= ageMax);

    if (advanced.verifiedOnly) {
      deck = deck.filter((p) => p.verified);
    }

    const ranked = rankProfiles(deck, viewer, prefs as MatchPreferences);
    setProfiles(ranked);
    onResultCount?.(ranked.length);
    setLoading(false);
  }, [
    user,
    viewer,
    prefs,
    resolvedCity,
    resolvedState,
    ageMin,
    ageMax,
    advanced,
    refreshKey,
    onResultCount
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
    () => filterProfilesByName(profiles, nameQuery),
    [profiles, nameQuery]
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
    const gate = evaluateSignalGate(isPremium, user);
    if (!gate.allowed) {
      localStorage.setItem(STORAGE_KEYS.pendingSignalProfileId, profile.id);
      onUpgrade();
      return;
    }

    setSignalingId(profile.id);
    const sent = await sendSignalRemote(user, profile.id, "signal");
    setSignalingId(null);

    if (!sent) {
      showToast("Could not send Signal. Try again.");
      return;
    }

    recordSignalUsage(isPremium, gate.usesDailySlot);
    incrementSignalsSent();
    onSignalSent?.();
    trackEvent("signal_sent", { profileId: profile.id, source: "home_feed" });
    showToast(`${BRAND.signalSent} to ${profile.name}`);
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
      <header className="home-signals-feed__head">
        <h2>Near you</h2>
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
          <p>No exact matches nearby.</p>
          <p className="home-signals-feed__empty-hint">Try expanding your age range or location.</p>
          {filtersApplied ? (
            <button type="button" className="btn-secondary btn-sm" onClick={() => onResetFilters?.()}>
              Reset Filters
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
              View More Signals Near You →
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
