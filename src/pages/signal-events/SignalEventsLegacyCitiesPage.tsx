import { LegacyCitiesPage } from "../../components/signalEvents/legacyCities/LegacyCitiesPage";
import { SignalEventsPageShell, type SignalEventsPageShellProps } from "./SignalEventsPageShell";

type SignalEventsLegacyCitiesPageProps = Omit<SignalEventsPageShellProps, "children">;

export function SignalEventsLegacyCitiesPage(props: SignalEventsLegacyCitiesPageProps) {
  return (
    <SignalEventsPageShell {...props}>
      <LegacyCitiesPage />
    </SignalEventsPageShell>
  );
}
