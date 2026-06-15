import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BadgeCheck } from "lucide-react";
import { getMomentPage, momentDisplayTitle, type MomentPageId } from "../data/momentPages";
import { CITIES_VISUAL } from "../data/visualLanding";
import { ProfileDetailSheet } from "../components/ProfileDetailSheet";
import { ShowcaseImage } from "../components/ShowcaseImage";
import { cityVisualId, normalizeCityName, resolveGuestCity, saveSpotlightCity } from "../utils/guestCity";
import { loadMomentProfiles } from "../utils/momentProfiles";
import { navigateToPath } from "../constants/routes";
import type { DiscoverProfile } from "../types";

type MomentPageProps = {
  momentId: MomentPageId;
  onSignup: () => void;
};

export function MomentPage({ momentId, onSignup }: MomentPageProps) {
  const moment = getMomentPage(momentId);
  const [cityName, setCityName] = useState(() => resolveGuestCity());
  const [profiles, setProfiles] = useState<DiscoverProfile[]>([]);
  const [selected, setSelected] = useState<DiscoverProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const cityId = useMemo(() => cityVisualId(cityName), [cityName]);
  const displayTitle = moment ? momentDisplayTitle(moment, cityName) : "";

  useEffect(() => {
    if (!moment) return;
    let cancelled = false;
    setLoading(true);
    void loadMomentProfiles(moment, cityName).then((rows) => {
      if (!cancelled) {
        setProfiles(rows);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [moment, cityName]);

  if (!moment) {
    return (
      <div className="page moment-page">
        <button type="button" className="moment-page__back" onClick={() => navigateToPath("/")}>
          <ArrowLeft size={18} aria-hidden /> Home
        </button>
        <h1>Moment not found</h1>
      </div>
    );
  }

  const pickCity = (name: string) => {
    const normalized = normalizeCityName(name);
    setCityName(normalized);
    saveSpotlightCity(normalized);
  };

  return (
    <div className="page moment-page">
      <button type="button" className="moment-page__back" onClick={() => navigateToPath("/")}>
        <ArrowLeft size={18} aria-hidden /> Home
      </button>

      <section className="moment-page__hero">
        <ShowcaseImage src={moment.heroImage} alt="" className="moment-page__hero-img" loading="eager" />
        <div className="moment-page__hero-shade" />
        <div className="moment-page__hero-copy">
          <p className="moment-page__eyebrow">{moment.eyebrow}</p>
          <h1>{displayTitle}</h1>
          <p className="moment-page__tagline">{moment.tagline}</p>
        </div>
      </section>

      <section className="moment-page__intro card">
        <h2>What this moment is about</h2>
        <p>{moment.description}</p>
        <p className="moment-page__situation">{moment.situation}</p>
      </section>

      <section className="moment-page__city">
        <div className="moment-page__city-head">
          <h2>People near you in {cityName}</h2>
          <p>Profiles shown for your area — not another city.</p>
        </div>
        <div className="moment-page__city-tabs" role="tablist" aria-label="Your city">
          {CITIES_VISUAL.map((city) => (
            <button
              key={city.id}
              type="button"
              role="tab"
              aria-selected={city.id === cityId}
              className={`moment-page__city-tab${city.id === cityId ? " moment-page__city-tab--active" : ""}`}
              onClick={() => pickCity(city.name)}
            >
              {city.name}
            </button>
          ))}
        </div>
      </section>

      <section className="moment-page__profiles">
        {loading ? (
          <p className="moment-page__loading">Loading profiles in {cityName}…</p>
        ) : profiles.length > 0 ? (
          <div className="moment-page__grid">
            {profiles.map((profile) => (
              <article key={profile.id} className="moment-page__card card">
                <button
                  type="button"
                  className="moment-page__photo"
                  onClick={() => setSelected(profile)}
                  aria-label={`View ${profile.name}'s profile`}
                >
                  <ShowcaseImage src={profile.photo} alt="" loading="lazy" />
                </button>
                <div className="moment-page__meta">
                  <h3>
                    {profile.name}, {profile.age}
                  </h3>
                  <p className="moment-page__location">{profile.city}</p>
                  {profile.verified ? (
                    <span className="moment-page__verified">
                      <BadgeCheck size={14} aria-hidden />
                      Verified
                    </span>
                  ) : null}
                  <p className="moment-page__bio">{profile.bio}</p>
                  <button type="button" className="btn-secondary btn-full" onClick={() => setSelected(profile)}>
                    View profile
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="moment-page__empty">No profiles in {cityName} yet. Check back soon or try another city.</p>
        )}
      </section>

      <section className="moment-page__cta card">
        <h2>Ready for this kind of connection?</h2>
        <p>Join BamSignal and send a signal to people nearby.</p>
        <button type="button" className="btn-primary btn-full" onClick={onSignup}>
          Join BamSignal
        </button>
      </section>

      {selected ? (
        <ProfileDetailSheet
          profile={selected}
          open
          onClose={() => setSelected(null)}
          matchReasons={[`Into ${displayTitle}`, `Based in ${selected.city}`]}
          onSendSignal={() => {
            setSelected(null);
            onSignup();
          }}
        />
      ) : null}
    </div>
  );
}
