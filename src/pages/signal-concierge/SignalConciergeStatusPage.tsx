import { SignalConciergeStatusPage as SignalConciergeStatus } from "../../components/signalConcierge/SignalConciergeStatusPage";
import { navigateToPath } from "../../constants/routes";
import { signalConciergePathForRoute } from "../../constants/signalConciergeRoutes";
import { SignalConciergePageShell, type SignalConciergePageShellProps } from "./SignalConciergePageShell";

type SignalConciergeStatusPageProps = Omit<SignalConciergePageShellProps, "children" | "showStatusLink">;

export function SignalConciergeStatusPage(props: SignalConciergeStatusPageProps) {
  const go = (route: "apply" | "consultation") => navigateToPath(signalConciergePathForRoute(route));

  return (
    <SignalConciergePageShell {...props} showStatusLink>
      <SignalConciergeStatus onApply={() => go("apply")} onScheduleConsultation={() => go("consultation")} />
    </SignalConciergePageShell>
  );
}
