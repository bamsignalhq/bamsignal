import { TrustMilestonesPage } from "../../components/bamSignalInstitute/trustMilestones/TrustMilestonesPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteTrustMilestonesPageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteTrustMilestonesPage(
  props: BamSignalInstituteTrustMilestonesPageProps
) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <TrustMilestonesPage />
    </BamSignalInstitutePageShell>
  );
}
