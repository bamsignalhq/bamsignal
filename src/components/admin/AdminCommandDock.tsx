import { useEffect, useMemo, useRef, useState } from "react";
import { hardPathForTab } from "../../constants/hardRoutes";
import { roleCanAccessPath } from "../../constants/permissions";
import { getOperatorRole } from "../../utils/adminSession";
import { AdminHealthPanel } from "./AdminHealthPanel";
import { AdminTerminalEmpty } from "./AdminTerminalEmpty";
import {
  filterAdminNavSections,
  type AdminNavSection,
  type AdminTab
} from "./adminConsoleNav";
import { useAdminHealthSummary } from "./AdminHealthPanel";

type AdminCommandDockProps = {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  badges: {
    reports: number;
    leads: number;
    verify: number;
  };
  environment?: "PRODUCTION" | "STAGING" | "DEVELOPMENT";
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

function badgeCount(badges: AdminCommandDockProps["badges"], key?: "reports" | "leads" | "verify") {
  if (!key) return 0;
  return badges[key] ?? 0;
}

function NavButton({
  active,
  label,
  count,
  onClick
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button type="button" className={`admin-dock__item${active ? " is-active" : ""}`} onClick={onClick}>
      <span className="admin-dock__item-label">{label}</span>
      {count > 0 && <span className="admin-dock__badge">{count}</span>}
    </button>
  );
}

function NavSection({
  section,
  activeTab,
  badges,
  collapsed,
  onToggle,
  onTabChange
}: {
  section: AdminNavSection;
  activeTab: AdminTab;
  badges: AdminCommandDockProps["badges"];
  collapsed: boolean;
  onToggle: () => void;
  onTabChange: (tab: AdminTab) => void;
}) {
  return (
    <div className="admin-dock__section">
      <button type="button" className="admin-dock__section-toggle" onClick={onToggle} aria-expanded={!collapsed}>
        <span className="admin-dock__section-title">{section.title}</span>
        <span className="admin-dock__section-chevron" aria-hidden>
          {collapsed ? "+" : "−"}
        </span>
      </button>
      {!collapsed && (
        <div className="admin-dock__section-items" role="group" aria-label={section.title}>
          {section.items.map((item) => (
            <NavButton
              key={item.id}
              active={activeTab === item.id}
              label={item.label}
              count={badgeCount(badges, item.badgeKey)}
              onClick={() => onTabChange(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminCommandDock({
  activeTab,
  onTabChange,
  badges,
  environment = import.meta.env.PROD ? "PRODUCTION" : "DEVELOPMENT",
  mobileOpen = false,
  onMobileClose
}: AdminCommandDockProps) {
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const searchRef = useRef<HTMLInputElement>(null);
  const { ok: healthOk } = useAdminHealthSummary();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      event.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onMobileClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, onMobileClose]);

  const sections = useMemo(() => {
    const role = getOperatorRole();
    const filtered = filterAdminNavSections(search)
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          if (!role) return false;
          return roleCanAccessPath(role, hardPathForTab(item.id));
        })
      }))
      .filter((section) => section.items.length > 0);
    return filtered;
  }, [search]);

  const toggleSection = (id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const healthLabel =
    healthOk === null ? "Checking systems" : healthOk ? "Production healthy" : "Systems degraded";

  const handleTabPick = (id: AdminTab) => {
    onTabChange(id);
    onMobileClose?.();
  };

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="admin-dock__backdrop"
          aria-label="Close command center"
          onClick={() => onMobileClose?.()}
        />
      )}
      <aside
        className={`admin-dock${mobileOpen ? " admin-dock--open" : ""}`}
        aria-label="Command navigation"
      >
        <div className="admin-dock__inner">
          <header className="admin-dock__header">
            <p className="admin-dock__kicker">COMMAND CENTER</p>
            <p className="admin-dock__subtitle">BamSignal Operations</p>
            <div className="admin-dock__env">
              <span className="admin-dock__env-tag">{environment}</span>
              <span className={`admin-dock__health${healthOk === false ? " is-degraded" : ""}`}>
                <span className="admin-dock__health-dot" aria-hidden />
                {healthLabel}
              </span>
            </div>
          </header>

          <label className="admin-dock__search">
            <span className="sr-only">Search commands</span>
            <input
              ref={searchRef}
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search commands..."
              autoComplete="off"
              spellCheck={false}
            />
          </label>

          <nav className="admin-dock__nav">
            {sections.length === 0 && <AdminTerminalEmpty>No commands match that search.</AdminTerminalEmpty>}
            {sections.map((section) => (
              <NavSection
                key={section.id}
                section={section}
                activeTab={activeTab}
                badges={badges}
                collapsed={Boolean(collapsed[section.id])}
                onToggle={() => toggleSection(section.id)}
                onTabChange={handleTabPick}
              />
            ))}
          </nav>

          <AdminHealthPanel compact />
        </div>
      </aside>
    </>
  );
}
