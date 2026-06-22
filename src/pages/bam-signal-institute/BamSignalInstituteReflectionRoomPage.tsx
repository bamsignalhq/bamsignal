import { ReflectionRoomPage } from "../../components/bamSignalInstitute/reflectionRoom/ReflectionRoomPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteReflectionRoomPageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteReflectionRoomPage(props: BamSignalInstituteReflectionRoomPageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <ReflectionRoomPage />
    </BamSignalInstitutePageShell>
  );
}
