import { VerifiedProfessionalsPage } from "../../components/bamSignalInstitute/verifiedProfessionals/VerifiedProfessionalsPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteVerifiedProfessionalsPageProps = Omit<
  BamSignalInstitutePageShellProps,
  "children"
>;

export function BamSignalInstituteVerifiedProfessionalsPage(
  props: BamSignalInstituteVerifiedProfessionalsPageProps
) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <VerifiedProfessionalsPage />
    </BamSignalInstitutePageShell>
  );
}
