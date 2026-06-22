import { LegacyProfessionalsPage } from "../../components/bamSignalInstitute/legacyProfessionals/LegacyProfessionalsPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteLegacyProfessionalsPageProps = Omit<
  BamSignalInstitutePageShellProps,
  "children"
>;

export function BamSignalInstituteLegacyProfessionalsPage(
  props: BamSignalInstituteLegacyProfessionalsPageProps
) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <LegacyProfessionalsPage />
    </BamSignalInstitutePageShell>
  );
}
