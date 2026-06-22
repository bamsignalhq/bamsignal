import { TrustScorePage } from "../../components/bamSignalInstitute/trustScore/TrustScorePage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteTrustScorePageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteTrustScorePage(props: BamSignalInstituteTrustScorePageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <TrustScorePage />
    </BamSignalInstitutePageShell>
  );
}
