import { CareersOurValuesPage as CareersOurValues } from "../../components/careers/CareersOurValuesPage";
import { CareersPageShell, type CareersPageShellProps } from "./CareersPageShell";

type CareersOurValuesPageProps = Omit<CareersPageShellProps, "children">;

export function CareersOurValuesPage(props: CareersOurValuesPageProps) {
  return (
    <CareersPageShell {...props}>
      <CareersOurValues />
    </CareersPageShell>
  );
}
