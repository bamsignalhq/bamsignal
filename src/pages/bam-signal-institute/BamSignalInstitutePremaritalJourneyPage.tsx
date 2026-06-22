import { PremaritalJourneyPage } from "../../components/bamSignalInstitute/premaritalJourney/PremaritalJourneyPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstitutePremaritalJourneyPageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstitutePremaritalJourneyPage(
  props: BamSignalInstitutePremaritalJourneyPageProps
) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <PremaritalJourneyPage />
    </BamSignalInstitutePageShell>
  );
}
