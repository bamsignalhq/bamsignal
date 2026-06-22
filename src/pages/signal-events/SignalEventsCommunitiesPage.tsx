import { GlobalCommunitiesPage } from "../../components/signalEvents/GlobalCommunitiesPage";
import { SignalEventsPageShell, type SignalEventsPageShellProps } from "./SignalEventsPageShell";

type SignalEventsCommunitiesPageProps = Omit<SignalEventsPageShellProps, "children">;

export function SignalEventsCommunitiesPage(props: SignalEventsCommunitiesPageProps) {
  return (
    <SignalEventsPageShell {...props}>
      <GlobalCommunitiesPage />
    </SignalEventsPageShell>
  );
}
