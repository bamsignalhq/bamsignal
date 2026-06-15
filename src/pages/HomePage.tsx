import { useEffect, useState } from "react";
import { Crown, ShieldCheck } from "lucide-react";
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
  onOpenProfile: () => void;
};

export function HomePage({
  userName,
  isPremium,
  onDiscover,
  onOpenPremium,
  onOpenProfile
}: HomePageProps) {
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

  const hasActivity = profileViews > 0 || signalsReceived > 0 || connectionsStarted > 0;

  return (
    <div className="page home-dashboard home-dashboard--calm">
      <header className="dash-greeting dash-animate">
        <h1>
          {greetingForHour()}, {firstName}
        </h1>
      </header>

      <DashboardDiscoverCta onDiscover={onDiscover} />

      {hasActivity ? (
        <DashboardActivitySnapshot
          profileViews={profileViews}
          signalsReceived={signalsReceived}
          connectionsStarted={connectionsStarted}
        />
      ) : null}

      {!profile.verified ? (
        <section className="dash-verify dash-verify--subtle card dash-animate">
          <div className="dash-verify--subtle__copy">
            <ShieldCheck size={18} aria-hidden />
            <div>
              <h2>Verification</h2>
              <p>Phone and selfie verification.</p>
            </div>
          </div>
          <button type="button" className="btn-secondary dash-verify--subtle__btn" onClick={onOpenProfile}>
            Verify
          </button>
        </section>
      ) : null}

      {!isPremium ? (
        <section className="dash-premium dash-premium--compact card dash-animate">
          <div className="dash-premium--compact__copy">
            <Crown size={18} aria-hidden />
            <div>
              <h2>Signal Pass</h2>
              <p>Unlimited signals and profile visitors.</p>
            </div>
          </div>
          <button type="button" className="btn-secondary dash-premium--compact__btn" onClick={onOpenPremium}>
            View plans
          </button>
        </section>
      ) : null}
    </div>
  );
}
