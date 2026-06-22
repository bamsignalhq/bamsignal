import { LegacyChairPage } from "../../components/bamSignalInstitute/legacyChair/LegacyChairPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteLegacyChairPageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteLegacyChairPage(props: BamSignalInstituteLegacyChairPageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <LegacyChairPage />
    </BamSignalInstitutePageShell>
  );
}
