"use client";

import { useEffect } from "react";

import { consoleProvider, setAnalyticsProvider } from "@/lib/analytics";

/**
 * Single place analytics is wired up. Swapping provider means editing this file
 * and nothing else; with no provider configured, `track()` is a no-op.
 */
export function AnalyticsProviderSetup() {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER === "console") {
      setAnalyticsProvider(consoleProvider);
      return () => setAnalyticsProvider(null);
    }
  }, []);

  return null;
}
