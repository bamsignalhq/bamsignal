import { SignalConciergeConsultationPage as SignalConciergeConsultation } from "../../components/signalConcierge/SignalConciergeConsultationPage";
import { navigateToPath } from "../../constants/routes";
import { signalConciergePathForRoute } from "../../constants/signalConciergeRoutes";
import { SignalConciergePageShell, type SignalConciergePageShellProps } from "./SignalConciergePageShell";

type SignalConciergeConsultationPageProps = Omit<SignalConciergePageShellProps, "children" | "showStatusLink">;

export function SignalConciergeConsultationPage(props: SignalConciergeConsultationPageProps) {
  const go = (route: "status" | "apply") => navigateToPath(signalConciergePathForRoute(route));

  return (
    <SignalConciergePageShell {...props} showStatusLink>
      <SignalConciergeConsultation onScheduled={() => go("status")} onApply={() => go("apply")} />
    </SignalConciergePageShell>
  );
}
