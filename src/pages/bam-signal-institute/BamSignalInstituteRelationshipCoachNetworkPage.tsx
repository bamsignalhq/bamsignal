import { RelationshipCoachPage } from "../../components/bamSignalInstitute/relationshipCoachNetwork/RelationshipCoachPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteRelationshipCoachNetworkPageProps = Omit<
  BamSignalInstitutePageShellProps,
  "children"
>;

export function BamSignalInstituteRelationshipCoachNetworkPage(
  props: BamSignalInstituteRelationshipCoachNetworkPageProps
) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <RelationshipCoachPage />
    </BamSignalInstitutePageShell>
  );
}
