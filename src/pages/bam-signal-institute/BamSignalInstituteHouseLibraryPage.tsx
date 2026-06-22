import { HouseLibraryPage } from "../../components/bamSignalInstitute/houseLibrary/HouseLibraryPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteHouseLibraryPageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteHouseLibraryPage(props: BamSignalInstituteHouseLibraryPageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <HouseLibraryPage />
    </BamSignalInstitutePageShell>
  );
}
