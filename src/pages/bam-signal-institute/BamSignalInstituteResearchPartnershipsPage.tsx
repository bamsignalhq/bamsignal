import { ResearchPartnershipsPage } from "../../components/bamSignalInstitute/researchPartnerships/ResearchPartnershipsPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteResearchPartnershipsPageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteResearchPartnershipsPage(
  props: BamSignalInstituteResearchPartnershipsPageProps
) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <ResearchPartnershipsPage />
    </BamSignalInstitutePageShell>
  );
}
