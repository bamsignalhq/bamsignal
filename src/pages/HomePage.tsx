import { useEffect, useState } from "react";
import { DashboardActivitySnapshot } from "../components/dashboard/DashboardActivitySnapshot";
import { DashboardDiscoverCta } from "../components/dashboard/DashboardDiscoverCta";
import { greetingForHour } from "../constants/copy";
import { STORAGE_KEYS } from "../constants/limits";
import type { LikeEntry, Match } from "../types";
import { getDatingProfile, normalizeDatingProfile } from "../utils/profile";
import { getProfileViews, syncProfileViewsFromSignals } from "../utils/profileViews";
import { readJson } from "../utils/storage";

type HomePageProps = {
  userName: string;
  isPremium: boolean;
  onDiscover: () => void;
  onOpenPremium: () => void;
};

export function HomePage({ userName, isPremium, onDiscover, onOpenPremium }: HomePageProps) {
  const [viewsSnapshot, setViewsSnapshot] = useState(() => getProfileViews());

  const profile = getDatingProfile();
  const viewer = normalizeDatingProfile(profile);
  const signalsReceived = readJson<number>(STORAGE_KEYS.signalsReceived, 0);
  const connectionsStarted = readJson<Match[]>(STORAGE_KEYS.matches, []).length;
  const profileViews = viewsSnapshot.count;
  const firstName = userName.split(" ")[0] || "there";

  useEffect(() => {
    const signals = readJson<LikeEntry[]>(STORAGE_KEYS.likedBy, []);
    syncProfileViewsFromSignals(viewer, signals);
    setViewsSnapshot(getProfileViews());
  }, [viewer, profile]);

  return (
    <div className="page home-dashboard home-dashboard--calm">
      <header className="dash-greeting">
        <h1>
          {greetingForHour()}, {firstName}
        </h1>
      </header>

      <DashboardActivitySnapshot
        profileViews={profileViews}
        signalsReceived={signalsReceived}
        connectionsStarted={connectionsStarted}
      />

      <DashboardDiscoverCta onDiscover={onDiscover} />

      {!isPremium ? (
        <section className="dash-premium dash-premium--compact" aria-label="Signal Pass">
          <div className="dash-premium--compact__copy">
            <h2>Signal Pass</h2>
            <p>Unlimited signals and profile visitors.</p>
          </div>
          <button type="button" className="btn-primary dash-premium--compact__btn" onClick={onOpenPremium}>
            View plans
          </button>
        </section>
      ) : null}
    </div>
  );
}
