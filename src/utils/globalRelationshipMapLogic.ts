import { PREPARED_DIASPORA_CORRIDORS, corridorRouteLabel, corridorStatusLabel } from "../constants/diasporaCorridors";
import {
  CORRIDOR_DESTINATION_LABELS,
  CORRIDOR_ORIGIN_LABELS
} from "../constants/diasporaCorridors";
import type { FoundersCityDefinition, RelationshipMapLayerId } from "../constants/globalRelationshipMap";
import {
  COMMUNITIES_CONNECTED_LABEL,
  FOUNDERS_CITIES,
  relationshipMapLayerLabel
} from "../constants/globalRelationshipMap";
import { PREPARED_LEGACY_CITIES } from "../constants/legacyCities";
import { communityMaturityLevelLabel } from "../constants/globalCommunityRankings";
import type { GlobalCityDefinition } from "../constants/globalCityNetwork";
import {
  GLOBAL_CITY_COMMUNITY_STATUS_LABELS,
  GLOBAL_CITY_REGION_LABELS,
  getGlobalCity,
  listFeaturedCities
} from "../constants/globalCityNetwork";

export type RelationshipMapDisplayRow = {
  label: string;
  value: string;
};

export type RelationshipMapNodeViewModel = {
  id: string;
  layer: RelationshipMapLayerId;
  layerLabel: string;
  title: string;
  subtitle: string;
  regionLabel: string;
  displayRows: RelationshipMapDisplayRow[];
};

export type RelationshipCorridorMapViewModel = {
  id: string;
  routeLabel: string;
  originLabel: string;
  destinationLabel: string;
  statusLabel: string;
  communityMaturity: string;
  displayRows: RelationshipMapDisplayRow[];
};

function buildCityRows(city: GlobalCityDefinition): RelationshipMapDisplayRow[] {
  return [
    { label: "City", value: city.name },
    { label: "Region", value: GLOBAL_CITY_REGION_LABELS[city.regionId] },
    { label: "Diaspora", value: city.diaspora ? "Yes" : "Home city" },
    { label: "Status", value: "Architecture prepared" }
  ];
}

function buildCommunityRows(city: GlobalCityDefinition): RelationshipMapDisplayRow[] {
  return [
    { label: "Community", value: city.name },
    { label: "Region", value: GLOBAL_CITY_REGION_LABELS[city.regionId] },
    {
      label: "Community status",
      value: GLOBAL_CITY_COMMUNITY_STATUS_LABELS[city.status]
    },
    { label: "Connected", value: COMMUNITIES_CONNECTED_LABEL }
  ];
}

function buildLegacyCityNode(citySlug: string): RelationshipMapNodeViewModel | null {
  const legacy = PREPARED_LEGACY_CITIES.find((entry) => entry.slug === citySlug);
  const networkCity = getGlobalCity(citySlug);
  if (!legacy || !networkCity) return null;

  return {
    id: `grm_legacy_${citySlug}`,
    layer: "legacy-cities",
    layerLabel: relationshipMapLayerLabel("legacy-cities"),
    title: legacy.title,
    subtitle: legacy.description,
    regionLabel: GLOBAL_CITY_REGION_LABELS[networkCity.regionId],
    displayRows: [
      { label: "City", value: networkCity.name },
      { label: "Community level", value: communityMaturityLevelLabel(legacy.communityLevel) },
      { label: "Identity", value: "Long-term community identity" },
      { label: "Status", value: "Architecture prepared" }
    ]
  };
}

function buildFoundersCityNode(foundersCity: FoundersCityDefinition): RelationshipMapNodeViewModel | null {
  const networkCity = getGlobalCity(foundersCity.slug);
  if (!networkCity) return null;

  return {
    id: `grm_founders_${foundersCity.slug}`,
    layer: "founders-cities",
    layerLabel: relationshipMapLayerLabel("founders-cities"),
    title: foundersCity.title,
    subtitle: foundersCity.description,
    regionLabel: GLOBAL_CITY_REGION_LABELS[networkCity.regionId],
    displayRows: [
      { label: "City", value: networkCity.name },
      { label: "Heritage", value: "Celebrating the first stories" },
      { label: "Diaspora", value: networkCity.diaspora ? "Diaspora founders city" : "Home founders city" },
      { label: "Status", value: "Architecture prepared" }
    ]
  };
}

export function buildCityMapNodes(): RelationshipMapNodeViewModel[] {
  return listFeaturedCities().map((city) => ({
    id: `grm_city_${city.slug}`,
    layer: "cities" as const,
    layerLabel: relationshipMapLayerLabel("cities"),
    title: city.name,
    subtitle: GLOBAL_CITY_REGION_LABELS[city.regionId],
    regionLabel: GLOBAL_CITY_REGION_LABELS[city.regionId],
    displayRows: buildCityRows(city)
  }));
}

export function buildCommunityMapNodes(): RelationshipMapNodeViewModel[] {
  return listFeaturedCities().map((city) => ({
    id: `grm_community_${city.slug}`,
    layer: "communities" as const,
    layerLabel: relationshipMapLayerLabel("communities"),
    title: `${city.name} Community`,
    subtitle: GLOBAL_CITY_COMMUNITY_STATUS_LABELS[city.status],
    regionLabel: GLOBAL_CITY_REGION_LABELS[city.regionId],
    displayRows: buildCommunityRows(city)
  }));
}

export function buildLegacyCityMapNodes(): RelationshipMapNodeViewModel[] {
  return PREPARED_LEGACY_CITIES.map((city) => buildLegacyCityNode(city.slug)).filter(
    (node): node is RelationshipMapNodeViewModel => Boolean(node)
  );
}

export function buildFoundersCityMapNodes(): RelationshipMapNodeViewModel[] {
  return FOUNDERS_CITIES.map(buildFoundersCityNode).filter(
    (node): node is RelationshipMapNodeViewModel => Boolean(node)
  );
}

export function buildCorridorMapEntries(): RelationshipCorridorMapViewModel[] {
  return PREPARED_DIASPORA_CORRIDORS.map((corridor) => {
    const originLabel = CORRIDOR_ORIGIN_LABELS[corridor.originId];
    const destinationLabel = CORRIDOR_DESTINATION_LABELS[corridor.destinationId];
    const routeLabel = corridorRouteLabel(corridor.originId, corridor.destinationId);
    const statusLabel = corridorStatusLabel(corridor.status);

    return {
      id: `grm_corridor_${corridor.id}`,
      routeLabel,
      originLabel,
      destinationLabel,
      statusLabel,
      communityMaturity: corridor.communityMaturity,
      displayRows: [
        { label: "Origin", value: originLabel },
        { label: "Destination", value: destinationLabel },
        { label: "Corridor status", value: statusLabel },
        { label: "Community maturity", value: corridor.communityMaturity }
      ]
    };
  });
}

export function sortMapNodes(nodes: RelationshipMapNodeViewModel[]): RelationshipMapNodeViewModel[] {
  return [...nodes].sort((a, b) => a.title.localeCompare(b.title));
}

export function sortCorridorEntries(
  corridors: RelationshipCorridorMapViewModel[]
): RelationshipCorridorMapViewModel[] {
  return [...corridors].sort((a, b) => a.routeLabel.localeCompare(b.routeLabel));
}
