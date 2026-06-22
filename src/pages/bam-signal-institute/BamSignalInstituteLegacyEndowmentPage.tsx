import { LegacyEndowmentPage } from "../../components/bamSignalInstitute/legacyEndowment/LegacyEndowmentPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteLegacyEndowmentPageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteLegacyEndowmentPage(props: BamSignalInstituteLegacyEndowmentPageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <LegacyEndowmentPage />
    </BamSignalInstitutePageShell>
  );
}
