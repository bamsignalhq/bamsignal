import { useEffect, useMemo, useRef, useState } from "react";
import { useMemberProfileListener } from "../hooks/useMemberProfileListener";
import { useMemberToast } from "../hooks/useMemberToast";
import { BRAND, ERROR_COPY } from "../constants/copy";
import {
  DISCOVER_FEED_BATCH
} from "../constants/discoverExperience";
import type { DiscoverRelationshipFilter } from "../constants/discoverExperience";
import { FREE_DAILY_SWIPES, STORAGE_KEYS } from "../constants/limits";
import { fetchDiscoverProfiles, searchMemberProfiles } from "../services/discoverProfiles";
import { sendSignalRemote } from "../services/memberData";
import { DiscoverHeader } from "../components/discover/DiscoverHeader";
import { DiscoverFiltersBar } from "../components/discover/DiscoverFiltersBar";
import { DiscoverQuickFilters } from "../components/discover/DiscoverQuickFilters";
import { SignalLimitModal } from "../components/premium/SignalLimitModal";
import { ProfileCardSkeleton } from "../components/Skeleton";
import { MemberEmptyState } from "../components/member";
import { MEMBER_EMPTY_STATES } from "../constants/firstTimeUser";
import {
  DiscoverIntro,
  FirstDiscoverTip,
  FirstSignalCelebration
} from "../components/journey/discover/FirstDiscoverExperience";
import {
  completeFirstDiscoverIntro,
  dismissFirstDiscoverTip,
  isFirstDiscoverIntroPending,
  isFirstDiscoverTipVisible,
  markFirstSignalCelebrationSeen,
  shouldCelebrateFirstSignal
} from "../utils/firstDiscover";
import { markFirstDayStep } from "../utils/firstDayJourney";
import { PaywallModal } from "../components/PaywallModal";
import { ProfileDetailSheet } from "../components/ProfileDetailSheet";
import { ProfileStoryCard } from "../components/discover/ProfileStoryCard";
import { DiscoverSafetyCard } from "../components/discover/DiscoverSafetyCard";
import { DiscoverFilters } from "../components/DiscoverFilters";
import { ReportBlockModal } from "../components/ReportBlockModal";
import type { DiscoverProfile, Match, UserProfile } from "../types";
import type { PremiumPlan } from "../constants/plans";
import { recordDiscoveryImpression } from "../utils/launchSeed";
import { buildDensityAwareDeck } from "../utils/cityDensity";
import { trackUpgradeImpression } from "../utils/premiumConversion";
import {
  defaultDatingProfile
} from "../utils/profile";
import { blockAndReportUser, blockUser, canUserSignalTarget, filterDiscoverDeck } from "../utils/safety";
import { pushPassedProfile, canUndoPass, undoLastPass } from "../utils/undoPass";
import { getVerificationTier } from "../utils/verification";
import { incrementSignalsSent } from "../utils/streaks";
import { trackEvent } from "../utils/analytics";
import { getMemberCity } from "../utils/memberCity";
import { resolveSearchLocationFromPrefs } from "../utils/searchLocationPrefs";
import { getRemainingDaily, incrementDailyCount, readDailyCount, readJson, writeJson } from "../utils/storage";
import {
  applyDiscoverPreferences,
  applyQuickFilter,
  applyDiscoverRelationshipFilter,
  countActiveDiscoverFilters
} from "../utils/discoverFilters";
import { debugRender } from "../utils/debugRecursion";
import { checkSignalBurst } from "../utils/suspicionDetection";
import { reportModerationFlagRemote } from "../services/memberTrust";
import { consumePrioritySignal } from "../utils/activeBoosts";
import { navigateToPath } from "../constants/routes";
import { ProfileImprovementNudge } from "../components/nudges/ProfileImprovementNudge";
import { hapticMedium } from "../utils/memberHaptics";
import { TrustedMemberNudge } from "../components/trusted/TrustedMemberNudge";
import { interleaveTrustNudges, shouldShowTrustFeedNudge } from "../utils/trustFeedInsertion";
import { isTrustedMember } from "../utils/trustedMember";
import { useAndroidBack } from "../hooks/useAndroidBack";
import type { DiscoverQuickFilter } from "../utils/discoverFilters";
import { buildDiscoverReasons } from "../utils/buildDiscoverReasons";
import {
  discoverMembers,
  recordDiscoverFilterChange,
  recordDiscoverSearch,
  recordDiscoveryImpressions,
  recordDiscoveryOpen
} from "../utils/discoveryEngine";
import { recordDiscoverySignal } from "../utils/discoveryFreshness";

