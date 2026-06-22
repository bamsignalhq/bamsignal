import { DiasporaCorridorsPage } from "../../components/signalEvents/diasporaCorridors/DiasporaCorridorsPage";
import { SignalEventsPageShell, type SignalEventsPageShellProps } from "./SignalEventsPageShell";

type SignalEventsDiasporaCorridorsPageProps = Omit<SignalEventsPageShellProps, "children">;

export function SignalEventsDiasporaCorridorsPage(props: SignalEventsDiasporaCorridorsPageProps) {
  return (
    <SignalEventsPageShell {...props}>
      <DiasporaCorridorsPage />
    </SignalEventsPageShell>
  );
}
