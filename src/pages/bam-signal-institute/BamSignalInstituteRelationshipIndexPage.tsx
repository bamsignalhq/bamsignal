import { RelationshipIndexPage } from "../../components/bamSignalInstitute/relationshipIndex/RelationshipIndexPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteRelationshipIndexPageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteRelationshipIndexPage(props: BamSignalInstituteRelationshipIndexPageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <RelationshipIndexPage />
    </BamSignalInstitutePageShell>
  );
}
