import { LegacyHallPage } from "../../components/bamSignalInstitute/legacyHall/LegacyHallPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteLegacyHallPageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteLegacyHallPage(props: BamSignalInstituteLegacyHallPageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <LegacyHallPage />
    </BamSignalInstitutePageShell>
  );
}
