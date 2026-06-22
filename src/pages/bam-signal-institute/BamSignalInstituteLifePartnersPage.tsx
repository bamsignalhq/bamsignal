import { LifePartnersPage } from "../../components/bamSignalInstitute/lifePartners/LifePartnersPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteLifePartnersPageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteLifePartnersPage(props: BamSignalInstituteLifePartnersPageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <LifePartnersPage />
    </BamSignalInstitutePageShell>
  );
}
