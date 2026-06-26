import { useEffect, useState } from "react";
import type { ConfigurationValue } from "../types/configurationPlatform";
import {
  getRemoteConfigValue,
  loadRemoteConfig,
  subscribeRemoteConfig
} from "../services/remoteConfigClient";

export function useRemoteConfig<T extends ConfigurationValue = ConfigurationValue>(
  key: string,
  fallback?: T
): T {
  const [, setRevision] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void loadRemoteConfig().finally(() => {
      if (!cancelled) setRevision((value) => value + 1);
    });
    const unsubscribe = subscribeRemoteConfig(() => {
      if (!cancelled) setRevision((value) => value + 1);
    });
    const interval = window.setInterval(() => {
      void loadRemoteConfig(true);
    }, 60_000);
    return () => {
      cancelled = true;
      unsubscribe();
      window.clearInterval(interval);
    };
  }, [key]);

  return getRemoteConfigValue(key, fallback);
}
