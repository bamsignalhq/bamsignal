import { HOME_SECTIONS } from "../../data/homeLanding";

type HomeValuePropsProps = {
  onSignup: () => void;
  onExplore: () => void;
};

export function HomeValueProps({ onSignup, onExplore }: HomeValuePropsProps) {
  return (
    <section className="home-value card-like" id="why-bamsignal">
      <div className="home-value__grid">
        <article>
          <h2>What is BamSignal?</h2>
          <p>
            A Nigerian dating app where connections start with a Signal — intentional, not endless
            swiping.
          </p>
        </article>
        <article>
          <h2>Who is it for?</h2>
          <p>
            Young professionals and real people in Lagos, Abuja, Port Harcourt, and cities across
            Nigeria who want verified, safer matches.
          </p>
        </article>
        <article>
          <h2>Why trust it?</h2>
          <p>{HOME_SECTIONS.trust.lede} Verification, privacy controls, and in-app safety tools.</p>
        </article>
      </div>
      <div className="home-value__cta">
        <button type="button" className="btn-primary" onClick={onSignup}>
          Join BamSignal
        </button>
        <button type="button" className="btn-secondary" onClick={onExplore}>
          Explore Signals
        </button>
      </div>
    </section>
  );
}
