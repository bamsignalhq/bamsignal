import { Menu } from "lucide-react";
import { getHardSessionEmail } from "../../utils/adminSession";
import { useAdminHealthSummary } from "./AdminHealthPanel";

type AdminConsoleTopBarProps = {
  onLogout: () => void;
  onOpenDock?: () => void;
  onChangePassword?: () => void;
  onOpenSecurity?: () => void;
};

export function AdminConsoleTopBar({
  onLogout,
  onOpenDock,
  onChangePassword,
  onOpenSecurity
}: AdminConsoleTopBarProps) {
  const operatorEmail = getHardSessionEmail() || "operator";
  const { ok: healthOk } = useAdminHealthSummary();

  return (
    <header className="admin-console__topbar">
      <div className="admin-console__topbar-left">
        {onOpenDock && (
          <button type="button" className="admin-console__menu" onClick={onOpenDock} aria-label="Open command center">
            <Menu size={18} />
          </button>
        )}
        <span className="admin-console__brand">BamSignal</span>
        <span className="admin-console__console-label">COMMAND CENTER</span>
      </div>
      <div className="admin-console__topbar-right">
        <span className={`admin-console__health${healthOk === false ? " is-degraded" : ""}`}>
          <span className="admin-console__health-dot" aria-hidden />
          {healthOk === null ? "Checking…" : healthOk ? "Production Healthy" : "Systems Degraded"}
        </span>
        <span className="admin-console__user" title={operatorEmail}>
          {operatorEmail}
        </span>
        {onChangePassword && (
          <button type="button" className="admin-console__logout" onClick={onChangePassword}>
            Change password
          </button>
        )}
        {onOpenSecurity && (
          <button type="button" className="admin-console__logout" onClick={onOpenSecurity}>
            Console Security
          </button>
        )}
        <button type="button" className="admin-console__logout admin-console__exit" onClick={onLogout}>
          Exit Console
        </button>
      </div>
    </header>
  );
}
