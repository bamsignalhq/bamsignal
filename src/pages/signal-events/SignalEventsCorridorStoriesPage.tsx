import { CorridorStoriesPage } from "../../components/signalEvents/corridorStories/CorridorStoriesPage";
import { SignalEventsPageShell, type SignalEventsPageShellProps } from "./SignalEventsPageShell";

type SignalEventsCorridorStoriesPageProps = Omit<SignalEventsPageShellProps, "children">;

export function SignalEventsCorridorStoriesPage(props: SignalEventsCorridorStoriesPageProps) {
  return (
    <SignalEventsPageShell {...props}>
      <CorridorStoriesPage />
    </SignalEventsPageShell>
  );
}
