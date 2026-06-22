import { CAREER_CATEGORY_LABELS } from "../../constants/careers";
import { navigateToPath } from "../../constants/routes";
import { careersPathForHub } from "../../constants/careersRoutes";
import type { CareerRoleRecord } from "../../types/careers";

type CareersRolePageProps = {
  role: CareerRoleRecord;
};

export function CareersRolePage({ role }: CareersRolePageProps) {
  return (
    <div className="careers-page careers-role-detail">
      <button
        type="button"
        className="careers-back-link"
        onClick={() => navigateToPath(careersPathForHub("openRoles"))}
      >
        ← Back to open roles
      </button>

      <header className="careers-role-detail__head cc-reveal">
        <p className="careers-role-card__category">{CAREER_CATEGORY_LABELS[role.categoryId]}</p>
        <h1>{role.title}</h1>
        <p>{role.summary}</p>
        <dl className="careers-role-card__meta careers-role-card__meta--inline">
          <div>
            <dt>Location</dt>
            <dd>{role.location}</dd>
          </div>
          <div>
            <dt>Type</dt>
            <dd>{role.employmentType}</dd>
          </div>
        </dl>
      </header>

      <section className="careers-role-detail__section cc-reveal">
        <h2>Responsibilities</h2>
        <ul>
          {role.responsibilities.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="careers-role-detail__section cc-reveal">
        <h2>Qualifications</h2>
        <ul>
          {role.qualifications.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <footer className="careers-role-detail__cta cc-reveal">
        <p>Ready to apply? Email careers@bamsignal.com with the role title and your CV.</p>
        <button
          type="button"
          className="careers-btn"
          onClick={() => navigateToPath(careersPathForHub("hiringProcess"))}
        >
          See hiring process
        </button>
      </footer>
    </div>
  );
}
