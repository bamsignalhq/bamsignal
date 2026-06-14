import { PREMIUM_VISUAL } from "../../data/visualLanding";
import { ShowcaseImage } from "../ShowcaseImage";

type PremiumVisualProps = {
  onUnlock: () => void;
};

export function PremiumVisual({ onUnlock }: PremiumVisualProps) {
  return (
    <section className="visual-premium">
      <div className="visual-premium__grid">
        {PREMIUM_VISUAL.map((item) => (
          <button key={item.id} type="button" className="visual-premium-card" onClick={onUnlock}>
            <ShowcaseImage src={item.image} alt={item.label} />
            <div className="visual-premium-card__shade" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
