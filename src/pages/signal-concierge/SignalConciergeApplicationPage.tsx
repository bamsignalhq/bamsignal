import { useEffect, useState } from "react";
import { SignalConciergeApplicationWizard } from "../../components/signalConcierge/SignalConciergeApplicationWizard";
import {
  hasSignalConciergeGatePassed,
  useSignalConciergeBeforeContinue
} from "../../components/signalConcierge/SignalConciergeBeforeContinueModal";
import { navigateToPath } from "../../constants/routes";
import { signalConciergePathForRoute } from "../../constants/signalConciergeRoutes";
import { SignalConciergePageShell, type SignalConciergePageShellProps } from "./SignalConciergePageShell";

type SignalConciergeApplicationPageProps = Omit<SignalConciergePageShellProps, "children" | "showStatusLink">;

export function SignalConciergeApplicationPage(props: SignalConciergeApplicationPageProps) {
  const [unlocked, setUnlocked] = useState(() => hasSignalConciergeGatePassed());
  const { requestGate, modal } = useSignalConciergeBeforeContinue();

  useEffect(() => {
    if (unlocked) return;
    requestGate(() => setUnlocked(true), { force: true });
  }, [requestGate, unlocked]);

  const go = (route: "status" | "consultation") => navigateToPath(signalConciergePathForRoute(route));

  if (!unlocked) {
    return <SignalConciergePageShell {...props} showStatusLink>{modal}</SignalConciergePageShell>;
  }

  return (
    <SignalConciergePageShell {...props} showStatusLink>
      <SignalConciergeApplicationWizard
        onSubmitted={() => go("status")}
        onScheduleConsultation={() => requestGate(() => go("consultation"))}
        onResumeLater={() => navigateToPath(signalConciergePathForRoute("landing"))}
      />
      {modal}
    </SignalConciergePageShell>
  );
}
