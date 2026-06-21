import { useEffect, useState } from "react";
import { SignalConciergeConsultationPage as SignalConciergeConsultation } from "../../components/signalConcierge/SignalConciergeConsultationPage";
import {
  hasSignalConciergeGatePassed,
  useSignalConciergeBeforeContinue
} from "../../components/signalConcierge/SignalConciergeBeforeContinueModal";
import { navigateToPath } from "../../constants/routes";
import { signalConciergePathForRoute } from "../../constants/signalConciergeRoutes";
import { SignalConciergePageShell, type SignalConciergePageShellProps } from "./SignalConciergePageShell";

type SignalConciergeConsultationPageProps = Omit<SignalConciergePageShellProps, "children" | "showStatusLink">;

export function SignalConciergeConsultationPage(props: SignalConciergeConsultationPageProps) {
  const [unlocked, setUnlocked] = useState(() => hasSignalConciergeGatePassed());
  const { requestGate, modal } = useSignalConciergeBeforeContinue();

  useEffect(() => {
    if (unlocked) return;
    requestGate(() => setUnlocked(true), { force: true });
  }, [requestGate, unlocked]);

  const go = (route: "status" | "apply") => navigateToPath(signalConciergePathForRoute(route));

  if (!unlocked) {
    return <SignalConciergePageShell {...props} showStatusLink>{modal}</SignalConciergePageShell>;
  }

  return (
    <SignalConciergePageShell {...props} showStatusLink>
      <SignalConciergeConsultation
        onScheduled={() => go("status")}
        onApply={() => requestGate(() => go("apply"))}
      />
      {modal}
    </SignalConciergePageShell>
  );
}
