import { BamSignalTrustPage } from "../../components/bamSignalInstitute/bamSignalTrust/BamSignalTrustPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteTrustPageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteTrustPage(props: BamSignalInstituteTrustPageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <BamSignalTrustPage />
    </BamSignalInstitutePageShell>
  );
}
