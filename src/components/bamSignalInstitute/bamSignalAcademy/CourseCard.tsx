import {
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "../../../constants/bamSignalAcademy";
import type { AcademyProgramViewModel } from "../../../utils/bamSignalAcademyLogic";

type CourseCardProps = {
  program: AcademyProgramViewModel;
};

export function CourseCard({ program }: CourseCardProps) {
  return (
    <article className="bsa-course-card institute-glass">
      <header className="bsa-course-card__head">
        <h3>{program.title}</h3>
        <span className="bsa-course-card__badge">{LEARNING_LABEL}</span>
      </header>

      <p className="bsa-course-card__labels">{RELATIONSHIP_WISDOM_LABEL}</p>
      <p className="bsa-course-card__description">{program.description}</p>
      <p className="bsa-course-card__status">{program.statusLabel}</p>
    </article>
  );
}
