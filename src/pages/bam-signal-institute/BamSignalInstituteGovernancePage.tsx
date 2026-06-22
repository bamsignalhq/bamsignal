import { GovernanceFrameworkPage } from "../../components/bamSignalInstitute/governance/GovernanceFrameworkPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteGovernancePageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteGovernancePage(props: BamSignalInstituteGovernancePageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <GovernanceFrameworkPage />
    </BamSignalInstitutePageShell>
  );
}
