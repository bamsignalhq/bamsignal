import { CenturyVisionPage } from "../../components/bamSignalInstitute/centuryVision/CenturyVisionPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteCenturyVisionPageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteCenturyVisionPage(props: BamSignalInstituteCenturyVisionPageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <CenturyVisionPage />
    </BamSignalInstitutePageShell>
  );
}
