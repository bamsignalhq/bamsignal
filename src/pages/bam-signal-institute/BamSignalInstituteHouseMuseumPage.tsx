import { HouseMuseumPage } from "../../components/bamSignalInstitute/houseMuseum/HouseMuseumPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteHouseMuseumPageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteHouseMuseumPage(props: BamSignalInstituteHouseMuseumPageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <HouseMuseumPage />
    </BamSignalInstitutePageShell>
  );
}
