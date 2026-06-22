import { GreatRoomPage } from "../../components/bamSignalInstitute/greatRoom/GreatRoomPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteGreatRoomPageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteGreatRoomPage(props: BamSignalInstituteGreatRoomPageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <GreatRoomPage />
    </BamSignalInstitutePageShell>
  );
}
