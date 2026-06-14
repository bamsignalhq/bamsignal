import { getCms } from "../constants/cms";

export function EarlyAccessBadge({ className = "" }: { className?: string }) {
  return <span className={`early-access-badge ${className}`.trim()}>{getCms().earlyAccessLabel}</span>;
}
