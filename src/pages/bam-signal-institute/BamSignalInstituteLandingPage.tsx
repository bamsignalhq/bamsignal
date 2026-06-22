import { BamSignalInstitutePage } from "../../components/bamSignalInstitute/BamSignalInstitutePage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteLandingPageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteLandingPage(props: BamSignalInstituteLandingPageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <BamSignalInstitutePage />
    </BamSignalInstitutePageShell>
  );
}
