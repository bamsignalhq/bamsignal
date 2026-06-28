import { useEffect, useState } from "react";
import { fetchAdminHealthSnapshot } from "../../utils/fetchAdminHealthSnapshot";

export type AdminHealthSnapshot = {
  database: string;
  paystack: boolean;
  resend: boolean;
  signupEmail: boolean;
  sendchamp: boolean;
  firebase: boolean;
  photoStorage: boolean;
  telegram?: boolean;
};

type HealthRow = {
  key: string;
  label: string;
  status: "green" | "amber" | "red";
  value: string;
};

const CRITICAL: Array<keyof AdminHealthSnapshot | "database"> = [
  "database",
  "paystack",
  "resend",
  "signupEmail",
  "photoStorage"
];

function rowsFromHealth(health: AdminHealthSnapshot | null): HealthRow[] {
  if (!health) {
    return CRITICAL.map((key) => ({
      key,
      label: formatLabel(key),
      status: "amber" as const,
      value: "…"
    }));
  }

  return [
    row("database", health.database === "connected", health.database, false),
    row("paystack", health.paystack, health.paystack ? "ok" : "off", false),
    row("resend", health.resend, health.resend ? "ok" : "off", false),
    row("signupEmail", health.signupEmail, health.signupEmail ? "ok" : "off", false),
    row("sendchamp", health.sendchamp, health.sendchamp ? "ok" : "off", true),
    row("firebase", health.firebase, health.firebase ? "ok" : "off", true),
    row("photoStorage", health.photoStorage, health.photoStorage ? "ok" : "off", false),
    row("telegram", Boolean(health.telegram), health.telegram ? "ok" : "off", true)
  ];
}

function formatLabel(key: string): string {
  if (key === "signupEmail") return "Signup Email";
  if (key === "photoStorage") return "Photo Storage";
  return key.charAt(0).toUpperCase() + key.slice(1);
}

function row(
  key: keyof AdminHealthSnapshot | "database",
  good: boolean,
  value: string | boolean,
  optional: boolean
): HealthRow {
  const status: HealthRow["status"] = good ? "green" : optional ? "amber" : "red";
  return {
    key,
    label: formatLabel(key),
    status,
    value: typeof value === "boolean" ? (value ? "ok" : "off") : value
  };
}

export function AdminHealthPanel({ compact = false }: { compact?: boolean }) {
  const [health, setHealth] = useState<AdminHealthSnapshot | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchAdminHealthSnapshot()
      .then((payload) => {
        if (!cancelled) setHealth(payload);
      })
      .catch(() => {
        if (!cancelled) setHealth(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = rowsFromHealth(health);
  const criticalDown = rows.some((r) => CRITICAL.includes(r.key as keyof AdminHealthSnapshot) && r.status === "red");

  return (
    <div className={`admin-health${compact ? " admin-health--compact" : ""}`}>
      {!compact && <p className="admin-health__title">System health</p>}
      <ul className="admin-health__list">
        {rows.map((item) => (
          <li key={item.key} className={`admin-health__row admin-health__row--${item.status}`}>
            <span className="admin-health__dot" aria-hidden />
            <span className="admin-health__label">{item.label}</span>
            <span className="admin-health__value">{item.value}</span>
          </li>
        ))}
      </ul>
      {criticalDown && <p className="admin-health__warn">Critical service offline</p>}
    </div>
  );
}

export function useAdminHealthSummary(): { ok: boolean | null; criticalDown: boolean } {
  const [ok, setOk] = useState<boolean | null>(null);
  const [criticalDown, setCriticalDown] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchAdminHealthSnapshot()
      .then((payload) => {
        if (cancelled) return;
        if (!payload) {
          setOk(false);
          setCriticalDown(true);
          return;
        }
        const down =
          payload.database !== "connected" ||
          !payload.paystack ||
          !payload.resend ||
          !payload.signupEmail ||
          !payload.photoStorage;
        setCriticalDown(down);
        setOk(!down);
      })
      .catch(() => {
        if (!cancelled) {
          setOk(false);
          setCriticalDown(true);
        }
      });
  }, []);

  return { ok, criticalDown };
}
