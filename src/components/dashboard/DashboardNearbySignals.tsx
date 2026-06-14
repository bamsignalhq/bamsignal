import type { DatingProfile, DiscoverProfile } from "../../types";
import { computeCompatibilityPercent, getProfileMatchReasons } from "../../utils/compatibility";
import { WhyThisProfile } from "../WhyThisProfile";
import { ShowcaseImage } from "../ShowcaseImage";

type DashboardNearbySignalsProps = {
  profiles: DiscoverProfile[];
  viewer: DatingProfile;
  onDiscover: () => void;
};

export function DashboardNearbySignals({ profiles, viewer, onDiscover }: DashboardNearbySignalsProps) {
  if (!profiles.length) return null;

  return (
    <section className="dash-nearby dash-animate">
      <header className="dash-nearby__head">
        <h2>Nearby Signals</h2>
        <button type="button" className="link-btn" onClick={onDiscover}>
          See More
        </button>
      </header>
      <ul className="dash-nearby__list">
        {profiles.map((profile) => {
          const compat = computeCompatibilityPercent(viewer, profile);
          const reasons = getProfileMatchReasons(viewer, profile).slice(0, 3);
          return (
            <li key={profile.id}>
              <button type="button" className="dash-nearby__card" onClick={onDiscover}>
                <ShowcaseImage src={profile.photo} alt={profile.name} className="dash-nearby__photo" />
                <div className="dash-nearby__body">
                  <div className="dash-nearby__meta">
                    <strong>{profile.name}</strong>
                    <span>
                      {profile.age} · {profile.city}
                    </span>
                    <span className="dash-nearby__compat">{compat}% Compatibility</span>
                  </div>
                  <WhyThisProfile reasons={reasons} compact className="dash-nearby__why" />
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
