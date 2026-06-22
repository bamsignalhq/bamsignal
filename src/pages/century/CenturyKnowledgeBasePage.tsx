import { KnowledgeBasePage } from "../../components/century/institutionalKnowledgeBase/KnowledgeBasePage";
import { BamSignalInstitutePageShell, type BamSignalInstitutePageShellProps } from "../bam-signal-institute/BamSignalInstitutePageShell";

type CenturyKnowledgeBasePageProps = Omit<BamSignalInstitutePageShellProps, "children">;

export function CenturyKnowledgeBasePage(props: CenturyKnowledgeBasePageProps) {
  return (
    <BamSignalInstitutePageShell {...props}>
      <KnowledgeBasePage />
    </BamSignalInstitutePageShell>
  );
}
