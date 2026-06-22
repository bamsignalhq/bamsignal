import { BamSignalFoundationPage } from "../../components/bamSignalFoundation/BamSignalFoundationPage";
import { BamSignalFoundationPageShell, type BamSignalFoundationPageShellProps } from "./BamSignalFoundationPageShell";

type BamSignalFoundationLandingPageProps = Omit<BamSignalFoundationPageShellProps, "children">;

export function BamSignalFoundationLandingPage(props: BamSignalFoundationLandingPageProps) {
  return (
    <BamSignalFoundationPageShell {...props}>
      <BamSignalFoundationPage />
    </BamSignalFoundationPageShell>
  );
}
