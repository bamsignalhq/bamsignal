import { Suspense, type ReactNode } from "react";
import { AdminTerminalEmpty } from "./AdminTerminalEmpty";

type AdminLazyTabProps = {
  active: boolean;
  children: ReactNode;
};

export function AdminLazyTab({ active, children }: AdminLazyTabProps) {
  if (!active) return null;
  return (
    <Suspense fallback={<AdminTerminalEmpty>Loading workspace…</AdminTerminalEmpty>}>
      {children}
    </Suspense>
  );
}
