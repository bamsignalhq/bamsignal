import { ArrowRight } from "lucide-react";
import { FINAL_CTA_IMAGE } from "../../data/visualLanding";
import { HOME_SECTIONS } from "../../data/homeLanding";
import { ShowcaseImage } from "../ShowcaseImage";

type VisualFinalCtaProps = {
  onSignup: () => void;
};

export function VisualFinalCta({ onSignup }: VisualFinalCtaProps) {
  const { final } = HOME_SECTIONS;

  return (
    <section className="visual-final visual-final--premium">
      <ShowcaseImage className="visual-final__bg" src={FINAL_CTA_IMAGE} alt="" />
      <div className="visual-final__shade" />
      <div className="visual-final__content">
        <p className="home-section__eyebrow home-section__eyebrow--light">{final.eyebrow}</p>
        <h2>{final.headline}</h2>
        <p className="visual-final__sub">{final.sub}</p>
        <button type="button" className="visual-btn visual-btn--light" onClick={onSignup}>
          Create free profile
          <ArrowRight size={18} aria-hidden />
        </button>
      </div>
    </section>
  );
}
