import type { ReactNode } from "react";
import type { Permission } from "../../constants/permissions";
import { permissionsForHardPath } from "../../constants/permissions";
import { normalizePath } from "../../constants/routes";
import { currentOperatorRole, operatorHasAnyPermission } from "../../utils/operatorPermissions";
import { UnauthorizedPage } from "./UnauthorizedPage";

type RequirePermissionProps = {
  permission?: Permission | Permission[];
  path?: string;
  children: ReactNode;
};

export function RequirePermission({ permission, path, children }: RequirePermissionProps) {
  const routePath = normalizePath(path || window.location.pathname);
  const required = permission
    ? Array.isArray(permission)
      ? permission
      : [permission]
    : permissionsForHardPath(routePath);

  if (!operatorHasAnyPermission(required)) {
    return (
      <UnauthorizedPage role={currentOperatorRole()} required={required} path={routePath} />
    );
  }

  return <>{children}</>;
}
