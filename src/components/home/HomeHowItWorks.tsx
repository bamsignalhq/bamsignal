import { HOME_HOW_STEPS, HOME_SECTIONS } from "../../data/homeLanding";

type HomeHowItWorksProps = {
  onGetStarted: () => void;
};

export function HomeHowItWorks({ onGetStarted }: HomeHowItWorksProps) {
  return (
    <section className="home-section home-how" id="how-it-works">
      <header className="home-section__head">
        <p className="home-section__eyebrow">{HOME_SECTIONS.how.eyebrow}</p>
        <h2 className="home-section__title">{HOME_SECTIONS.how.title}</h2>
        <p className="home-section__lede">{HOME_SECTIONS.how.lede}</p>
      </header>

      <ol className="home-how__steps">
        {HOME_HOW_STEPS.map((step) => (
          <li key={step.step} className="home-how__step">
            <span className="home-how__num">{step.step}</span>
            <div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="home-how__cta">
        <button type="button" className="visual-btn visual-btn--primary" onClick={onGetStarted}>
          Create your profile
        </button>
      </div>
    </section>
  );
}
