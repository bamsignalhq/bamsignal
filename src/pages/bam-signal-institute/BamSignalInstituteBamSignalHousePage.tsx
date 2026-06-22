import { BamSignalHousePage } from "../../components/bamSignalInstitute/bamSignalHouse/BamSignalHousePage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteBamSignalHousePageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteBamSignalHousePage(props: BamSignalInstituteBamSignalHousePageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <BamSignalHousePage />
    </BamSignalInstitutePageShell>
  );
}
