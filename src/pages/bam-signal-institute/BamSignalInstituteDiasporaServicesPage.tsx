import { DiasporaServicesPage } from "../../components/bamSignalInstitute/diasporaServices/DiasporaServicesPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteDiasporaServicesPageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteDiasporaServicesPage(
  props: BamSignalInstituteDiasporaServicesPageProps
) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <DiasporaServicesPage />
    </BamSignalInstitutePageShell>
  );
}
