import { GlobalCommunityRankingsPage } from "../../components/signalEvents/globalCommunityRankings/GlobalCommunityRankingsPage";
import { SignalEventsPageShell, type SignalEventsPageShellProps } from "./SignalEventsPageShell";

type SignalEventsCommunityJourneyPageProps = Omit<SignalEventsPageShellProps, "children">;

export function SignalEventsCommunityJourneyPage(props: SignalEventsCommunityJourneyPageProps) {
  return (
    <SignalEventsPageShell {...props}>
      <GlobalCommunityRankingsPage />
    </SignalEventsPageShell>
  );
}
