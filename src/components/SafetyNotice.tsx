import { ShieldCheck } from "lucide-react";

type SafetyNoticeProps = {
  variant?: "inline" | "card" | "chat";
  message?: string;
};

export function SafetyNotice({
  variant = "inline",
  message = "Meet in public first. Share meet details with a trusted contact when you decide to meet."
}: SafetyNoticeProps) {
  return (
    <div className={`safety-notice safety-notice--${variant}`}>
      <ShieldCheck size={variant === "chat" ? 14 : 18} />
      <p>{message}</p>
    </div>
  );
}
