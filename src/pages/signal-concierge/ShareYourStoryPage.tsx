import { SuccessStoryConsentPage as SuccessStoryConsent } from "../../components/signalConcierge/SuccessStoryConsentPage";
import { SignalConciergePageShell, type SignalConciergePageShellProps } from "./SignalConciergePageShell";

type ShareYourStoryPageProps = Omit<SignalConciergePageShellProps, "children" | "showStatusLink">;

export function ShareYourStoryPage(props: ShareYourStoryPageProps) {
  return (
    <SignalConciergePageShell {...props} showStatusLink>
      <SuccessStoryConsent />
    </SignalConciergePageShell>
  );
}
