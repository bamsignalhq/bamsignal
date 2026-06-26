import { AdminShell } from "../components/admin/AdminShell";
import "../styles/entry-admin.css";
import { AdminToastProvider } from "../components/admin/AdminToast";
import { AdminConsentProvider } from "../components/admin/AdminConsentProvider";
import { AdminAuthPage } from "../pages/AdminAuthPage";
import { AdminHubPage } from "../pages/AdminHubPage";

type AdminConsoleRootProps = {
  mode: "auth" | "hub";
  onAuthed: () => void;
  onLogout: () => void;
  onUnauthorized: () => void;
};

/** Command Center — loaded only on /hard/* routes. */
export function AdminConsoleRoot({ mode, onAuthed, onLogout, onUnauthorized }: AdminConsoleRootProps) {
  if (mode === "auth") {
    return (
      <AdminToastProvider>
        <div className="admin-console-root">
          <AdminAuthPage onAuthed={onAuthed} />
        </div>
      </AdminToastProvider>
    );
  }

  return (
    <AdminToastProvider>
      <AdminConsentProvider>
        <AdminShell authorized={null} onUnauthorized={onUnauthorized}>
          <AdminHubPage onLogout={onLogout} />
        </AdminShell>
      </AdminConsentProvider>
    </AdminToastProvider>
  );
}
