import { NIGERIAN_CITIES } from "./cityData";
import { buildCityPage } from "./cityPageFactory";

export const CITY_PAGES = NIGERIAN_CITIES.map(buildCityPage);
