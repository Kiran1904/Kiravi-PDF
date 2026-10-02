/**
 * Provider-agnostic analytics. Nothing is sent unless a provider is configured,
 * and the event payloads below are the only shapes that exist — file names and
 * contents are deliberately absent.
 */
export type AnalyticsEvent =
  | { name: "tool_viewed"; tool: string }
  | { name: "file_selected"; tool: string; fileCount: number; totalBytes: number }
  | { name: "file_rejected"; tool: string; errorCode: string }
  | { name: "processing_started"; tool: string; fileCount: number }
  | { name: "processing_completed"; tool: string; durationMs: number; outputCount: number }
  | { name: "processing_failed"; tool: string; errorCode: string }
  | { name: "download_clicked"; tool: string; asZip: boolean }
  | { name: "search_used"; resultCount: number };

export interface AnalyticsProvider {
  track(event: AnalyticsEvent): void;
}

let provider: AnalyticsProvider | null = null;

export function setAnalyticsProvider(next: AnalyticsProvider | null): void {
  provider = next;
}

export function track(event: AnalyticsEvent): void {
  if (!provider) return;
  try {
    provider.track(event);
  } catch {
    // Analytics must never break a tool.
  }
}

/** Logs to the console in development; useful for verifying event wiring. */
export const consoleProvider: AnalyticsProvider = {
  track(event) {
    console.info("[analytics]", event.name, event);
  },
};
