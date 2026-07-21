import { useLayoutEffect } from "react";
import { CORPORATE } from "../../constants/corporate";

/** Immediate hand-off — BamSignal does not host recruitment content. */
export function CareersExternalRedirect() {
  useLayoutEffect(() => {
    window.location.replace(CORPORATE.careersUrl);
  }, []);

  return null;
}
