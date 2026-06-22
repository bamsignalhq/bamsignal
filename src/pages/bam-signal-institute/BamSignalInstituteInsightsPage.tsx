import { InsightsPage } from "../../components/bamSignalInstitute/bamSignalInsights/InsightsPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteInsightsPageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteInsightsPage(props: BamSignalInstituteInsightsPageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <InsightsPage />
    </BamSignalInstitutePageShell>
  );
}
