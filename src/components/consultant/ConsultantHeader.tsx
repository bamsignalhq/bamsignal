import { LogOut, Moon, Sun } from "lucide-react";
import { AppLogo } from "../AppLogo";
import { CONCIERGE_CONSULTANT_ROLE_LABELS } from "../../constants/conciergeConsultantRoles";
import { SIGNAL_CONCIERGE_BRAND } from "../../constants/signalConcierge";
import type { ConsultantSession } from "../../utils/consultantSession";
import type { Theme } from "../../types";
import { ConsultantRoleBadge } from "../admin/concierge/ConsultantRoleBadge";

type ConsultantHeaderProps = {
  theme: Theme;
  consultant: ConsultantSession;
  onToggleTheme: () => void;
  onLogout: () => void;
};

export function ConsultantHeader({
  theme,
  consultant,
  onToggleTheme,
  onLogout
}: ConsultantHeaderProps) {
  return (
    <header className="consultant-header">
      <div className="consultant-header__inner">
        <div className="consultant-header__brand">
          <AppLogo size="sm" showText />
          <span className="consultant-header__brand-copy">
            · {SIGNAL_CONCIERGE_BRAND} · Consultant
          </span>
        </div>
        <div className="consultant-header__profile">
          <div className="consultant-header__identity">
            <strong>{consultant.consultantName}</strong>
            <span>{CONCIERGE_CONSULTANT_ROLE_LABELS[consultant.primaryRole]}</span>
          </div>
          <ConsultantRoleBadge role={consultant.primaryRole} primary />
          <button
            type="button"
            className="consultant-header__icon-btn"
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button type="button" className="consultant-header__logout" onClick={onLogout}>
            <LogOut size={16} aria-hidden />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
