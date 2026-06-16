import { useEffect, useMemo, useState } from "react";
import { Zap } from "lucide-react";
import { CITIES_VISUAL } from "../../data/visualLanding";
import { HOME_SECTIONS } from "../../data/homeLanding";
import { BamEffect } from "../signals/BamEffect";
import { ShowcaseImage } from "../ShowcaseImage";
import { fetchCityHomeProfiles, type CityHomeProfile } from "../../services/cityHome";

type SignalsAroundNigeriaProps = {
  onGuestAction: () => void;
};

type DisplayProfile = {
  photo: string;
  alt: string;
  placementType?: CityHomeProfile["placementType"];
};

function mergeProfiles(
  live: CityHomeProfile[],
  fallback: { photo: string; alt: string }[]
): DisplayProfile[] {
  const fromLive: DisplayProfile[] = live.map((profile) => ({
    photo: profile.photo || fallback[0]?.photo || "",
    alt: profile.name ? `${profile.name} in ${profile.city}` : profile.city,
    placementType: profile.placementType
  }));

  if (fromLive.length >= 3) return fromLive.slice(0, 3);

  const used = new Set(fromLive.map((p) => p.photo));
  for (const item of fallback) {
    if (fromLive.length >= 3) break;
    if (used.has(item.photo)) continue;
    fromLive.push(item);
    used.add(item.photo);
  }

  return fromLive.slice(0, 3);
}

export function SignalsAroundNigeria({ onGuestAction }: SignalsAroundNigeriaProps) {
  const [cityId, setCityId] = useState(CITIES_VISUAL[0].id);
  const [firing, setFiring] = useState(false);
  const [liveProfiles, setLiveProfiles] = useState<CityHomeProfile[]>([]);

  const city = CITIES_VISUAL.find((c) => c.id === cityId) ?? CITIES_VISUAL[0];
  const { cities } = HOME_SECTIONS;

  useEffect(() => {
    let cancelled = false;
    void fetchCityHomeProfiles(city.name, 6).then((profiles) => {
      if (!cancelled) setLiveProfiles(profiles);
    });
    return () => {
      cancelled = true;
    };
  }, [city.name]);

  const displayProfiles = useMemo(
    () => mergeProfiles(liveProfiles, city.profiles),
    [liveProfiles, city.profiles]
  );

  const sendSignal = () => {
    if (firing) return;
    setFiring(true);
    window.setTimeout(() => {
      setFiring(false);
      onGuestAction();
    }, 1100);
  };

  return (
    <section className="home-section visual-cities" id="signals-nigeria">
      <header className="home-section__head">
        <p className="home-section__eyebrow">{cities.eyebrow}</p>
        <h2 className="home-section__title">{cities.title}</h2>
        <p className="home-section__lede">{cities.lede}</p>
      </header>

      <div className="visual-cities__cards" role="tablist" aria-label="Nigerian cities">
        {CITIES_VISUAL.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={c.id === cityId}
            className={`visual-city-card ${c.id === cityId ? "visual-city-card--active" : ""}`}
            onClick={() => setCityId(c.id)}
          >
            <span className="visual-city-card__pin">{c.name}</span>
            <span className="visual-city-card__tagline">{c.tagline}</span>
          </button>
        ))}
      </div>

      <div className="visual-cities__stage">
        <div className="visual-cities__photos">
          {displayProfiles.map((profile, i) => (
            <figure
              key={`${city.id}-${profile.photo}-${i}`}
              className={`visual-city-photo visual-city-photo--${i + 1}`}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <ShowcaseImage src={profile.photo} alt={profile.alt} />
              {profile.placementType && profile.placementType !== "auto" && (
                <figcaption className="visual-city-photo__badge">
                  {profile.placementType === "featured"
                    ? "Featured"
                    : profile.placementType === "hot"
                      ? "Spotlight"
                      : profile.placementType === "boost"
                        ? "Boost"
                        : "Spotlight"}
                </figcaption>
              )}
            </figure>
          ))}
        </div>

        <div className="visual-cities__action">
          <p className="visual-cities__hint">
            {liveProfiles.length > 0
              ? `${liveProfiles.length} live profile${liveProfiles.length === 1 ? "" : "s"} in ${city.name}`
              : `Try it — send a signal in ${city.name}`}
          </p>
          <button type="button" className="visual-btn visual-btn--signal" onClick={sendSignal} disabled={firing}>
            <Zap size={18} fill="currentColor" />
            Send Signal
          </button>
        </div>
        <BamEffect active={firing} variant="send" />
      </div>
    </section>
  );
}
