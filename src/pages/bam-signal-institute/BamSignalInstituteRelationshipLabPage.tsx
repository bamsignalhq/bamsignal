import { RelationshipLabPage } from "../../components/bamSignalInstitute/relationshipLab/RelationshipLabPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteRelationshipLabPageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteRelationshipLabPage(props: BamSignalInstituteRelationshipLabPageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <RelationshipLabPage />
    </BamSignalInstitutePageShell>
  );
}
