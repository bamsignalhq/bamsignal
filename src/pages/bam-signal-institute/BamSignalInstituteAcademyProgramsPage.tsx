import { AcademyProgramsPage } from "../../components/bamSignalInstitute/bamSignalAcademy/AcademyProgramsPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteAcademyProgramsPageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteAcademyProgramsPage(props: BamSignalInstituteAcademyProgramsPageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <AcademyProgramsPage />
    </BamSignalInstitutePageShell>
  );
}
