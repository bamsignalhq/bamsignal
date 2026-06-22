import { StudioPage } from "../../components/bamSignalInstitute/bamSignalStudio/StudioPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteBamSignalStudioPageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteBamSignalStudioPage(props: BamSignalInstituteBamSignalStudioPageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <StudioPage />
    </BamSignalInstitutePageShell>
  );
}
