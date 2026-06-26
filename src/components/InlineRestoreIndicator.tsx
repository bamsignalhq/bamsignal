import { Loader2 } from "lucide-react";

type InlineRestoreIndicatorProps = {
  label?: string;
};

export function InlineRestoreIndicator({ label = "Restoring your session…" }: InlineRestoreIndicatorProps) {
  return (
    <div className="inline-restore-indicator" role="status" aria-live="polite">
      <Loader2 size={16} className="inline-restore-indicator__spinner" aria-hidden />
      <span>{label}</span>
    </div>
  );
}
