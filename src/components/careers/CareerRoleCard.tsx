import { CAREER_CATEGORY_LABELS } from "../../constants/careers";
import { navigateToPath } from "../../constants/routes";
import { careersPathForRole } from "../../constants/careersRoutes";
import type { CareerRoleRecord } from "../../types/careers";

type CareerRoleCardProps = {
  role: CareerRoleRecord;
};

export function CareerRoleCard({ role }: CareerRoleCardProps) {
  return (
    <article className="careers-role-card cc-reveal">
      <div className="careers-role-card__head">
        <p className="careers-role-card__category">{CAREER_CATEGORY_LABELS[role.categoryId]}</p>
        {role.featured ? <span className="careers-role-card__badge">Featured</span> : null}
      </div>
      <h3>{role.title}</h3>
      <p>{role.summary}</p>
      <dl className="careers-role-card__meta">
        <div>
          <dt>Location</dt>
          <dd>{role.location}</dd>
        </div>
        <div>
          <dt>Type</dt>
          <dd>{role.employmentType}</dd>
        </div>
      </dl>
      <button
        type="button"
        className="careers-btn"
        onClick={() => navigateToPath(careersPathForRole(role.slug))}
      >
        View role
      </button>
    </article>
  );
}
