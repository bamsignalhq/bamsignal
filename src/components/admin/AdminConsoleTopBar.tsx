import { Menu } from "lucide-react";
import { getAdminSessionEmail } from "../../utils/adminSession";
import { useAdminHealthSummary } from "./AdminHealthPanel";

type AdminConsoleTopBarProps = {
  onLogout: () => void;
  onOpenDock?: () => void;
  onChangePassword?: () => void;
  version?: string;
};

export function AdminConsoleTopBar({
  onLogout,
  onOpenDock,
  onChangePassword,
  version = "1.0.5"
}: AdminConsoleTopBarProps) {
  const userEmail = getAdminSessionEmail() || "ops@bamsignal.com";
  const { ok: healthOk } = useAdminHealthSummary();

  return (
    <header className="admin-console__topbar">
      <div className="admin-console__topbar-left">
        {onOpenDock && (
          <button type="button" className="admin-console__menu" onClick={onOpenDock} aria-label="Open command center">
            <Menu size={18} />
          </button>
        )}
        <span className="admin-console__brand">BamSignal Admin</span>
        <span className="admin-console__version">v{version}</span>
      </div>
      <div className="admin-console__topbar-right">
        <span className={`admin-console__health${healthOk === false ? " is-degraded" : ""}`}>
          <span className="admin-console__health-dot" aria-hidden />
          {healthOk === null ? "Health…" : healthOk ? "Healthy" : "Degraded"}
        </span>
        <span className="admin-console__user" title={userEmail}>
          {userEmail}
        </span>
        {onChangePassword && (
          <button type="button" className="admin-console__logout" onClick={onChangePassword}>
            Change password
          </button>
        )}
        <button type="button" className="admin-console__logout" onClick={onLogout}>
          Logout Admin
        </button>
      </div>
    </header>
  );
}
