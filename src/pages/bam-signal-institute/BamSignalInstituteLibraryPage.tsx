import { LibraryPage } from "../../components/bamSignalInstitute/bamSignalLibrary/LibraryPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteLibraryPageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteLibraryPage(props: BamSignalInstituteLibraryPageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <LibraryPage />
    </BamSignalInstitutePageShell>
  );
}
