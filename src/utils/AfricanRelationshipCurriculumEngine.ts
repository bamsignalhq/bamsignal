import { PRESERVED_CURRICULUM_THEMES } from "../constants/africanRelationshipCurriculum";
import {
  listCultureModules,
  listDiasporaModules,
  listFaithModules,
  type CultureModuleViewModel,
  type DiasporaModuleViewModel,
  type FaithModuleViewModel
} from "./africanRelationshipCurriculumLogic";

export type AfricanRelationshipCurriculumBundle = {
  cultureModules: CultureModuleViewModel[];
  faithModules: FaithModuleViewModel[];
  diasporaModules: DiasporaModuleViewModel[];
  themeCount: number;
};

export function getAfricanRelationshipCurriculumBundle(): AfricanRelationshipCurriculumBundle {
  return {
    cultureModules: listCultureModules(),
    faithModules: listFaithModules(),
    diasporaModules: listDiasporaModules(),
    themeCount: PRESERVED_CURRICULUM_THEMES.length
  };
}
