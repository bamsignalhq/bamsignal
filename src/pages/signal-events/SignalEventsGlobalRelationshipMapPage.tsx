import { GlobalRelationshipMapPage } from "../../components/signalEvents/globalRelationshipMap/GlobalRelationshipMapPage";
import { SignalEventsPageShell, type SignalEventsPageShellProps } from "./SignalEventsPageShell";

type SignalEventsGlobalRelationshipMapPageProps = Omit<SignalEventsPageShellProps, "children">;

export function SignalEventsGlobalRelationshipMapPage(
  props: SignalEventsGlobalRelationshipMapPageProps
) {
  return (
    <SignalEventsPageShell {...props}>
      <GlobalRelationshipMapPage />
    </SignalEventsPageShell>
  );
}
