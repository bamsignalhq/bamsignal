import { ObservatoryPage } from "../../components/bamSignalInstitute/bamSignalObservatory/ObservatoryPage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "./BamSignalInstitutePageShell";

type BamSignalInstituteObservatoryPageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function BamSignalInstituteObservatoryPage(props: BamSignalInstituteObservatoryPageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <ObservatoryPage />
    </BamSignalInstitutePageShell>
  );
}
