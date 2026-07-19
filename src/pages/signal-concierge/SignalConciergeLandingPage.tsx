import { SignalConciergeLandingPage as SignalConciergeLanding } from "../../components/signalConcierge/SignalConciergeLandingPage";
import { navigateToPath } from "../../constants/routes";
import { signalConciergePathForRoute } from "../../constants/signalConciergeRoutes";
import { SignalConciergePageShell, type SignalConciergePageShellProps } from "./SignalConciergePageShell";

type SignalConciergeLandingPageProps = Omit<SignalConciergePageShellProps, "children" | "showStatusLink">;

export function SignalConciergeLandingPage(props: SignalConciergeLandingPageProps) {
  return (
    <SignalConciergePageShell {...props} showStatusLink>
      <SignalConciergeLanding
        onApply={() => navigateToPath(signalConciergePathForRoute("apply"))}
        onSignIn={() => navigateToPath(signalConciergePathForRoute("signIn"))}
        onLearnMore={() => {
          document.getElementById("sc-how-title")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      />
    </SignalConciergePageShell>
  );
}
