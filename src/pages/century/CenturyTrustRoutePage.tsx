import { CenturyTrustPage } from "../../components/century/centuryTrust/CenturyTrustPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "../bam-signal-institute/BamSignalInstitutePageShell";

type CenturyTrustRoutePageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function CenturyTrustRoutePage(props: CenturyTrustRoutePageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <CenturyTrustPage />
    </BamSignalInstitutePageShell>
  );
}
