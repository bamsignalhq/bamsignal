import type {
  CurriculumModuleKind,
  CurriculumPreserveThemeId,
  PreparedCurriculumThemeDefinition
} from "../constants/africanRelationshipCurriculum";
import { PRESERVED_CURRICULUM_THEMES } from "../constants/africanRelationshipCurriculum";

export type CultureModuleViewModel = {
  id: CurriculumPreserveThemeId;
  title: string;
  description: string;
  statusLabel: string;
};

export type FaithModuleViewModel = {
  id: CurriculumPreserveThemeId;
  title: string;
  description: string;
  statusLabel: string;
};

export type DiasporaModuleViewModel = {
  id: CurriculumPreserveThemeId;
  title: string;
  description: string;
  statusLabel: string;
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

function buildModuleViewModel<T extends CultureModuleViewModel>(
  theme: PreparedCurriculumThemeDefinition
): T {
  return {
    id: theme.id,
    title: theme.title,
    description: theme.description,
    statusLabel: ARCHITECTURE_STATUS
  } as T;
}

export function listCultureModules(): CultureModuleViewModel[] {
  return PRESERVED_CURRICULUM_THEMES.filter((theme) => theme.moduleKind === "culture")
    .map((theme) => buildModuleViewModel<CultureModuleViewModel>(theme))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function listFaithModules(): FaithModuleViewModel[] {
  return PRESERVED_CURRICULUM_THEMES.filter((theme) => theme.moduleKind === "faith").map((theme) =>
    buildModuleViewModel<FaithModuleViewModel>(theme)
  );
}

export function listDiasporaModules(): DiasporaModuleViewModel[] {
  return PRESERVED_CURRICULUM_THEMES.filter((theme) => theme.moduleKind === "diaspora").map(
    (theme) => buildModuleViewModel<DiasporaModuleViewModel>(theme)
  );
}

export function listModulesByKind(kind: CurriculumModuleKind) {
  if (kind === "culture") return listCultureModules();
  if (kind === "faith") return listFaithModules();
  return listDiasporaModules();
}
