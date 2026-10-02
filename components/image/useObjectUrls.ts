"use client";

import { useEffect, useMemo } from "react";

/** Object URLs for a list of files, revoked when the list changes or unmounts. */
export function useObjectUrls(files: readonly File[]): ReadonlyMap<File, string> {
  // Files only exist after a client-side pick, so this never runs during SSR with content.
  const urls = useMemo(() => new Map(files.map((file) => [file, URL.createObjectURL(file)])), [files]);

  useEffect(
    () => () => {
      for (const url of urls.values()) URL.revokeObjectURL(url);
    },
    [urls],
  );

  return urls;
}
