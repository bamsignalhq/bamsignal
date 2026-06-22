import { MuseumPage } from "../../components/bamSignalInstitute/bamSignalMuseum/MuseumPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteBamSignalMuseumPageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteBamSignalMuseumPage(props: BamSignalInstituteBamSignalMuseumPageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <MuseumPage />
    </BamSignalInstitutePageShell>
  );
}
