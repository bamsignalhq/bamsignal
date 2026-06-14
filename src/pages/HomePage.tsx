import { useEffect, useMemo, useState } from "react";
import { FoundingMemberBadge } from "../components/FoundingMemberBadge";
import { DashboardNextSteps } from "../components/dashboard/DashboardNextSteps";
import { DashboardSignalHub } from "../components/dashboard/DashboardSignalHub";
import { ProfileViewsSheet } from "../components/dashboard/ProfileViewsSheet";
import { greetingForHour } from "../constants/copy";
import { STORAGE_KEYS } from "../constants/limits";
import { MOCK_PROFILES } from "../data/mockProfiles";
import type { DiscoverProfile } from "../types";
import { buildDashboardFeed } from "../utils/dashboardFeed";
import { buildDiscoveryDeck } from "../utils/launchSeed";
import { getMatchPreferences, getDatingProfile, normalizeDatingProfile } from "../utils/profile";
import { calculateProfileStrength } from "../utils/profileStrength";
import { getProfileViews, maybeSimulateProfileView } from "../utils/profileViews";
import { filterBlockedById } from "../utils/safety";
import { getSignalsSentCount, getStreak } from "../utils/streaks";
import { readJson } from "../utils/storage";
import { trackEvent } from "../utils/analytics";
import { notifyProfileViewed } from "../utils/notifyHelpers";

type HomePageProps = {
  userName: string;
  isPremium: boolean;
  onDiscover: () => void;
  onOpenPricing: () => void;
  onOpenProfile: () => void;
  onOpenLikes: () => void;
};

function isNewMember(signalsSent: number, profileViews: number, signalsReceived: number): boolean {
  return signalsSent === 0 && profileViews === 0 && signalsReceived === 0;
}

function buildPulseLines(input: {
  viewsToday: number;
  totalViews: number;
  signalsReceived: number;
  nearbyCount: number;
  city: string;
  strength: number;
  feedTexts: string[];
}): string[] {
  const lines: string[] = [];

  if (input.viewsToday > 0) {
    lines.push(
      `${input.viewsToday} profile view${input.viewsToday === 1 ? "" : "s"} today — tap Views to see who`
    );
  } else if (input.totalViews === 0 && input.strength < 80) {
    lines.push("A stronger profile gets more views in your city");
  }

  if (input.signalsReceived > 0) {
    lines.push(
      `${input.signalsReceived} new like${input.signalsReceived === 1 ? "" : "s"} waiting in Likes`
    );
  }

  if (input.nearbyCount > 0) {
    lines.push(`${input.nearbyCount} people match your preferences in ${input.city}`);
  }

  for (const text of input.feedTexts) {
    if (lines.length >= 3) break;
    if (!lines.some((line) => line.toLowerCase().includes(text.toLowerCase().slice(0, 12)))) {
      lines.push(text);
    }
  }

  return lines.slice(0, 3);
}

export function HomePage({
  userName,
  isPremium,
  onDiscover,
  onOpenPricing,
  onOpenProfile,
  onOpenLikes
}: HomePageProps) {
  const [profileViewsOpen, setProfileViewsOpen] = useState(false);
  const [viewsSnapshot, setViewsSnapshot] = useState(() => getProfileViews());

  const profile = getDatingProfile();
  const viewer = normalizeDatingProfile(profile);
  const strength = calculateProfileStrength(profile);
  const streak = getStreak();
  const signalsSent = getSignalsSentCount();
  const signalsReceived = readJson<number>(STORAGE_KEYS.signalsReceived, 0);
  const profileViews = viewsSnapshot;
  const viewsToday = useMemo(() => {
    const today = new Date().toLocaleDateString("en-CA");
    return profileViews.viewers.filter(
      (viewer) => new Date(viewer.at).toLocaleDateString("en-CA") === today
    ).length;
  }, [profileViews.viewers]);
  const firstName = userName.split(" ")[0] || "there";
  const isFoundingMember = Boolean(localStorage.getItem(STORAGE_KEYS.foundingMember));
  const prefs = getMatchPreferences();
  const city = profile.city || "Lagos";

  const nearbyDeck = useMemo(
    () => buildDiscoveryDeck(filterBlockedById(MOCK_PROFILES), viewer, prefs),
    [viewer, prefs]
  );

  const nearby: DiscoverProfile[] = nearbyDeck.slice(0, 5);
  const nearbyCount = nearbyDeck.length;

  const feedItems = buildDashboardFeed({
    profileViewCount: profileViews.count,
    city,
    verified: profile.verified,
    signalsReceived
  });

  const isNew = isNewMember(signalsSent, profileViews.count, signalsReceived);

  const pulseLines = useMemo(
    () =>
      buildPulseLines({
        viewsToday,
        totalViews: profileViews.count,
        signalsReceived,
        nearbyCount,
        city,
        strength,
        feedTexts: feedItems.map((item) => item.text)
      }),
    [viewsToday, profileViews.count, signalsReceived, nearbyCount, city, strength, feedItems]
  );

  const subline = useMemo(() => {
    const parts: string[] = [city];
    if (streak.count > 0) parts.push(`${streak.count}-day streak`);
    if (nearbyCount > 0) parts.push(`${nearbyCount} nearby`);
    if (isNew) return "Set up your signal — then open Discover.";
    return parts.join(" · ");
  }, [city, streak.count, nearbyCount, isNew]);

  useEffect(() => {
    const prev = profileViews.count;
    maybeSimulateProfileView();
    const next = getProfileViews();
    setViewsSnapshot(next);
    if (next.count > prev) {
      trackEvent("profile_viewed");
      notifyProfileViewed();
    }
  }, []);

  return (
    <div className="page home-dashboard">
      <header className="dash-greeting dash-animate">
        <div className="dash-greeting__row">
          <h1>
            {greetingForHour()}, {firstName}
          </h1>
          {isPremium && <span className="dash-greeting__pill">Premium</span>}
        </div>
        <p>{subline}</p>
        {isFoundingMember && <FoundingMemberBadge className="dash-greeting__badge" />}
      </header>

      <DashboardSignalHub
        profileViews={profileViews.count}
        viewsToday={viewsToday}
        signalsReceived={signalsReceived}
        signalsSent={signalsSent}
        streakCount={streak.count}
        nearbyCount={nearbyCount}
        nearbyProfiles={nearby}
        onDiscover={onDiscover}
        onOpenProfileViews={() => setProfileViewsOpen(true)}
        onOpenLikes={onOpenLikes}
        pulseLines={pulseLines}
        isNewMember={isNew}
      />

      <DashboardNextSteps
        profile={profile}
        strength={strength}
        isPremium={isPremium}
        onCompleteProfile={onOpenProfile}
        onOpenPricing={onOpenPricing}
      />

      <ProfileViewsSheet
        open={profileViewsOpen}
        onClose={() => setProfileViewsOpen(false)}
        count={profileViews.count}
        viewsToday={viewsToday}
        viewers={profileViews.viewers}
        isPremium={isPremium}
        onUpgrade={onOpenPricing}
      />
    </div>
  );
}
