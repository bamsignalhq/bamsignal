import { HouseAcademyPage } from "../../components/bamSignalInstitute/houseAcademy/HouseAcademyPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteHouseAcademyPageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteHouseAcademyPage(props: BamSignalInstituteHouseAcademyPageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <HouseAcademyPage />
    </BamSignalInstitutePageShell>
  );
}
