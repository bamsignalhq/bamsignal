import { SIGNAL_CONCIERGE_BRAND } from "../../constants/signalConcierge";
import { SignalConciergeFAQ } from "../../components/signalConcierge/SignalConciergeFAQ";
import { SignalConciergePageShell, type SignalConciergePageShellProps } from "./SignalConciergePageShell";

type SignalConciergeFaqPageProps = Omit<SignalConciergePageShellProps, "children" | "showStatusLink">;

export function SignalConciergeFaqPage(props: SignalConciergeFaqPageProps) {
  return (
    <SignalConciergePageShell {...props}>
      <section className="signal-concierge-hero">
        <h1>{SIGNAL_CONCIERGE_BRAND}</h1>
        <p>Human-led matchmaking. Private by design.</p>
      </section>
      <SignalConciergeFAQ />
    </SignalConciergePageShell>
  );
}
