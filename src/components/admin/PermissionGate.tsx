import type { ReactNode } from "react";
import type { Permission } from "../../constants/permissions";
import { operatorHasAnyPermission } from "../../utils/operatorPermissions";

type PermissionGateProps = {
  permission: Permission | Permission[];
  title?: string;
  children: ReactNode;
};

export function PermissionGate({
  permission,
  title = "Restricted",
  children
}: PermissionGateProps) {
  if (!operatorHasAnyPermission(permission)) {
    return (
      <div className="admin-permission-gate card">
        <h3>{title}</h3>
        <p>Your institution role does not include access to this section.</p>
      </div>
    );
  }

  return <>{children}</>;
}
