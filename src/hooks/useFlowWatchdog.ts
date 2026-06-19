import { useEffect, useState } from "react";
import {
  clearFlowState,
  FLOW_TIMEOUT_MS,
  isFlowStuck,
  startFlowState,
  touchFlowState,
  type FlowName
} from "../utils/flowWatchdog";

export function useFlowWatchdog(
  flowName: FlowName,
  active: boolean,
  route: string,
  userId?: string
): { stuck: boolean; reset: () => void } {
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    if (!active) {
      setStuck(false);
      return;
    }

    startFlowState(flowName, route, userId);
    touchFlowState();

    const timeoutMs = FLOW_TIMEOUT_MS[flowName];
    const timer = window.setInterval(() => {
      setStuck(isFlowStuck(flowName, timeoutMs));
    }, 2000);

    return () => {
      window.clearInterval(timer);
    };
  }, [active, flowName, route, userId]);

  const reset = () => {
    setStuck(false);
    if (active) startFlowState(flowName, route, userId);
  };

  return { stuck, reset };
}

export function useFlowWatchdogCleanup(active: boolean): void {
  useEffect(() => {
    if (active) return;
    clearFlowState();
  }, [active]);
}
