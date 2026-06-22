import { HouseFoundationPage } from "../../components/bamSignalInstitute/houseFoundation/HouseFoundationPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteHouseFoundationPageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteHouseFoundationPage(props: BamSignalInstituteHouseFoundationPageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <HouseFoundationPage />
    </BamSignalInstitutePageShell>
  );
}
