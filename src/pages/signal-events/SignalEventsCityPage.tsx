import { CityEventsPage as CityEvents } from "../../components/signalEvents/CityEventsPage";
import { SignalEventsPageShell, type SignalEventsPageShellProps } from "./SignalEventsPageShell";

type SignalEventsCityPageProps = Omit<SignalEventsPageShellProps, "children"> & {
  citySlug: string;
};

export function SignalEventsCityPage({ citySlug, ...props }: SignalEventsCityPageProps) {
  return (
    <SignalEventsPageShell {...props}>
      <CityEvents citySlug={citySlug} />
    </SignalEventsPageShell>
  );
}
