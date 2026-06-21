import { useEffect, useMemo, useState } from "react";
import { BadgeCheck } from "lucide-react";
import { CITIES_VISUAL } from "../../data/visualLanding";
import { HOME_SECTIONS } from "../../data/homeLanding";
import { ProfileDetailSheet } from "../ProfileDetailSheet";
import { ShowcaseImage } from "../ShowcaseImage";
import { fetchCitySpotlightProfiles, type CityHomeProfile } from "../../services/cityHome";
import { cityHomeToDiscoverProfile, trackCitySpotlightEvent } from "../../utils/citySpotlight";
import { cityVisualId, readSpotlightCity, resolveGuestCity, saveSpotlightCity } from "../../utils/guestCity";
import type { DiscoverProfile } from "../../types";

type CitySpotlightSectionProps = {
  onGuestAction: () => void;
};

function isHotPlacement(profile: CityHomeProfile): boolean {
  return Boolean(profile.placementType && ["hot", "spotlight", "boost"].includes(profile.placementType));
}

export function CitySpotlightSection({ onGuestAction }: CitySpotlightSectionProps) {
  const [cityId, setCityId] = useState(() => cityVisualId(readSpotlightCity() || resolveGuestCity()));
  const [profiles, setProfiles] = useState<CityHomeProfile[]>([]);
  const [selected, setSelected] = useState<DiscoverProfile | null>(null);

  const city = CITIES_VISUAL.find((c) => c.id === cityId) ?? CITIES_VISUAL[0];
  const { cities } = HOME_SECTIONS;

  useEffect(() => {
    let cancelled = false;
    void fetchCitySpotlightProfiles(city.name, 8).then((rows) => {
      if (!cancelled) setProfiles(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [city.name]);

  useEffect(() => {
    if (!profiles.length) return;
    void trackCitySpotlightEvent({
      eventType: "view",
      city: city.name,
      meta: { count: profiles.length }
    });
  }, [city.name, profiles.length]);

  const spotlightCards = useMemo(() => profiles.slice(0, 8), [profiles]);

  const openProfile = (profile: CityHomeProfile) => {
    const discover = cityHomeToDiscoverProfile(profile);
    void trackCitySpotlightEvent({
      eventType: "click",
      city: city.name,
      profileId: profile.profileId
    });
    void trackCitySpotlightEvent({
      eventType: "profile_open",
      city: city.name,
      profileId: profile.profileId
    });
    setSelected(discover);
  };

  const sendSignal = () => {
    if (selected) {
      void trackCitySpotlightEvent({
        eventType: "signal",
        city: city.name,
        profileId: selected.id
      });
    }
    setSelected(null);
    onGuestAction();
  };

  return (
    <section className="home-section city-spotlight" id="city-spotlight">
      <header className="home-section__head">
        <p className="home-section__eyebrow">{cities.eyebrow}</p>
        <h2 className="home-section__title">{cities.title}</h2>
        <p className="home-section__lede">{cities.lede}</p>
      </header>

      <div className="city-spotlight__cities" role="tablist" aria-label="Cities">
        {CITIES_VISUAL.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={c.id === cityId}
            className={`city-spotlight__city ${c.id === cityId ? "city-spotlight__city--active" : ""}`}
            onClick={() => {
              setCityId(c.id);
              saveSpotlightCity(c.name);
            }}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="city-spotlight__track-wrap">
        <div className="city-spotlight__members" aria-label={`Spotlight members in ${city.name}`}>
          {spotlightCards.length > 0 ? (
            spotlightCards.map((profile) => (
              <article key={profile.profileId} className="city-spotlight__card">
                <button
                  type="button"
                  className="city-spotlight__photo"
                  onClick={() => openProfile(profile)}
                  aria-label={`View ${profile.name}'s profile`}
                >
                  <ShowcaseImage src={profile.photo} alt="" loading="lazy" />
                  {isHotPlacement(profile) ? (
                    <span className="city-spotlight__badge-hot">
                      Spotlight
                    </span>
                  ) : null}
                </button>
                <div className="city-spotlight__meta">
                  <h3>
                    {profile.name}
                    {profile.age ? `, ${profile.age}` : ""}
                  </h3>
                  <p className="city-spotlight__city-line">{profile.city}</p>
                  {profile.verified ? (
                    <span className="city-spotlight__verified">
                      <BadgeCheck size={14} aria-hidden />
                      Verified
                    </span>
                  ) : null}
                </div>
              </article>
            ))
          ) : (
            <p className="city-spotlight__empty">Featured members in {city.name} will appear here soon.</p>
          )}
        </div>
      </div>

      {selected ? (
        <ProfileDetailSheet
          profile={selected}
          open
          onClose={() => setSelected(null)}
          onSendSignal={sendSignal}
        />
      ) : null}
    </section>
  );
}
