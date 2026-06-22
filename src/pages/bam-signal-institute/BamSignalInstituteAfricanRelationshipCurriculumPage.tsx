import { RelationshipCurriculumPage } from "../../components/bamSignalInstitute/africanRelationshipCurriculum/RelationshipCurriculumPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteAfricanRelationshipCurriculumPageProps = Omit<
  BamSignalInstitutePageShellProps,
  "children"
>;

export function BamSignalInstituteAfricanRelationshipCurriculumPage(
  props: BamSignalInstituteAfricanRelationshipCurriculumPageProps
) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <RelationshipCurriculumPage />
    </BamSignalInstitutePageShell>
  );
}
