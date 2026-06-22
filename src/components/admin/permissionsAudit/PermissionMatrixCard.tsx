import {
  PERMISSION_ROLE_LABELS,
  PERMISSION_VERIFY_AREA_LABELS,
  PERMISSION_SECURITY_STATUS_LABELS
} from "../../../constants/permissionsAudit";
import type { PermissionMatrixCell } from "../../../types/permissionsAudit";

type PermissionMatrixCardProps = {
  matrix: PermissionMatrixCell[];
};

export function PermissionMatrixCard({ matrix }: PermissionMatrixCardProps) {
  const roleIds = [...new Set(matrix.map((cell) => cell.roleId))];
  const areaIds = [...new Set(matrix.map((cell) => cell.areaId))];

  return (
    <section className="permission-matrix-card concierge-consultant-card--glass cc-reveal">
      <header className="permission-matrix-card__head">
        <h3>Permission matrix</h3>
        <p>Roles vs route, API, dashboard, document, finance, support, safety, and audit access.</p>
      </header>

      <div className="permission-matrix-card__table" role="table" aria-label="Permission matrix">
        <div className="permission-matrix-card__row permission-matrix-card__row--head" role="row">
          <span role="columnheader">Role</span>
          {areaIds.map((areaId) => (
            <span key={areaId} role="columnheader">
              {PERMISSION_VERIFY_AREA_LABELS[areaId].replace(" access", "")}
            </span>
          ))}
        </div>
        {roleIds.map((roleId) => (
          <div key={roleId} className="permission-matrix-card__row" role="row">
            <span role="cell">{PERMISSION_ROLE_LABELS[roleId]}</span>
            {areaIds.map((areaId) => {
              const cell = matrix.find((item) => item.roleId === roleId && item.areaId === areaId);
              return (
                <span key={`${roleId}-${areaId}`} role="cell" title={cell?.note ?? undefined}>
                  {cell ? PERMISSION_SECURITY_STATUS_LABELS[cell.status] : "—"}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
