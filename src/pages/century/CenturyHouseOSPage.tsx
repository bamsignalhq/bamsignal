import { HouseOSPage } from "../../components/century/houseOperatingSystem/HouseOSPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "../bam-signal-institute/BamSignalInstitutePageShell";

type CenturyHouseOSPageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function CenturyHouseOSPage(props: CenturyHouseOSPageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <HouseOSPage />
    </BamSignalInstitutePageShell>
  );
}
