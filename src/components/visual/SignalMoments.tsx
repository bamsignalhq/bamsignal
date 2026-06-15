import { navigateToPath } from "../../constants/routes";
import { SIGNAL_MOMENTS } from "../../data/visualLanding";
import { HOME_SECTIONS } from "../../data/homeLanding";
import { ShowcaseImage } from "../ShowcaseImage";

export function SignalMoments() {
  const { moments } = HOME_SECTIONS;

  return (
    <section className="home-section visual-moments">
      <header className="home-section__head">
        <p className="home-section__eyebrow">{moments.eyebrow}</p>
        <h2 className="home-section__title">{moments.title}</h2>
        <p className="home-section__lede">{moments.lede}</p>
      </header>

      <div className="visual-moments__track">
        {SIGNAL_MOMENTS.map((moment) => (
          <article key={moment.id} className="visual-moment-card">
            <button
              type="button"
              className="visual-moment-card__hit"
              onClick={() => navigateToPath(`/moments/${moment.id}`)}
              aria-label={`Explore ${moment.title}`}
            >
              <ShowcaseImage src={moment.image} alt="" loading="lazy" />
              <div className="visual-moment-card__shade" />
              <div className="visual-moment-card__label">
                <h3>{moment.title}</h3>
                <p>{moment.tagline}</p>
              </div>
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
