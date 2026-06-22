import { HouseResidenciesPage } from "../../components/bamSignalInstitute/houseResidencies/HouseResidenciesPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteHouseResidenciesPageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteHouseResidenciesPage(props: BamSignalInstituteHouseResidenciesPageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <HouseResidenciesPage />
    </BamSignalInstitutePageShell>
  );
}
