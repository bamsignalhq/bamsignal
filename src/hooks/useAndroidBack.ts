import { useEffect } from "react";

/** Register a handler for the Android hardware back button (via App.tsx custom event). */
export function useAndroidBack(handler: () => boolean): void {
  useEffect(() => {
    const onBack = (event: Event) => {
      if (handler()) event.preventDefault();
    };
    window.addEventListener("bamsignal:back", onBack);
    return () => window.removeEventListener("bamsignal:back", onBack);
  }, [handler]);
}
