import { ChevronRight } from "lucide-react";
import { usePremiumCheckout } from "../../context/PremiumCheckoutContext";

export type SignalPassInlineVariant = "signals" | "visibility";

type SignalPassInlineChipProps = {
  variant?: SignalPassInlineVariant;
  onUpgrade?: () => void;
  className?: string;
};

const COPY: Record<SignalPassInlineVariant, { lead: string; cta: string }> = {
  signals: { lead: "Need more Signals?", cta: "Signal Pass" },
  visibility: { lead: "Need more visibility?", cta: "Signal Pass" }
};

export function SignalPassInlineChip({
  variant = "signals",
  onUpgrade,
  className = ""
}: SignalPassInlineChipProps) {
  const checkout = usePremiumCheckout();
  const { lead, cta } = COPY[variant];

  const handleClick = () => {
    if (checkout.busy) return;
    if (onUpgrade) {
      onUpgrade();
      return;
    }
    checkout.startPremiumCheckout();
  };

  return (
    <button
      type="button"
      className={`signal-pass-inline ${className}`.trim()}
      onClick={handleClick}
      disabled={checkout.busy}
      aria-busy={checkout.busy}
      aria-label={`${lead} ${cta}`}
    >
      <span className="signal-pass-inline__lead">{lead}</span>
      <span className="signal-pass-inline__cta">
        {checkout.busy ? checkout.label : cta}
        <ChevronRight size={14} aria-hidden />
      </span>
    </button>
  );
}
