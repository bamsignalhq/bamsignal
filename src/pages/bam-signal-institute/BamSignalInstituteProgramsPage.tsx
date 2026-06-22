import { ResearchProgramsPage } from "../../components/bamSignalInstitute/ResearchProgramsPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteProgramsPageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteProgramsPage(props: BamSignalInstituteProgramsPageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <ResearchProgramsPage />
    </BamSignalInstitutePageShell>
  );
}
