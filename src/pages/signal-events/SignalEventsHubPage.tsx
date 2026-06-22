import { SignalEventsPage as SignalEventsHub } from "../../components/signalEvents/SignalEventsPage";
import { SignalEventsPageShell, type SignalEventsPageShellProps } from "./SignalEventsPageShell";

type SignalEventsHubPageProps = Omit<SignalEventsPageShellProps, "children">;

export function SignalEventsHubPage(props: SignalEventsHubPageProps) {
  return (
    <SignalEventsPageShell {...props}>
      <SignalEventsHub />
    </SignalEventsPageShell>
  );
}
