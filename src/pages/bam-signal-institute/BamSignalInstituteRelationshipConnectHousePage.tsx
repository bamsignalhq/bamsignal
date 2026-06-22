import { RelationshipConnectHousePage } from "../../components/bamSignalInstitute/relationshipConnectHouse/RelationshipConnectHousePage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteRelationshipConnectHousePageProps = Omit<
  BamSignalInstitutePageShellProps,
  "children"
>;

export function BamSignalInstituteRelationshipConnectHousePage(
  props: BamSignalInstituteRelationshipConnectHousePageProps
) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <RelationshipConnectHousePage />
    </BamSignalInstitutePageShell>
  );
}
