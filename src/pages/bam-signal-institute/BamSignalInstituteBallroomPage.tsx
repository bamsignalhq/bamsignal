import { BallroomPage } from "../../components/bamSignalInstitute/ballroom/BallroomPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteBallroomPageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteBallroomPage(props: BamSignalInstituteBallroomPageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <BallroomPage />
    </BamSignalInstitutePageShell>
  );
}