const SIGNAL_ANIM_MS = 700;

type DiscoverPageProps = {
  isPremium: boolean;
  plans: PremiumPlan[];
  onMatch: (match: Match) => void;
  onUpgrade: (plan: PremiumPlan) => void;
  onStartPremiumCheckout: () => void;
  paymentLoading?: boolean;
  onOpenSafety?: () => void;
};

export function DiscoverPage({
  isPremium,
  plans,
  onMatch: _onMatch,
  onUpgrade,
  onStartPremiumCheckout,
  paymentLoading,
  onOpenSafety
}: DiscoverPageProps) {
  debugRender("DiscoverPage", { isPremium });
  void _onMatch;

  const [relationshipFilter, setRelationshipFilter] = useState<DiscoverRelationshipFilter>("all");
  const [quickFilter, setQuickFilter] = useState<DiscoverQuickFilter>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [passedIds, setPassedIds] = useState<string[]>(() =>
    readJson<string[]>(STORAGE_KEYS.passed, [])
  );
  const { profile: viewer, prefs, setPrefs } = useMemberProfileListener();
  const [detailProfile, setDetailProfile] = useState<DiscoverProfile | null>(null);
  const [signalSentId, setSignalSentId] = useState<string | null>(null);
  const blocked = readJson<string[]>(STORAGE_KEYS.blocked, []);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const profilesLoadedOnce = useRef(false);
  const [allProfiles, setAllProfiles] = useState<DiscoverProfile[]>([]);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [signalLimitOpen, setSignalLimitOpen] = useState(false);
  const { showToast, ToastHost } = useMemberToast();
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [showDiscoverIntro, setShowDiscoverIntro] = useState(() => isFirstDiscoverIntroPending());
  const [showFirstTip, setShowFirstTip] = useState(() => isFirstDiscoverTipVisible());
  const [firstSignalCelebrate, setFirstSignalCelebrate] = useState(false);

  useEffect(() => {
    if (!showDiscoverIntro) {
      markFirstDayStep("discover_opened");
    }
  }, [showDiscoverIntro]);

  useEffect(() => {
    let cancelled = false;
    if (!profilesLoadedOnce.current) setProfilesLoading(true);
    const user = readJson<UserProfile>(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" });
    const search = resolveSearchLocationFromPrefs(prefs);
    const fallbackCity = viewer.city || getMemberCity() || "";

    void (async () => {
      let profiles: DiscoverProfile[] = [];
      if (search.state || search.cities.length > 0) {
        profiles = await searchMemberProfiles(user, {
          state: search.state,
          cities: search.cities,
          city: search.primaryCity,
          excludeProfileIds: [...blocked, ...passedIds],
          limit: 72
        });
      } else if (fallbackCity) {
        profiles = await fetchDiscoverProfiles(user, fallbackCity, [...blocked, ...passedIds]);
      }
      if (cancelled) return;
      setAllProfiles(profiles);
      profilesLoadedOnce.current = true;
      if (!cancelled) setProfilesLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [viewer.city, viewer.bio, viewer.interests, blocked.length, passedIds.length, prefs.states, prefs.cities, prefs.religions, prefs.ethnicities, prefs.lifestyles, prefs.relationshipIntentions]);

  const baseDeck = useMemo(() => {
    const available = filterDiscoverDeck(allProfiles, viewer, blocked, passedIds);
    const { deck } = buildDensityAwareDeck(available, viewer, prefs, blocked, passedIds);
    const preferred = applyDiscoverPreferences(deck, prefs, viewer);
    const discovered = discoverMembers({
      candidates: preferred,
      viewer,
      prefs,
      blocked,
      passed: passedIds
    }).map((row) => row.profile);
    return applyQuickFilter(discovered, quickFilter, viewer);
  }, [passedIds, blocked, viewer, prefs, allProfiles, quickFilter]);

  const deck = useMemo(() => {
    const filtered = applyDiscoverRelationshipFilter(baseDeck, relationshipFilter, viewer);
    const query = searchQuery.trim().toLowerCase();
    if (!query) return filtered;
    return filtered.filter((p) => {
      const hay = [
        p.name,
        p.city,
        p.state,
        p.occupation,
        ...(p.occupations ?? []),
        ...(p.interests ?? [])
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(query);
    });
  }, [baseDeck, relationshipFilter, viewer, searchQuery]);

  const visibleFeed = useMemo(() => deck.slice(0, DISCOVER_FEED_BATCH), [deck]);

  const feedItems = useMemo(
    () =>
      interleaveTrustNudges(
        visibleFeed,
        !isTrustedMember(viewer) && shouldShowTrustFeedNudge()
      ),
    [visibleFeed, viewer.verified, viewer.verificationStatus]
  );

  const memberCity = viewer.city || getMemberCity() || "Lagos";
  const cityLabel = prefs.cities?.[0] || memberCity;
  const stateLabel = prefs.states?.[0] || viewer.state || "";
  const browseLocation = stateLabel ? `${cityLabel}, ${stateLabel}` : `${cityLabel}, Nigeria`;
  const remaining = getRemainingDaily(STORAGE_KEYS.dailySwipes, FREE_DAILY_SWIPES);
  const atLimit = !isPremium && remaining <= 0;

  useEffect(() => {
    markFirstDayStep("discover_opened");
  }, []);

  useEffect(() => {
    for (const profile of visibleFeed) {
      recordDiscoveryImpression(profile.id);
    }
    // Record explainability + impression analytics (client-side).
    recordDiscoveryImpressions(
      visibleFeed.map((profile) => ({
        profile,
        discoveryScore: 0,
        reasons: buildDiscoverReasons(viewer, profile, 2)
      }))
    );
  }, [visibleFeed, viewer]);

  useAndroidBack(() => {
    if (firstSignalCelebrate) {
      setFirstSignalCelebrate(false);
      return true;
    }
    if (showDiscoverIntro) {
      return true;
    }
    if (filtersOpen) {
      setFiltersOpen(false);
      return true;
    }
    if (safetyOpen) {
      setSafetyOpen(false);
      return true;
    }
    if (detailProfile) {
      setDetailProfile(null);
      return true;
    }
    if (signalLimitOpen) {
      setSignalLimitOpen(false);
      return true;
    }
    if (paywallOpen) {
      setPaywallOpen(false);
      return true;
    }
    return false;
  });

  const canSignal = () => {
    if (isPremium) return true;
    if (readDailyCount(STORAGE_KEYS.dailySwipes) >= FREE_DAILY_SWIPES) {
      trackEvent("paywall_seen", { source: "discover_swipes" });
      trackUpgradeImpression("signal_limit");
      setSignalLimitOpen(true);
      return false;
    }
    return true;
  };

  const useSwipe = () => {
    if (!isPremium) incrementDailyCount(STORAGE_KEYS.dailySwipes);
  };

  const advance = (profileId: string) => {
    pushPassedProfile(profileId);
    setPassedIds(readJson<string[]>(STORAGE_KEYS.passed, []));
    if (detailProfile?.id === profileId) setDetailProfile(null);
  };

  const handleUndoPass = () => {
    if (!canUndoPass(isPremium)) {
      showToast("Signal Pass gives you unlimited undo.");
      trackUpgradeImpression("signal_limit");
      setPaywallOpen(true);
      return;
    }
    const restoredId = undoLastPass(isPremium);
    if (!restoredId) return;
    setPassedIds(readJson<string[]>(STORAGE_KEYS.passed, []));
    showToast("Pass undone", { tone: "success" });
  };

  const finishSignal = async (profile: DiscoverProfile, opts?: { priority?: boolean; quiet?: boolean }) => {
    const user = readJson<UserProfile>(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" });
    const priority = opts?.priority ?? false;
    const sent = await sendSignalRemote(user, profile.id, priority ? "priority" : "signal");

    if (!sent.ok) {
      showToast(sent.error || ERROR_COPY.signalFailed, { tone: "error", duration: 3500 });
      advance(profile.id);
      return;
    }

    const burst = checkSignalBurst();
    if (burst && "count" in burst) {
      void reportModerationFlagRemote(user, burst.reason, { count: burst.count }, profile.id);
    }

    hapticMedium();
    if (!opts?.quiet) {
      showToast(priority ? `${BRAND.prioritySignal} sent` : BRAND.signalSent, { tone: "success" });
    }
    advance(profile.id);
  };

  const handleIgnore = (profile: DiscoverProfile) => {
    if (!atLimit) useSwipe();
    advance(profile.id);
  };

  const handleSendSignal = (profile: DiscoverProfile) => {
    const signalGate = canUserSignalTarget(viewer, profile, prefs);
    if (!canSignal() || signalSentId === profile.id) return;
    if (!signalGate.allowed) {
      showToast(signalGate.reason, { tone: "error", duration: 3500 });
      return;
    }
    const celebrate = shouldCelebrateFirstSignal();
    setSignalSentId(profile.id);
    useSwipe();
    incrementSignalsSent();
    markFirstDayStep("first_signal");
    const priority = consumePrioritySignal();
    trackEvent("signal_sent", { profileId: profile.id, priority: priority ? "true" : "false" });
    recordDiscoverySignal(profile.id);
    setTimeout(() => {
      setSignalSentId(null);
      void finishSignal(profile, { priority, quiet: celebrate }).then(() => {
        if (celebrate) {
          markFirstSignalCelebrationSeen();
          setFirstSignalCelebrate(true);
        }
      });
    }, SIGNAL_ANIM_MS);
  };

  const handlePrioritySignal = (profile: DiscoverProfile) => {
    const signalGate = canUserSignalTarget(viewer, profile, prefs);
    if (!canSignal() || !signalGate.allowed || signalSentId === profile.id) return;
    const celebrate = shouldCelebrateFirstSignal();
    setSignalSentId(profile.id);
    useSwipe();
    incrementSignalsSent();
    markFirstDayStep("first_signal");
    trackEvent("signal_sent", { profileId: profile.id, priority: "true" });
    const usedBoost = consumePrioritySignal();
    setTimeout(() => {
      setSignalSentId(null);
      void finishSignal(profile, { priority: usedBoost || isPremium, quiet: celebrate }).then(() => {
        if (celebrate) {
          markFirstSignalCelebrationSeen();
          setFirstSignalCelebrate(true);
        }
      });
    }, SIGNAL_ANIM_MS);
  };

  const handleBlock = (profile: DiscoverProfile) => {
    blockUser(profile.id);
    advance(profile.id);
    showToast(`${profile.name} blocked. They won't appear in your discovery.`, { tone: "success" });
  };

  const handleBlockAndReport = (
    profile: DiscoverProfile,
    reason: import("../types").ReportReason,
    details?: string
  ) => {
    blockAndReportUser(profile.id, reason, details);
    advance(profile.id);
    setDetailProfile(null);
    setSafetyOpen(false);
    showToast(`${profile.name} blocked and reported.`, { tone: "success", duration: 3500 });
  };

  const handleSaveToast = (message: string) => {
    showToast(message, { tone: "success" });
  };

  const memberUser = readJson<UserProfile>(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" });

  const renderEmpty = () => {
    const filteredEmpty = baseDeck.length > 0 && deck.length === 0;
    const discoverEmpty = MEMBER_EMPTY_STATES.discover;

    return (
      <MemberEmptyState
        className="discover-page__empty"
        title={filteredEmpty ? "No one matches this filter right now" : discoverEmpty.title}
        body={
          filteredEmpty
            ? "Widen distance, relax preferences, or check back later — new people join every day."
            : discoverEmpty.body
        }
        actionLabel={filteredEmpty ? "Adjust preferences" : discoverEmpty.actionLabel}
        onAction={() => setFiltersOpen(true)}
      />
    );
  };

  const verificationFor = (profile: DiscoverProfile) =>
    getVerificationTier({ ...defaultDatingProfile(), verified: profile.verified }, false, true);

  if (showDiscoverIntro) {
    return (
      <div className="page discover-page discover-page--intro">
        <DiscoverIntro
          firstName={memberUser.name}
          onMeetSomeone={() => {
            completeFirstDiscoverIntro();
            setShowDiscoverIntro(false);
            setShowFirstTip(true);
            markFirstDayStep("discover_opened");
          }}
        />
      </div>
    );
  }

  return (
    <div className="page discover-page discover-page--premium member-content-pad">
      {showFirstTip && visibleFeed.length > 0 ? (
        <FirstDiscoverTip
          onDismiss={() => {
            dismissFirstDiscoverTip();
            setShowFirstTip(false);
          }}
        />
      ) : null}
      <DiscoverHeader
        cityLabel={browseLocation}
        filterCount={countActiveDiscoverFilters(prefs)}
        onOpenFilters={() => setFiltersOpen(true)}
      />
      <DiscoverQuickFilters
        active={quickFilter}
        onChange={(next) => {
          setQuickFilter(next);
          recordDiscoverFilterChange({ kind: "quick", value: next });
        }}
      />
      <DiscoverFiltersBar
        active={relationshipFilter}
        onChange={(next) => {
          setRelationshipFilter(next);
          recordDiscoverFilterChange({ kind: "relationship", value: next });
        }}
      />

      <div className="discover-page__search">
        <label className="discover-page__search-label">
          <span className="sr-only">Search discover</span>
          <input
            className="discover-page__search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onBlur={() => {
              if (searchQuery.trim()) recordDiscoverSearch(searchQuery);
            }}
            placeholder="Search by name, city, occupation, interests…"
            inputMode="search"
          />
        </label>
      </div>

      <ProfileImprovementNudge
        profile={viewer}
        phoneVerified={Boolean(memberUser.phoneVerified)}
        isPremium={isPremium}
      />

      {passedIds.length > 0 ? (
        <button type="button" className="discover-undo-btn" onClick={handleUndoPass}>
          Undo
        </button>
      ) : null}

      <ToastHost />

      {profilesLoading && <ProfileCardSkeleton />}

      {!profilesLoading && visibleFeed.length === 0 && renderEmpty()}

      {!profilesLoading && visibleFeed.length > 0 ? (
        <div className="discover-page__feed">
          {feedItems.map((item, index) => {
            if (item.type === "trust-nudge") {
              return (
                <TrustedMemberNudge
                  key={`trust-nudge-${item.afterIndex}`}
                  variant="feed"
                  onBecome={() => navigateToPath("/trusted-member")}
                />
              );
            }

            const profile = item.profile;
            const signalGate = canUserSignalTarget(viewer, profile, prefs);
            const verification = verificationFor(profile);
            return (
              <ProfileStoryCard
                key={profile.id}
                profile={profile}
                verification={verification.tier ? verification : undefined}
                staggerIndex={index}
                onPass={() => handleIgnore(profile)}
                onSaveToast={handleSaveToast}
                onSignal={() => handleSendSignal(profile)}
                onViewProfile={() => {
                  markFirstDayStep("compat_viewed");
                  recordDiscoveryOpen(profile.id);
                  setDetailProfile(profile);
                }}
                signalBlockedReason={!signalGate.allowed ? signalGate.reason : undefined}
                signalSent={signalSentId === profile.id}
              />
            );
          })}
          <DiscoverSafetyCard onClick={onOpenSafety} />
        </div>
      ) : null}

      <DiscoverFilters
        prefs={prefs}
        onChange={(next) => {
          setPrefs(next);
          writeJson(STORAGE_KEYS.matchPreferences, next);
        }}
        discoverState={stateLabel || prefs.states?.[0] || ""}
        discoverCity={cityLabel}
        onDiscoverLocationChange={(state, city) => {
          const next = {
            ...prefs,
            states: state ? [state] : [],
            cities: city ? [city] : []
          };
          setPrefs(next);
          writeJson(STORAGE_KEYS.matchPreferences, next);
        }}
        isPremium={isPremium}
        onRequirePremium={() => setPaywallOpen(true)}
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        hideTrigger
      />

      {detailProfile ? (
        <ProfileDetailSheet
          profile={detailProfile}
          open={Boolean(detailProfile)}
          onClose={() => setDetailProfile(null)}
          verification={verificationFor(detailProfile).tier ? verificationFor(detailProfile) : undefined}
          onSendSignal={() => handleSendSignal(detailProfile)}
          onPass={() => handleIgnore(detailProfile)}
          onPrioritySignal={() => handlePrioritySignal(detailProfile)}
          onReport={() => setSafetyOpen(true)}
          onBlock={() => handleBlock(detailProfile)}
          onBlockAndReport={() => setSafetyOpen(true)}
          isPremium={isPremium}
          signalSent={signalSentId === detailProfile.id}
          viewer={memberUser}
        />
      ) : null}

      <SignalLimitModal
        open={signalLimitOpen}
        onClose={() => setSignalLimitOpen(false)}
        onGetSignalPass={() => {
          setSignalLimitOpen(false);
          onStartPremiumCheckout();
        }}
        loading={paymentLoading}
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

      {detailProfile ? (
        <ReportBlockModal
          open={safetyOpen}
          userName={detailProfile.name}
          profileId={detailProfile.id}
          onClose={() => setSafetyOpen(false)}
          onBlock={() => handleBlock(detailProfile)}
          onBlockAndReport={(reason, details) => handleBlockAndReport(detailProfile, reason, details)}
        />
      ) : null}

      {firstSignalCelebrate ? (
        <FirstSignalCelebration
          onKeepExploring={() => {
            setFirstSignalCelebrate(false);
            dismissFirstDiscoverTip();
            setShowFirstTip(false);
          }}
        />
      ) : null}
    </div>
  );
}
