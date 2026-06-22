import { HallOfLegacyPage } from "../../components/bamSignalInstitute/hallOfLegacy/HallOfLegacyPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteHallOfLegacyPageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteHallOfLegacyPage(props: BamSignalInstituteHallOfLegacyPageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <HallOfLegacyPage />
    </BamSignalInstitutePageShell>
  );
}
