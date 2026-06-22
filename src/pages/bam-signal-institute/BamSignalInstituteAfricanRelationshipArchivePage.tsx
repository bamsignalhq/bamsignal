import { AfricanRelationshipArchivePage } from "../../components/bamSignalInstitute/africanRelationshipArchive/AfricanRelationshipArchivePage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteAfricanRelationshipArchivePageProps = Omit<
  BamSignalInstitutePageShellProps,
  "children"
>;

export function BamSignalInstituteAfricanRelationshipArchivePage(
  props: BamSignalInstituteAfricanRelationshipArchivePageProps
) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <AfricanRelationshipArchivePage />
    </BamSignalInstitutePageShell>
  );
}
