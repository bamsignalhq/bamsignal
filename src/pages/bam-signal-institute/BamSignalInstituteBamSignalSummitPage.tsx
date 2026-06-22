import { BamSignalSummitPage } from "../../components/bamSignalInstitute/bamSignalSummit/BamSignalSummitPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteBamSignalSummitPageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteBamSignalSummitPage(props: BamSignalInstituteBamSignalSummitPageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <BamSignalSummitPage />
    </BamSignalInstitutePageShell>
  );
}
