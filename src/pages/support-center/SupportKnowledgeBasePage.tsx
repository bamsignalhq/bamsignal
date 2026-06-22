import { SupportKnowledgeBasePage as SupportKnowledgeBase } from "../../components/supportCenter/SupportKnowledgeBasePage";
import { SupportCenterPageShell, type SupportCenterPageShellProps } from "./SupportCenterPageShell";

type SupportKnowledgeBasePageProps = Omit<SupportCenterPageShellProps, "children">;

export function SupportKnowledgeBasePage(props: SupportKnowledgeBasePageProps) {
  return (
    <SupportCenterPageShell {...props}>
      <SupportKnowledgeBase />
    </SupportCenterPageShell>
  );
}
