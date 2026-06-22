import { HouseInstitutePage } from "../../components/bamSignalInstitute/houseInstitute/HouseInstitutePage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteHouseInstitutePageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteHouseInstitutePage(props: BamSignalInstituteHouseInstitutePageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <HouseInstitutePage />
    </BamSignalInstitutePageShell>
  );
}
