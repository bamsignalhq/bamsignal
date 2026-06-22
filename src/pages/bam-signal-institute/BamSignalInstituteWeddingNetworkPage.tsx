import { WeddingNetworkPage } from "../../components/bamSignalInstitute/weddingNetwork/WeddingNetworkPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteWeddingNetworkPageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteWeddingNetworkPage(props: BamSignalInstituteWeddingNetworkPageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <WeddingNetworkPage />
    </BamSignalInstitutePageShell>
  );
}
