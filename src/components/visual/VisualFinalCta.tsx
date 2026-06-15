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
    <section className="visual-final visual-final--premium visual-final--simple">
      <ShowcaseImage className="visual-final__bg" src={FINAL_CTA_IMAGE} alt="" />
      <div className="visual-final__shade" />
      <div className="visual-final__content visual-final__content--spaced">
        <h2>{final.headline}</h2>
        <button type="button" className="visual-btn visual-btn--light" onClick={onSignup}>
          {final.cta}
          <ArrowRight size={18} aria-hidden />
        </button>
      </div>
    </section>
  );
}
