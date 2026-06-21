import { SignalConciergeApplicationWizard } from "../../components/signalConcierge/SignalConciergeApplicationWizard";
import { navigateToPath } from "../../constants/routes";
import { signalConciergePathForRoute } from "../../constants/signalConciergeRoutes";
import { SignalConciergePageShell, type SignalConciergePageShellProps } from "./SignalConciergePageShell";

type SignalConciergeApplicationPageProps = Omit<SignalConciergePageShellProps, "children" | "showStatusLink">;

export function SignalConciergeApplicationPage(props: SignalConciergeApplicationPageProps) {
  const go = (route: "status" | "consultation") => navigateToPath(signalConciergePathForRoute(route));

  return (
    <SignalConciergePageShell {...props} showStatusLink>
      <SignalConciergeApplicationWizard
        onSubmitted={() => go("status")}
        onScheduleConsultation={() => go("consultation")}
      />
    </SignalConciergePageShell>
  );
}
