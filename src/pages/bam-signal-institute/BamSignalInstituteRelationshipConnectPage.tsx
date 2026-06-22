import { RelationshipConnectPage } from "../../components/bamSignalInstitute/relationshipConnect/RelationshipConnectPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteRelationshipConnectPageProps = Omit<
  BamSignalInstitutePageShellProps,
  "children"
>;

export function BamSignalInstituteRelationshipConnectPage(
  props: BamSignalInstituteRelationshipConnectPageProps
) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <RelationshipConnectPage />
    </BamSignalInstitutePageShell>
  );
}
