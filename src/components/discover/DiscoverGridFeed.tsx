import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ProfileDetailSheet } from "../ProfileDetailSheet";
import { ReportBlockModal } from "../ReportBlockModal";
import { HomeSponsoredBanner } from "../home/HomeSponsoredBanner";
import { DiscoverFeedCard } from "./DiscoverFeedCard";
import { BRAND } from "../../constants/copy";
import { HOME_FEED_PROFILE_COUNT } from "../../constants/homeFeedAds";
import type { HomeFeedAdsSettings } from "../../constants/homeFeedAds";
import { sendSignalRemote } from "../../services/memberData";
import type { DatingProfile, DiscoverProfile, UserProfile } from "../../types";
import {
  computeCompatibilityPercent,
  getProfileMatchReasons
} from "../../utils/compatibility";
import { buildHomeFeedGridItems } from "../../utils/homeFeed";
import { blockUser } from "../../utils/safety";
import { evaluateSignalGate, recordSignalUsage } from "../../utils/signalLimits";
import { incrementSignalsSent } from "../../utils/streaks";
import { trackEvent } from "../../utils/analytics";
import { getVerificationTier } from "../../utils/verification";

type DiscoverGridFeedProps = {
  user: UserProfile;
  viewer: DatingProfile;
  profiles: DiscoverProfile[];
  loading: boolean;
  isPremium: boolean;
  adSettings: HomeFeedAdsSettings;
  onUpgrade: () => void;
  onViewAll?: () => void;
  onReload?: () => void;
};

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

export function DiscoverGridFeed({
  user,
  viewer,
  profiles,
  loading,
  isPremium,
  adSettings,
  onUpgrade,
  onViewAll,
  onReload
}: DiscoverGridFeedProps) {
  const [displayLimit, setDisplayLimit] = useState(HOME_FEED_PROFILE_COUNT);
  const [toast, setToast] = useState("");
  const [signalingId, setSignalingId] = useState<string | null>(null);
  const [detailProfile, setDetailProfile] = useState<DiscoverProfile | null>(null);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setDisplayLimit(HOME_FEED_PROFILE_COUNT);
  }, [profiles]);

  const visibleProfiles = useMemo(
    () => profiles.slice(0, displayLimit),
    [profiles, displayLimit]
  );

  const gridItems = useMemo(
    () => buildHomeFeedGridItems(visibleProfiles, adSettings, displayLimit),
    [visibleProfiles, adSettings, displayLimit]
  );

  const hasMore = profiles.length > displayLimit;
  const showingCount = Math.min(displayLimit, profiles.length);

  const loadNextBatch = useCallback(() => {
    setDisplayLimit((n) => n + HOME_FEED_PROFILE_COUNT);
  }, []);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || loading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) loadNextBatch();
      },
      { rootMargin: "240px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadNextBatch, loading]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  };

  const handleSignal = async (profile: DiscoverProfile) => {
    const gate = evaluateSignalGate(isPremium, user);
    if (!gate.allowed) {
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
    trackEvent("signal_sent", { profileId: profile.id, source: "discover_grid" });
    showToast(`${BRAND.signalSent} to ${profile.name}`);
  };

  const detailVerification = detailProfile
    ? getVerificationTier(
        profileToDatingStub(detailProfile),
        Boolean(detailProfile.premium),
        Boolean(detailProfile.verified)
      )
    : undefined;

  return (
    <section className="discover-grid-feed" aria-label="Signals near you">
      <header className="discover-grid-feed__head">
        <div>
          <h2>Signals Near You</h2>
          <p>People around you looking for something real.</p>
        </div>
        {onViewAll ? (
          <button type="button" className="discover-grid-feed__view-all" onClick={onViewAll}>
            View all
          </button>
        ) : null}
      </header>

      {toast ? (
        <p className="discover-grid-feed__toast" role="status">
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
        <div className="discover-grid-feed__empty card">
          <p>No signals nearby right now.</p>
          <p className="discover-grid-feed__empty-hint">Try widening your age range or location.</p>
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
                <DiscoverFeedCard
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

          {profiles.length > 0 ? (
            <p className="discover-grid-feed__count" aria-live="polite">
              Showing {showingCount} of many amazing people near you
            </p>
          ) : null}

          {hasMore ? (
            <>
              <div ref={loadMoreRef} className="discover-grid-feed__sentinel" aria-hidden />
              <button type="button" className="discover-grid-feed__more btn-secondary btn-full" onClick={loadNextBatch}>
                View More Signals Near You →
              </button>
            </>
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
            onReload?.();
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
            onReload?.();
          }}
        />
      ) : null}
    </section>
  );
}
