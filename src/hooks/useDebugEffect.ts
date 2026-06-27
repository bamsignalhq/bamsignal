import { useEffect } from "react";
import { debugEffect, isDebugRecursionEnabled } from "../utils/debugRecursion";

/** Wrap useEffect with recursion / repeat-run detection when debug mode is on. */
export function useDebugEffect(
  hook: string,
  effect: () => void | (() => void),
  deps: React.DependencyList
): void {
  useEffect(() => {
    if (!isDebugRecursionEnabled()) {
      return effect();
    }
    let cleanup: void | (() => void);
    debugEffect(hook, [...deps], () => {
      cleanup = effect();
    });
    return () => {
      if (typeof cleanup === "function") cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller owns deps
  }, deps);
}
