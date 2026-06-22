import { SupportTicketsPage as SupportTickets } from "../../components/supportCenter/SupportTicketsPage";
import { SupportCenterPageShell, type SupportCenterPageShellProps } from "./SupportCenterPageShell";

type SupportTicketsPageProps = Omit<SupportCenterPageShellProps, "children">;

export function SupportTicketsPage(props: SupportTicketsPageProps) {
  return (
    <SupportCenterPageShell {...props}>
      <SupportTickets />
    </SupportCenterPageShell>
  );
}
