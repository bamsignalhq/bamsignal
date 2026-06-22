import { SupportCenterLandingPage as SupportLanding } from "../../components/supportCenter/SupportCenterLandingPage";
import { SupportCenterPageShell, type SupportCenterPageShellProps } from "./SupportCenterPageShell";

type SupportCenterLandingPageProps = Omit<SupportCenterPageShellProps, "children">;

export function SupportCenterLandingPage(props: SupportCenterLandingPageProps) {
  return (
    <SupportCenterPageShell {...props}>
      <SupportLanding />
    </SupportCenterPageShell>
  );
}
