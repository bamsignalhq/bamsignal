import { CareersLandingPage as CareersLanding } from "../../components/careers/CareersLandingPage";
import { CareersPageShell, type CareersPageShellProps } from "./CareersPageShell";

type CareersLandingPageProps = Omit<CareersPageShellProps, "children">;

export function CareersLandingPage(props: CareersLandingPageProps) {
  return (
    <CareersPageShell {...props}>
      <CareersLanding />
    </CareersPageShell>
  );
}
