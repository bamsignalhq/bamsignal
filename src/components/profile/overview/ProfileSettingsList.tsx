import { ChevronRight, LogOut } from "lucide-react";
import { memo } from "react";

type SettingsPanel = "hub" | "privacy" | "notifications";

type ProfileSettingsListProps = {
  onEdit: () => void;
  onOpenSettings: (panel?: SettingsPanel) => void;
  onLogout: () => void;
};

export const ProfileSettingsList = memo(function ProfileSettingsList({
  onEdit,
  onOpenSettings,
  onLogout
}: ProfileSettingsListProps) {
  const rows = [
    { label: "Edit Profile", action: onEdit },
    { label: "Settings", action: () => onOpenSettings("hub") },
    { label: "Privacy", action: () => onOpenSettings("privacy") },
    { label: "Notifications", action: () => onOpenSettings("notifications") }
  ] as const;

  return (
    <nav className="profile-settings-list" aria-label="Profile actions">
      {rows.map((row) => (
        <button key={row.label} type="button" className="profile-settings-list__row" onClick={row.action}>
          <span>{row.label}</span>
          <ChevronRight size={16} aria-hidden />
        </button>
      ))}
      <button type="button" className="profile-settings-list__row profile-settings-list__row--logout" onClick={onLogout}>
        <span>Logout</span>
        <LogOut size={16} aria-hidden />
      </button>
    </nav>
  );
});
