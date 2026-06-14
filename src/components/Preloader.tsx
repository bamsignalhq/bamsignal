import { BRAND } from "../constants/copy";
import { BRAND_ASSETS } from "../constants/brand";
import { SignalRipple } from "./signals/SignalRipple";

type PreloaderProps = {
  exiting?: boolean;
};

export function Preloader({ exiting = false }: PreloaderProps) {
  return (
    <main className={`preloader ${exiting ? "preloader--exit" : ""}`} aria-label="Loading BamSignal">
      <div className="preloader__gradient" />
      <div className="preloader__core">
        <SignalRipple active />
        <img src={BRAND_ASSETS.logo} alt="" className="preloader__logo" width={112} height={112} />
      </div>
      <h1 className="preloader__title">{BRAND.name}</h1>
      <p className="preloader__tagline">
        {BRAND.tagline.split("\n").map((line, i) => (
          <span key={line}>
            {i > 0 && <br />}
            {line}
          </span>
        ))}
      </p>
    </main>
  );
}

/** @deprecated use Preloader — kept for Capacitor native splash */
export function SplashScreen({ visible = true }: { visible?: boolean }) {
  if (!visible) return null;
  return <Preloader />;
}
