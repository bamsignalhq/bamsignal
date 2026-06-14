import { useState } from "react";
import { Zap } from "lucide-react";
import { CITIES_VISUAL } from "../../data/visualLanding";
import { HOME_SECTIONS } from "../../data/homeLanding";
import { BamEffect } from "../signals/BamEffect";
import { ShowcaseImage } from "../ShowcaseImage";

type SignalsAroundNigeriaProps = {
  onGuestAction: () => void;
};

export function SignalsAroundNigeria({ onGuestAction }: SignalsAroundNigeriaProps) {
  const [cityId, setCityId] = useState(CITIES_VISUAL[0].id);
  const [firing, setFiring] = useState(false);

  const city = CITIES_VISUAL.find((c) => c.id === cityId) ?? CITIES_VISUAL[0];
  const { cities } = HOME_SECTIONS;

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
          {city.profiles.map((profile, i) => (
            <figure
              key={`${city.id}-${i}`}
              className={`visual-city-photo visual-city-photo--${i + 1}`}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <ShowcaseImage src={profile.photo} alt={profile.alt} />
            </figure>
          ))}
        </div>

        <div className="visual-cities__action">
          <p className="visual-cities__hint">Try it — send a signal in {city.name}</p>
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
