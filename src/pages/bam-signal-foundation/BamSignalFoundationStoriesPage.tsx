import { FoundationStoriesPage } from "../../components/bamSignalFoundation/FoundationStoriesPage";
import { BamSignalFoundationPageShell, type BamSignalFoundationPageShellProps } from "./BamSignalFoundationPageShell";

type BamSignalFoundationStoriesPageProps = Omit<BamSignalFoundationPageShellProps, "children">;

export function BamSignalFoundationStoriesPage(props: BamSignalFoundationStoriesPageProps) {
  return (
    <BamSignalFoundationPageShell {...props}>
      <FoundationStoriesPage />
    </BamSignalFoundationPageShell>
  );
}
