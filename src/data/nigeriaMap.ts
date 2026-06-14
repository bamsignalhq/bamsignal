export type MapCity = {
  id: string;
  name: string;
  x: number;
  y: number;
  pulseDelay: number;
};

/** Positions within viewBox 0 0 400 480 */
export const NIGERIA_CITIES: MapCity[] = [
  { id: "lagos", name: "Lagos", x: 92, y: 408, pulseDelay: 0 },
  { id: "abuja", name: "Abuja", x: 208, y: 248, pulseDelay: 0.5 },
  { id: "ph", name: "Port Harcourt", x: 258, y: 338, pulseDelay: 1 },
  { id: "enugu", name: "Enugu", x: 238, y: 298, pulseDelay: 1.4 },
  { id: "benin", name: "Benin", x: 168, y: 322, pulseDelay: 0.8 },
  { id: "kano", name: "Kano", x: 198, y: 98, pulseDelay: 1.2 }
];

export const MAP_ACTIVITIES = [
  "Adaeze sent a signal",
  "Michael matched",
  "Sandra joined",
  "New signal in Abuja",
  "Chinedu connected in Lagos"
] as const;

export const RADIUS_OPTIONS = [5, 10, 25, 50] as const;

export type NearbyDot = {
  id: string;
  name: string;
  x: number;
  y: number;
  minKm: number;
  photo: string;
};

const dot = (name: string, hue: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=128&background=${hue}&color=fff&bold=true`;

/** Dots around Lagos for radius demo — minKm = when they appear */
export const NEARBY_DOTS: NearbyDot[] = [
  { id: "n1", name: "Adaeze", x: 108, y: 395, minKm: 5, photo: dot("A", "e91e8c") },
  { id: "n2", name: "Tunde", x: 78, y: 418, minKm: 5, photo: dot("T", "9c27b0") },
  { id: "n3", name: "Amara", x: 125, y: 385, minKm: 10, photo: dot("Am", "673ab7") },
  { id: "n4", name: "David", x: 145, y: 360, minKm: 10, photo: dot("D", "7b1fa2") },
  { id: "n5", name: "Sandra", x: 175, y: 340, minKm: 25, photo: dot("S", "c2185b") },
  { id: "n6", name: "Chidi", x: 195, y: 310, minKm: 25, photo: dot("C", "512da8") },
  { id: "n7", name: "Fatima", x: 220, y: 280, minKm: 50, photo: dot("F", "ad1457") },
  { id: "n8", name: "Emeka", x: 240, y: 320, minKm: 50, photo: dot("E", "6a1b9a") }
];

/** Lagos center for radius circle */
export const MAP_CENTER = { x: 92, y: 408 };

/** Radius km → SVG circle radius (scaled for map) */
export function radiusToPx(km: number): number {
  return 18 + km * 2.8;
}

/** Simplified Nigeria silhouette */
export const NIGERIA_PATH =
  "M 118 72 C 165 58 220 55 268 68 C 310 82 338 118 345 165 C 352 210 340 255 328 300 C 315 345 285 385 248 415 C 210 442 165 458 125 448 C 88 438 62 405 55 360 C 48 315 52 268 62 225 C 72 182 88 142 105 108 C 110 92 112 82 118 72 Z";

export const SIGNAL_ARCS = [
  { from: 0, to: 1, delay: 0 },
  { from: 1, to: 3, delay: 1.5 },
  { from: 0, to: 2, delay: 3 },
  { from: 5, to: 1, delay: 4.5 },
  { from: 4, to: 0, delay: 2.2 }
] as const;
