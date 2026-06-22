import { MemberJourneyDashboard } from "../../components/signalConcierge/MemberJourneyDashboard";
import { useSignalConciergeBeforeContinue } from "../../components/signalConcierge/SignalConciergeBeforeContinueModal";
import { navigateToPath } from "../../constants/routes";
import { signalConciergePathForRoute } from "../../constants/signalConciergeRoutes";
import { SignalConciergePageShell, type SignalConciergePageShellProps } from "./SignalConciergePageShell";

type SignalConciergeDashboardPageProps = Omit<
  SignalConciergePageShellProps,
  "children" | "showStatusLink" | "showDashboardLink"
>;

export function SignalConciergeDashboardPage(props: SignalConciergeDashboardPageProps) {
  const { requestGate, modal } = useSignalConciergeBeforeContinue();
  const go = (route: "apply" | "consultation") => navigateToPath(signalConciergePathForRoute(route));

  return (
    <SignalConciergePageShell {...props} showDashboardLink>
      <MemberJourneyDashboard
        onApply={() => requestGate(() => go("apply"))}
        onScheduleConsultation={() => requestGate(() => go("consultation"))}
      />
      {modal}
    </SignalConciergePageShell>
  );
}
