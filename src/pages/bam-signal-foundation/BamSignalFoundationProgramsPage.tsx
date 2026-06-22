import { FoundationProgramsPage } from "../../components/bamSignalFoundation/FoundationProgramsPage";
import { BamSignalFoundationPageShell, type BamSignalFoundationPageShellProps } from "./BamSignalFoundationPageShell";

type BamSignalFoundationProgramsPageProps = Omit<BamSignalFoundationPageShellProps, "children">;

export function BamSignalFoundationProgramsPage(props: BamSignalFoundationProgramsPageProps) {
  return (
    <BamSignalFoundationPageShell {...props}>
      <FoundationProgramsPage />
    </BamSignalFoundationPageShell>
  );
}
