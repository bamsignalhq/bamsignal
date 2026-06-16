import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type AdminToast = {
  id: number;
  message: string;
  tone: "error" | "info";
};

type AdminToastContextValue = {
  pushToast: (message: string, tone?: "error" | "info") => void;
};

const AdminToastContext = createContext<AdminToastContextValue | null>(null);

let toastId = 0;

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<AdminToast[]>([]);

  const pushToast = useCallback((message: string, tone: "error" | "info" = "error") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <AdminToastContext.Provider value={value}>
      {children}
      <div className="admin-toast-stack" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`admin-toast admin-toast--${toast.tone}`} role="status">
            {toast.message}
          </div>
        ))}
      </div>
    </AdminToastContext.Provider>
  );
}

export function useAdminToast(): AdminToastContextValue {
  const ctx = useContext(AdminToastContext);
  if (!ctx) {
    return {
      pushToast: (message: string) => {
        if (import.meta.env.DEV) console.warn("[admin-toast]", message);
      }
    };
  }
  return ctx;
}
