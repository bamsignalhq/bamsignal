import { CityAmbassadorsPage } from "../../components/signalEvents/cityAmbassadors/CityAmbassadorsPage";
import { SignalEventsPageShell, type SignalEventsPageShellProps } from "./SignalEventsPageShell";

type SignalEventsCityAmbassadorsPageProps = Omit<SignalEventsPageShellProps, "children">;

export function SignalEventsCityAmbassadorsPage(props: SignalEventsCityAmbassadorsPageProps) {
  return (
    <SignalEventsPageShell {...props}>
      <CityAmbassadorsPage />
    </SignalEventsPageShell>
  );
}
