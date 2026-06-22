import { StewardshipCouncilPage } from "../../components/century/stewardshipCouncil/StewardshipCouncilPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "../bam-signal-institute/BamSignalInstitutePageShell";

type CenturyStewardshipCouncilPageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function CenturyStewardshipCouncilPage(props: CenturyStewardshipCouncilPageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <StewardshipCouncilPage />
    </BamSignalInstitutePageShell>
  );
}
