import { X } from "lucide-react";
import { AuthPage } from "../pages/AuthPage";
import type { AuthMeta, AuthMode, UserProfile } from "../types";

type AuthModalProps = {
  open: boolean;
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onAuthenticated: (profile: UserProfile, meta?: AuthMeta) => void;
  onClose: () => void;
  message?: string;
  onMessage: (msg: string) => void;
};

export function AuthModal({
  open,
  mode,
  onModeChange,
  onAuthenticated,
  onClose,
  message,
  onMessage
}: AuthModalProps) {
  if (!open) return null;

  return (
    <div className="modal-backdrop auth-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-label="BamSignal account"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>
        <AuthPage
          mode={mode}
          onModeChange={onModeChange}
          onAuthenticated={onAuthenticated}
          message={message}
          onMessage={onMessage}
          embedded
        />
      </div>
    </div>
  );
}
