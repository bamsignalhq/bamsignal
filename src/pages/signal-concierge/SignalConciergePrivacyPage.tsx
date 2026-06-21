import { SIGNAL_CONCIERGE_BRAND } from "../../constants/signalConcierge";
import { SignalConciergePrivacySection } from "../../components/signalConcierge/SignalConciergePrivacySection";
import { SignalConciergePageShell, type SignalConciergePageShellProps } from "./SignalConciergePageShell";

type SignalConciergePrivacyPageProps = Omit<SignalConciergePageShellProps, "children" | "showStatusLink">;

export function SignalConciergePrivacyPage(props: SignalConciergePrivacyPageProps) {
  return (
    <SignalConciergePageShell {...props}>
      <section className="signal-concierge-hero">
        <h1>{SIGNAL_CONCIERGE_BRAND}</h1>
        <p>Human-led matchmaking. Private by design.</p>
      </section>
      <SignalConciergePrivacySection />
    </SignalConciergePageShell>
  );
}
