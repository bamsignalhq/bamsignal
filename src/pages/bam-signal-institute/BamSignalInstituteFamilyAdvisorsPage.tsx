import { FamilyAdvisorPage } from "../../components/bamSignalInstitute/familyAdvisors/FamilyAdvisorPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteFamilyAdvisorsPageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteFamilyAdvisorsPage(props: BamSignalInstituteFamilyAdvisorsPageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <FamilyAdvisorPage />
    </BamSignalInstitutePageShell>
  );
}
