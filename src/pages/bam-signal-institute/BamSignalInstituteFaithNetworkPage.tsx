import { FaithNetworkPage } from "../../components/bamSignalInstitute/faithNetwork/FaithNetworkPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteFaithNetworkPageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteFaithNetworkPage(props: BamSignalInstituteFaithNetworkPageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <FaithNetworkPage />
    </BamSignalInstitutePageShell>
  );
}
