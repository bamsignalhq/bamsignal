import { AnnualRelationshipReportsPage } from "../../components/bamSignalInstitute/annualRelationshipReport/AnnualRelationshipReportsPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteAnnualRelationshipReportsPageProps = Omit<
  BamSignalInstitutePageShellProps,
  "children"
>;

export function BamSignalInstituteAnnualRelationshipReportsPage(
  props: BamSignalInstituteAnnualRelationshipReportsPageProps
) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <AnnualRelationshipReportsPage />
    </BamSignalInstitutePageShell>
  );
}
