import { getCms } from "../constants/cms";

export function FoundingMemberBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`founding-member-badge ${className}`.trim()}>{getCms().foundingMemberLabel}</span>
  );
}
