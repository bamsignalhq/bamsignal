import { SupportContactPage as SupportContact } from "../../components/supportCenter/SupportContactPage";
import { SupportCenterPageShell, type SupportCenterPageShellProps } from "./SupportCenterPageShell";

type SupportContactPageProps = Omit<SupportCenterPageShellProps, "children">;

export function SupportContactPage(props: SupportContactPageProps) {
  return (
    <SupportCenterPageShell {...props}>
      <SupportContact />
    </SupportCenterPageShell>
  );
}
