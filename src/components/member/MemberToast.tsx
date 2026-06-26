import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type MemberToastTone = "default" | "success" | "error";

type MemberToastProps = {
  message: string;
  tone?: MemberToastTone;
  onDismiss?: () => void;
};

export function MemberToast({ message, tone = "default", onDismiss }: MemberToastProps) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    setLeaving(false);
  }, [message]);

  const handleDismiss = () => {
    setLeaving(true);
    window.setTimeout(() => onDismiss?.(), 140);
  };

  const node = (
    <div className="member-toast-host" role="status" aria-live="polite" aria-atomic="true">
      <p className={`member-toast member-toast--${tone}${leaving ? " member-toast--leaving" : ""}`}>
        {message}
      </p>
    </div>
  );

  if (typeof document === "undefined") return node;
  return createPortal(node, document.body);
}
