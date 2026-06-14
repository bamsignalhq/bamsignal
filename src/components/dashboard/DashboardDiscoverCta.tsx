import { Compass } from "lucide-react";
import { MOMENT_SETS } from "../../constants/showcase";

type DashboardDiscoverCtaProps = {
  onDiscover: () => void;
};

export function DashboardDiscoverCta({ onDiscover }: DashboardDiscoverCtaProps) {
  return (
    <section className="dash-discover dash-animate">
      <button type="button" className="dash-discover__hit" onClick={onDiscover}>
        <img src={MOMENT_SETS.lagosRooftop[2]} alt="" className="dash-discover__img" />
        <div className="dash-discover__shade" />
        <div className="dash-discover__content">
          <p className="dash-discover__eyebrow">Discover</p>
          <h2>New signals are waiting.</h2>
          <span className="btn-primary dash-discover__btn">
            <Compass size={18} />
            Start Discovering
          </span>
        </div>
      </button>
    </section>
  );
}
