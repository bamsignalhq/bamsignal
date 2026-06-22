import { FamilyTablePage } from "../../components/bamSignalInstitute/familyTable/FamilyTablePage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteFamilyTablePageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteFamilyTablePage(props: BamSignalInstituteFamilyTablePageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <FamilyTablePage />
    </BamSignalInstitutePageShell>
  );
}
