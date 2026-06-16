import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import {
  clearAdminConsentToken,
  fetchAdminPinStatus,
  getAdminConsentToken,
  rotateAdminActionPin,
  setInitialAdminActionPin,
  verifyAdminActionPin
} from "../../utils/adminConsent";

type AdminConsentContextValue = {
  ensureConsent: (reason?: string) => Promise<boolean>;
  pinConfigured: boolean | null;
  refreshPinStatus: () => Promise<void>;
  clearConsent: () => void;
};

const AdminConsentContext = createContext<AdminConsentContextValue | null>(null);

export function AdminConsentProvider({ children }: { children: ReactNode }) {
  const [pinConfigured, setPinConfigured] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [setupMode, setSetupMode] = useState(false);
  const [newPin, setNewPin] = useState("");
  const resolverRef = useRef<((ok: boolean) => void) | null>(null);

  const refreshPinStatus = useCallback(async () => {
    const status = await fetchAdminPinStatus();
    if (status.ok) setPinConfigured(Boolean(status.pinConfigured));
  }, []);

  useEffect(() => {
    void refreshPinStatus();
  }, [refreshPinStatus]);

  const ensureConsent = useCallback(
    async (why = "Confirm this admin action.") => {
      if (getAdminConsentToken()) return true;

      const status = await fetchAdminPinStatus();
      if (status.ok && !status.pinConfigured) {
        setSetupMode(true);
        setReason("Set your admin action PIN before making changes.");
        setOpen(true);
      } else {
        setSetupMode(false);
        setReason(why);
        setOpen(true);
      }

      return new Promise<boolean>((resolve) => {
        resolverRef.current = resolve;
      });
    },
    []
  );

  const closeModal = (ok: boolean) => {
    setOpen(false);
    setPin("");
    setNewPin("");
    setError("");
    setSetupMode(false);
    resolverRef.current?.(ok);
    resolverRef.current = null;
  };

  const submitPin = async () => {
    setBusy(true);
    setError("");
    try {
      if (setupMode) {
        if (!/^\d{4,8}$/.test(newPin)) {
          setError("PIN must be 4–8 digits.");
          return;
        }
        const result = await setInitialAdminActionPin(newPin);
        if (!result.ok) {
          setError(result.error || "Could not set PIN.");
          return;
        }
        setPinConfigured(true);
        const verify = await verifyAdminActionPin(newPin);
        if (!verify.ok) {
          setError(verify.error || "PIN saved but unlock failed. Try again.");
          return;
        }
        closeModal(true);
        return;
      }

      const result = await verifyAdminActionPin(pin);
      if (!result.ok) {
        setError(result.error || "Invalid PIN.");
        return;
      }
      closeModal(true);
    } finally {
      setBusy(false);
    }
  };

  const value = useMemo(
    () => ({
      ensureConsent,
      pinConfigured,
      refreshPinStatus,
      clearConsent: clearAdminConsentToken
    }),
    [ensureConsent, pinConfigured, refreshPinStatus]
  );

  return (
    <AdminConsentContext.Provider value={value}>
      {children}
      {open && (
        <div className="admin-consent-overlay" role="presentation">
          <div className="admin-consent-modal" role="dialog" aria-modal="true" aria-labelledby="admin-consent-title">
            <p className="admin-consent-modal__kicker">ADMIN CONFIRMATION</p>
            <h2 id="admin-consent-title" className="admin-consent-modal__title">
              {setupMode ? "Set admin action PIN" : "Enter admin PIN"}
            </h2>
            <p className="admin-consent-modal__body">{reason}</p>
            {setupMode ? (
              <label className="admin-consent-modal__field">
                <span>New action PIN (4–8 digits)</span>
                <input
                  type="password"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
                  placeholder="••••"
                />
              </label>
            ) : (
              <label className="admin-consent-modal__field">
                <span>Action PIN</span>
                <input
                  type="password"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
                  placeholder="••••"
                  autoFocus
                />
              </label>
            )}
            {error && <p className="admin-consent-modal__error">{error}</p>}
            <div className="admin-consent-modal__actions">
              <button type="button" className="admin-console__logout" onClick={() => closeModal(false)} disabled={busy}>
                Cancel
              </button>
              <button type="button" className="btn-primary" onClick={() => void submitPin()} disabled={busy}>
                {busy ? "Checking…" : setupMode ? "Save PIN" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminConsentContext.Provider>
  );
}

export function useAdminConsent(): AdminConsentContextValue {
  const ctx = useContext(AdminConsentContext);
  if (!ctx) {
    return {
      ensureConsent: async () => true,
      pinConfigured: null,
      refreshPinStatus: async () => {},
      clearConsent: () => {}
    };
  }
  return ctx;
}

export function AdminSecurityPanel() {
  const { refreshPinStatus, pinConfigured } = useAdminConsent();
  const [currentPin, setCurrentPin] = useState("");
  const [nextPin, setNextPin] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <section className="card admin-security-panel">
      <h3 className="admin-section-title">Admin security</h3>
      <p className="admin-help">
        Action PIN is required before deleting members, changing pricing, approving verifications, and other
        substantial console changes. It is separate from your login password.
      </p>
      <p className="admin-inline-message">
        PIN status: {pinConfigured === null ? "Checking…" : pinConfigured ? "Configured" : "Not set yet"}
      </p>
      <div className="admin-security-panel__grid">
        <label className="admin-consent-modal__field">
          <span>Current action PIN</span>
          <input
            type="password"
            inputMode="numeric"
            value={currentPin}
            onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
          />
        </label>
        <label className="admin-consent-modal__field">
          <span>New action PIN</span>
          <input
            type="password"
            inputMode="numeric"
            value={nextPin}
            onChange={(e) => setNextPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
          />
        </label>
      </div>
      <button
        type="button"
        className="btn-secondary"
        disabled={busy || (pinConfigured ? !currentPin || !nextPin : !nextPin)}
        onClick={() => {
          void (async () => {
            setBusy(true);
            setMessage("");
            const result = pinConfigured
              ? await rotateAdminActionPin(currentPin, nextPin)
              : await setInitialAdminActionPin(nextPin);
            setBusy(false);
            if (!result.ok) {
              setMessage(result.error || "Could not update PIN.");
              return;
            }
            setCurrentPin("");
            setNextPin("");
            setMessage("Admin action PIN updated.");
            await refreshPinStatus();
          })();
        }}
      >
        {busy ? "Saving…" : pinConfigured ? "Rotate action PIN" : "Set action PIN"}
      </button>
      {message && <p className="admin-inline-message">{message}</p>}
    </section>
  );
}
