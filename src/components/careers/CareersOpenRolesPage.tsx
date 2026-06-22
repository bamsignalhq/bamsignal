import { useMemo, useState } from "react";
import { CAREER_CATEGORIES, CAREER_CATEGORY_LABELS } from "../../constants/careers";
import { filterCareerRoles, listCareerRoles } from "../../utils/careersLogic";
import type { CareerCategoryId } from "../../constants/careers";
import { CareerRoleCard } from "./CareerRoleCard";

export function CareersOpenRolesPage() {
  const [categoryId, setCategoryId] = useState<CareerCategoryId | "all">("all");

  const roles = useMemo(() => {
    if (categoryId === "all") return listCareerRoles();
    return filterCareerRoles({ categoryId });
  }, [categoryId]);

  return (
    <div className="careers-page">
      <header className="careers-page__head cc-reveal">
        <h1>Open roles</h1>
        <p>Current opportunities across Signal Concierge, operations, research, community, and leadership.</p>
      </header>

      <div className="careers-filters cc-reveal">
        <button
          type="button"
          className={`careers-filter-chip${categoryId === "all" ? " is-active" : ""}`}
          onClick={() => setCategoryId("all")}
        >
          All teams
        </button>
        {CAREER_CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            className={`careers-filter-chip${categoryId === category.id ? " is-active" : ""}`}
            onClick={() => setCategoryId(category.id)}
          >
            {CAREER_CATEGORY_LABELS[category.id]}
          </button>
        ))}
      </div>

      <div className="careers-role-grid">
        {roles.map((role) => (
          <CareerRoleCard key={role.id} role={role} />
        ))}
      </div>
    </div>
  );
}
