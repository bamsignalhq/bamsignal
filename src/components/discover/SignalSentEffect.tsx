import { AppLogo } from "../AppLogo";
import { BRAND } from "../../constants/copy";

type SignalSentEffectProps = {
  active: boolean;
};

export function SignalSentEffect({ active }: SignalSentEffectProps) {
  if (!active) return null;

  return (
    <div className="signal-sent-effect" aria-hidden>
      <div className="signal-sent-effect__ripple" />
      <div className="signal-sent-effect__ripple signal-sent-effect__ripple--delay" />
      <div className="signal-sent-effect__logo">
        <AppLogo size="sm" showText={false} />
      </div>
      <p className="signal-sent-effect__text">{BRAND.signalSent}</p>
      <p className="signal-sent-effect__sub">{BRAND.signalSentSub}</p>
    </div>
  );
}
