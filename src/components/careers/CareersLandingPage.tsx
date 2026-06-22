import {
  CAREER_CATEGORIES,
  CAREERS_BENEFITS,
  CAREERS_FUTURE_OPPORTUNITIES,
  CAREERS_MISSION,
  CAREERS_TITLE,
  CAREERS_WHY_BAMSIGNAL
} from "../../constants/careers";
import { navigateToPath } from "../../constants/routes";
import { careersPathForHub } from "../../constants/careersRoutes";
import { countOpenRolesByCategory, filterCareerRoles, listHiringProcessSteps } from "../../utils/careersLogic";
import { CareerCategoryCard } from "./CareerCategoryCard";
import { CareerRoleCard } from "./CareerRoleCard";
import { HiringProcessCard } from "./HiringProcessCard";

export function CareersLandingPage() {
  const roleCounts = countOpenRolesByCategory();
  const featuredRoles = filterCareerRoles({ featuredOnly: true }).slice(0, 3);
  const hiringPreview = listHiringProcessSteps().slice(0, 3);

  return (
    <div className="careers-page careers-landing">
      <section className="careers-hero cc-reveal">
        <p className="careers-hero__eyebrow">{CAREERS_TITLE}</p>
        <h1>Build the institution behind meaningful relationships</h1>
        <p>
          Join consultants, operators, researchers, and stewards building BamSignal for Nigeria and
          the diaspora — with discretion, legacy, and long-term craft.
        </p>
        <div className="careers-hero__actions">
          <button
            type="button"
            className="careers-btn"
            onClick={() => navigateToPath(careersPathForHub("openRoles"))}
          >
            View open roles
          </button>
          <button
            type="button"
            className="careers-btn careers-btn--ghost"
            onClick={() => navigateToPath(careersPathForHub("culture"))}
          >
            Our culture
          </button>
        </div>
      </section>

      <section className="careers-section cc-reveal">
        <h2>{CAREERS_WHY_BAMSIGNAL.title}</h2>
        <p className="careers-section__lead">{CAREERS_WHY_BAMSIGNAL.body}</p>
      </section>

      <section className="careers-section cc-reveal">
        <h2>{CAREERS_MISSION.title}</h2>
        <p className="careers-section__lead">{CAREERS_MISSION.body}</p>
      </section>

      <section className="careers-section cc-reveal">
        <div className="careers-section__head">
          <h2>Open roles</h2>
          <button
            type="button"
            className="careers-btn careers-btn--ghost"
            onClick={() => navigateToPath(careersPathForHub("openRoles"))}
          >
            See all roles
          </button>
        </div>
        <div className="careers-role-grid">
          {featuredRoles.map((role) => (
            <CareerRoleCard key={role.id} role={role} />
          ))}
        </div>
      </section>

      <section className="careers-section cc-reveal">
        <h2>Teams</h2>
        <div className="careers-category-grid">
          {CAREER_CATEGORIES.map((category) => (
            <CareerCategoryCard
              key={category.id}
              categoryId={category.id}
              hint={category.hint}
              roleCount={roleCounts[category.id] ?? 0}
            />
          ))}
        </div>
      </section>

      <section className="careers-section cc-reveal">
        <div className="careers-section__head">
          <h2>Benefits</h2>
        </div>
        <div className="careers-benefits-grid">
          {CAREERS_BENEFITS.map((benefit) => (
            <article key={benefit.title} className="careers-benefit-card">
              <h3>{benefit.title}</h3>
              <p>{benefit.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="careers-section cc-reveal">
        <div className="careers-section__head">
          <h2>Hiring process</h2>
          <button
            type="button"
            className="careers-btn careers-btn--ghost"
            onClick={() => navigateToPath(careersPathForHub("hiringProcess"))}
          >
            Full process
          </button>
        </div>
        <div className="careers-hiring-grid">
          {hiringPreview.map((step) => (
            <HiringProcessCard key={step.id} step={step} />
          ))}
        </div>
      </section>

      <section className="careers-section careers-section--future cc-reveal">
        <h2>Future opportunities</h2>
        <p className="careers-section__lead">
          Roles we are preparing for as BamSignal scales. Join the talent pool if your background
          aligns before the role opens.
        </p>
        <ul className="careers-future-list">
          {CAREERS_FUTURE_OPPORTUNITIES.map((title) => (
            <li key={title}>{title}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
