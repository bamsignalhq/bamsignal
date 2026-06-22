import { BamSignalAcademyPage } from "../../components/bamSignalInstitute/bamSignalAcademy/BamSignalAcademyPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteAcademyPageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteAcademyPage(props: BamSignalInstituteAcademyPageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <BamSignalAcademyPage />
    </BamSignalInstitutePageShell>
  );
}
