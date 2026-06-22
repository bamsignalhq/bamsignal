import { AnnualInsightsPage } from "../../components/bamSignalInstitute/AnnualInsightsPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteAnnualInsightsPageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteAnnualInsightsPage(props: BamSignalInstituteAnnualInsightsPageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <AnnualInsightsPage />
    </BamSignalInstitutePageShell>
  );
}
