import { CareersHiringProcessPage as CareersHiringProcess } from "../../components/careers/CareersHiringProcessPage";
import { CareersPageShell, type CareersPageShellProps } from "./CareersPageShell";

type CareersHiringProcessPageProps = Omit<CareersPageShellProps, "children">;

export function CareersHiringProcessPage(props: CareersHiringProcessPageProps) {
  return (
    <CareersPageShell {...props}>
      <CareersHiringProcess />
    </CareersPageShell>
  );
}
