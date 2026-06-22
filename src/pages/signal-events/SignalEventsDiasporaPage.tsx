import { DiasporaCitiesPage } from "../../components/signalEvents/DiasporaCitiesPage";
import { SignalEventsPageShell, type SignalEventsPageShellProps } from "./SignalEventsPageShell";

type SignalEventsDiasporaPageProps = Omit<SignalEventsPageShellProps, "children">;

export function SignalEventsDiasporaPage(props: SignalEventsDiasporaPageProps) {
  return (
    <SignalEventsPageShell {...props}>
      <DiasporaCitiesPage />
    </SignalEventsPageShell>
  );
}
