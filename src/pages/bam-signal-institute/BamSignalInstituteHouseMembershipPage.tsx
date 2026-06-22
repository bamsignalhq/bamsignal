import { HouseMembershipPage } from "../../components/bamSignalInstitute/houseMembership/HouseMembershipPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteHouseMembershipPageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteHouseMembershipPage(props: BamSignalInstituteHouseMembershipPageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <HouseMembershipPage />
    </BamSignalInstitutePageShell>
  );
}
