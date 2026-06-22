import { useEffect, type ReactNode } from "react";
import { CONSULTANT_LOGIN_PATH } from "../../constants/consultantRoutes";
import { navigateToPath } from "../../constants/routes";
import { isConsultantLoggedIn } from "../../utils/consultantSession";

type ConsultantRouteGuardProps = {
  children: ReactNode;
  onBlocked?: () => void;
};

export function ConsultantRouteGuard({ children, onBlocked }: ConsultantRouteGuardProps) {
  const authed = isConsultantLoggedIn();

  useEffect(() => {
    if (authed) return;
    onBlocked?.();
    navigateToPath(CONSULTANT_LOGIN_PATH, true);
  }, [authed, onBlocked]);

  if (!authed) {
    return (
      <div className="consultant-guard">
        <p>Redirecting to consultant login…</p>
      </div>
    );
  }

  return <>{children}</>;
}
