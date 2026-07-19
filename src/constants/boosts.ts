import {
  PROFILE_BOOST_DURATION_HOURS,
  PROFILE_BOOST_PRICE_NGN
} from "../../shared/discoverCommerceHelpers.mjs";

export type BoostProductId =
  | "signal-boost"
  | "priority-signal-once"
  | "profile-boost"
  | "city-boost"
  | "city-spotlight";

/** Products shown in member boost shop (compact fintech catalog). */
export const SHOP_BOOST_IDS = ["signal-boost", "priority-signal-once", "profile-boost"] as const;

export type ShopBoostProductId = (typeof SHOP_BOOST_IDS)[number];

export type BoostProductInput = {
  id: BoostProductId;
  name: string;
  price: number;
  description: string;
  cta: string;
};

export type BoostProduct = BoostProductInput & {
  priceLabel: string;
  amountKobo: number;
};

export function hydrateBoost(raw: BoostProductInput): BoostProduct {
  const price = Math.max(0, Math.round(raw.price));
  return {
    ...raw,
    price,
    priceLabel: `₦${price.toLocaleString("en-NG")}`,
    amountKobo: price * 100
  };
}

export const DEFAULT_BOOST_INPUTS: BoostProductInput[] = [
  {
    id: "signal-boost",
    name: "Boost Visibility",
    price: 350,
    description: "Stand out in Discover for 24 hours.",
    cta: "Boost visibility"
  },
  {
    id: "priority-signal-once",
    name: "Priority Introduction",
    price: 250,
    description: "Make sure your next Signal gets noticed first.",
    cta: "Send priority"
  },
  {
    id: "profile-boost",
    name: "Profile Boost",
    price: PROFILE_BOOST_PRICE_NGN,
    description: `Improve your ranking in Discover, Nearby, and recommendations for ${PROFILE_BOOST_DURATION_HOURS} hours.`,
    cta: "Boost profile"
  }
];

export const DEFAULT_BOOST_PRODUCTS: BoostProduct[] = DEFAULT_BOOST_INPUTS.map(hydrateBoost);

export function shopBoostDescription(product: BoostProduct, _cityLabel?: string): string {
  switch (product.id) {
    case "signal-boost":
      return "Stand out in Discover for 24 hours.";
    case "priority-signal-once":
      return "Make sure your next Signal gets noticed first.";
    case "profile-boost":
      return `Improve your ranking in Discover, Nearby, and recommendations for ${PROFILE_BOOST_DURATION_HOURS} hours.`;
    default:
      return product.description;
  }
}

export function boostDisplayName(id: BoostProductId): string {
  switch (id) {
    case "signal-boost":
      return "Boost Visibility";
    case "priority-signal-once":
      return "Priority Introduction";
    case "profile-boost":
      return "Profile Boost";
    case "city-boost":
      return "City Spotlight";
    case "city-spotlight":
      return "Spotlight";
    default:
      return String(id).replace(/-/g, " ");
  }
}

export function boostSuccessCopy(
  id: BoostProductId,
  city?: string
): { title: string; body: string } {
  const place = city?.trim() || "your city";
  switch (id) {
    case "signal-boost":
      return {
        title: "Boost Visibility is live",
        body: "Stand out in Discover for the next 24 hours."
      };
    case "priority-signal-once":
      return {
        title: "Priority Introduction ready",
        body: "Your next signal will get noticed first."
      };
    case "profile-boost":
      return {
        title: "Profile Boost is live",
        body: `Your ranking is improved in Discover, Nearby, and recommendations for ${PROFILE_BOOST_DURATION_HOURS} hours.`
      };
    case "city-spotlight":
      return {
        title: "Spotlight is live",
        body: `You're featured among highlighted members in ${place} for 24 hours.`
      };
    case "city-boost":
      return {
        title: "City Spotlight is live",
        body: `Your visibility is increased across ${place} for 48 hours.`
      };
    default:
      return { title: "Boost active", body: "Your boost is now live." };
  }
}

export function boostNeedsMemberCity(id: BoostProductId): boolean {
  return id === "signal-boost" || id === "profile-boost";
}
