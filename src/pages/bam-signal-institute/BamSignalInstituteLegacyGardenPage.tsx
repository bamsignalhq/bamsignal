import { LegacyGardenPage } from "../../components/bamSignalInstitute/legacyGarden/LegacyGardenPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteLegacyGardenPageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteLegacyGardenPage(props: BamSignalInstituteLegacyGardenPageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <LegacyGardenPage />
    </BamSignalInstitutePageShell>
  );
}
