import { MasterclassesPage } from "../../components/bamSignalInstitute/relationshipMasterclasses/MasterclassesPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteRelationshipMasterclassesPageProps = Omit<
  BamSignalInstitutePageShellProps,
  "children"
>;

export function BamSignalInstituteRelationshipMasterclassesPage(
  props: BamSignalInstituteRelationshipMasterclassesPageProps
) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <MasterclassesPage />
    </BamSignalInstitutePageShell>
  );
}
