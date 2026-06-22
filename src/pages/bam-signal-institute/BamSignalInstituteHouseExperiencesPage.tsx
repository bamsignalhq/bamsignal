import { HouseExperiencesPage } from "../../components/bamSignalInstitute/houseExperiences/HouseExperiencesPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteHouseExperiencesPageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteHouseExperiencesPage(props: BamSignalInstituteHouseExperiencesPageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <HouseExperiencesPage />
    </BamSignalInstitutePageShell>
  );
}
