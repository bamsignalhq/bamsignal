import { SignalConciergeLandingPage as SignalConciergeLanding } from "../../components/signalConcierge/SignalConciergeLandingPage";
import { navigateToPath } from "../../constants/routes";
import {
  signalConciergePathForRoute
} from "../../constants/signalConciergeRoutes";
import { SignalConciergePageShell, type SignalConciergePageShellProps } from "./SignalConciergePageShell";

type SignalConciergeLandingPageProps = Omit<SignalConciergePageShellProps, "children" | "showStatusLink">;

export function SignalConciergeLandingPage(props: SignalConciergeLandingPageProps) {
  const goApply = () => navigateToPath(signalConciergePathForRoute("apply"));
  const goConsultation = () => navigateToPath(signalConciergePathForRoute("consultation"));

  return (
    <SignalConciergePageShell {...props} showStatusLink>
      <SignalConciergeLanding
        onScheduleConsultation={goConsultation}
        onLearnMore={() => {
          const tiers = document.getElementById("sc-tiers-title");
          tiers?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
        onSelectTier={goApply}
      />
    </SignalConciergePageShell>
  );
}
