import { BamSignalHonorsPage } from "../../components/bamSignalInstitute/bamSignalHonors/BamSignalHonorsPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteBamSignalHonorsPageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteBamSignalHonorsPage(props: BamSignalInstituteBamSignalHonorsPageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <BamSignalHonorsPage />
    </BamSignalInstitutePageShell>
  );
}
