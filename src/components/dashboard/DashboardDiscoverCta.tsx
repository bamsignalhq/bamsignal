import { Compass } from "lucide-react";
import { SHOWCASE } from "../../constants/showcase";

type DashboardDiscoverCtaProps = {
  onDiscover: () => void;
};

export function DashboardDiscoverCta({ onDiscover }: DashboardDiscoverCtaProps) {
  return (
    <section className="dash-discover dash-animate">
      <button type="button" className="dash-discover__hit" onClick={onDiscover}>
        <img src={SHOWCASE.hero} alt="" className="dash-discover__img" />
        <div className="dash-discover__shade" />
        <div className="dash-discover__content">
          <h2>Discover People Nearby</h2>
          <p className="dash-discover__lede">Meet people who match your vibe.</p>
          <span className="btn-primary dash-discover__btn">
            <Compass size={18} aria-hidden />
            Open Discover
          </span>
        </div>
      </button>
    </section>
  );
}
