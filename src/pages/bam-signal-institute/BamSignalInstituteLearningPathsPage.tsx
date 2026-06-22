import { LearningPathsPage } from "../../components/bamSignalInstitute/learningPaths/LearningPathsPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteLearningPathsPageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteLearningPathsPage(props: BamSignalInstituteLearningPathsPageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <LearningPathsPage />
    </BamSignalInstitutePageShell>
  );
}
