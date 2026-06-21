import { SIGNAL_CONCIERGE_BRAND } from "../../constants/signalConcierge";
import { SignalConciergeConfidentiality } from "../../components/signalConcierge/SignalConciergeConfidentiality";
import { SignalConciergePageShell, type SignalConciergePageShellProps } from "./SignalConciergePageShell";

type SignalConciergePrivacyPageProps = Omit<SignalConciergePageShellProps, "children" | "showStatusLink">;

export function SignalConciergePrivacyPage(props: SignalConciergePrivacyPageProps) {
  return (
    <SignalConciergePageShell {...props}>
      <section className="sc-hero sc-hero--compact" aria-labelledby="sc-privacy-page-title">
        <h1 id="sc-privacy-page-title" className="sc-hero__title">
          {SIGNAL_CONCIERGE_BRAND}
        </h1>
        <p className="sc-hero__subtext">Human-led matchmaking. Private by design.</p>
      </section>
      <SignalConciergeConfidentiality />
    </SignalConciergePageShell>
  );
}
