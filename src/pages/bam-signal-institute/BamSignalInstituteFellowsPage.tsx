import { FellowsPage } from "../../components/bamSignalInstitute/bamSignalFellows/FellowsPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteFellowsPageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteFellowsPage(props: BamSignalInstituteFellowsPageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <FellowsPage />
    </BamSignalInstitutePageShell>
  );
}
