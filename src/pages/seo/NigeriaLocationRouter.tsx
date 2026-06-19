import { getNigeriaCity, getNigeriaState } from "../../content/seo/nigeriaLocations";
import type { NigeriaRoute } from "../../constants/nigeriaRoutes";
import { Link } from "../../components/Link";
import { NIGERIA_DIRECTORY_PATH } from "../../content/seo/nigeriaLocations";
import { NigeriaCityPage } from "./NigeriaCityPage";
import { NigeriaDirectoryPage } from "./NigeriaDirectoryPage";
import { NigeriaStatePage } from "./NigeriaStatePage";

type NigeriaLocationRouterProps = {
  route: NigeriaRoute;
};

export function NigeriaLocationRouter({ route }: NigeriaLocationRouterProps) {
  if (route.kind === "index") {
    return <NigeriaDirectoryPage />;
  }

  if (route.kind === "state") {
    const state = getNigeriaState(route.stateSlug);
    if (!state) {
      return (
        <div className="seo-not-found">
          <h1>State not found</h1>
          <p>This state guide is not available yet.</p>
          <Link href={NIGERIA_DIRECTORY_PATH} className="seo-back-link">
            Back to Nigeria directory
          </Link>
        </div>
      );
    }
    return <NigeriaStatePage state={state} />;
  }

  const match = getNigeriaCity(route.stateSlug, route.citySlug);
  if (!match) {
    return (
      <div className="seo-not-found">
        <h1>Area not found</h1>
        <p>This city or LGA guide is not available yet.</p>
        <Link href={`${NIGERIA_DIRECTORY_PATH}/${route.stateSlug}`} className="seo-back-link">
          Back to state
        </Link>
      </div>
    );
  }

  return <NigeriaCityPage state={match.state} city={match.city} />;
}
