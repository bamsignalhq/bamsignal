import { useMemo } from "react";
import {
  buildIcebreakers,
  type IcebreakerContext,
  type IcebreakerProfile
} from "../constants/icebreakers";

type UseIcebreakersOptions = {
  viewer: IcebreakerProfile;
  target: IcebreakerProfile;
  context?: IcebreakerContext;
  limit?: number;
  enabled?: boolean;
};

export function useIcebreakers({
  viewer,
  target,
  context = "profile",
  limit,
  enabled = true
}: UseIcebreakersOptions) {
  const seed = `${context}:${target.city ?? ""}:${(target.interests ?? []).join(",")}`;

  const icebreakers = useMemo(() => {
    if (!enabled) return [];
    return buildIcebreakers(viewer, target, { limit, seed });
  }, [enabled, viewer, target, limit, seed]);

  return { icebreakers, context };
}
