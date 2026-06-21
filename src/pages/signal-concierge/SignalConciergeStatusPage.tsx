import { SignalConciergeStatusPage as SignalConciergeStatus } from "../../components/signalConcierge/SignalConciergeStatusPage";
import { useSignalConciergeBeforeContinue } from "../../components/signalConcierge/SignalConciergeBeforeContinueModal";
import { navigateToPath } from "../../constants/routes";
import { signalConciergePathForRoute } from "../../constants/signalConciergeRoutes";
import { SignalConciergePageShell, type SignalConciergePageShellProps } from "./SignalConciergePageShell";

type SignalConciergeStatusPageProps = Omit<SignalConciergePageShellProps, "children" | "showStatusLink">;

export function SignalConciergeStatusPage(props: SignalConciergeStatusPageProps) {
  const { requestGate, modal } = useSignalConciergeBeforeContinue();
  const go = (route: "apply" | "consultation") => navigateToPath(signalConciergePathForRoute(route));

  return (
    <SignalConciergePageShell {...props} showStatusLink>
      <SignalConciergeStatus
        onApply={() => requestGate(() => go("apply"))}
        onScheduleConsultation={() => requestGate(() => go("consultation"))}
      />
      {modal}
    </SignalConciergePageShell>
  );
}
