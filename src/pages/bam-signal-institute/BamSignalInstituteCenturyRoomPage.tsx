import { CenturyRoomPage } from "../../components/bamSignalInstitute/centuryRoom/CenturyRoomPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteCenturyRoomPageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteCenturyRoomPage(props: BamSignalInstituteCenturyRoomPageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <CenturyRoomPage />
    </BamSignalInstitutePageShell>
  );
}
