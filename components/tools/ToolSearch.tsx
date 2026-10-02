"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Search, X } from "lucide-react";

import { ToolIcon } from "@/components/tools/ToolIcon";
import { track } from "@/lib/analytics";
import { CATEGORY_LABELS, type ToolIndexEntry } from "@/lib/tools/registry";
import { searchTools } from "@/lib/tools/search";
import { cn } from "@/lib/utils";

const MAX_RESULTS = 8;

const subscribeNever = () => () => {};
const readUrlQuery = () => new URLSearchParams(window.location.search).get("q") ?? "";
const readServerQuery = () => "";

export function ToolSearch({
  index,
  suggestions = [],
  autoFocus = false,
  seedFromUrl = false,
  placeholder = "What do you want to do?",
  className,
}: {
  index: ToolIndexEntry[];
  /** Slugs shown as quick picks when the field is empty */
  suggestions?: string[];
  autoFocus?: boolean;
  /** Start with `?q=` from the URL — backs the WebSite SearchAction in structured data */
  seedFromUrl?: boolean;
  placeholder?: string;
  className?: string;
}) {
  const router = useRouter();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const urlQuery = useSyncExternalStore(subscribeNever, readUrlQuery, readServerQuery);
  const [typed, setTyped] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  // Until the user types, a seeded query comes from the URL and its results are shown.
  const seeded = seedFromUrl && typed === null && urlQuery !== "";
  const query = typed ?? (seedFromUrl ? urlQuery : "");
  const setQuery = (value: string) => setTyped(value);

  const results = useMemo(() => searchTools(index, query).slice(0, MAX_RESULTS), [index, query]);
  const quickPicks = useMemo(
    () =>
      suggestions.map((slug) => index.find((tool) => tool.slug === slug)).filter(Boolean) as ToolIndexEntry[],
    [index, suggestions],
  );

  useEffect(() => {
    if (!query.trim()) return;
    const timer = window.setTimeout(() => track({ name: "search_used", resultCount: results.length }), 600);
    return () => window.clearTimeout(timer);
  }, [query, results.length]);

  function close() {
    if (seeded) setTyped(query);
    setOpen(false);
  }

  function go(tool: ToolIndexEntry) {
    close();
    router.push(`/${tool.category}/${tool.slug}`);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      close();
      return;
    }
    if (!results.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((current) => (current + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActive((current) => (current - 1 + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(results[active]);
    }
  }

  const showResults = (open || seeded) && Boolean(query.trim());
  const hasResults = results.length > 0;

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative">
        <Search
          aria-hidden
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2"
        />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={showResults}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showResults && hasResults ? `${listId}-${active}` : undefined}
          aria-label="Search tools"
          autoFocus={autoFocus}
          autoComplete="off"
          value={query}
          placeholder={placeholder}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(close, 120)}
          onKeyDown={onKeyDown}
          className={cn(
            "bg-card h-14 w-full rounded-xl border pr-12 pl-12 text-base shadow-sm",
            "placeholder:text-muted-foreground",
            "focus-visible:border-brand focus-visible:ring-brand/30 focus-visible:ring-4 focus-visible:outline-none",
          )}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setActive(0);
              inputRef.current?.focus();
            }}
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-3 grid size-8 -translate-y-1/2 place-items-center rounded-md focus-visible:ring-2 focus-visible:outline-none"
          >
            <X aria-hidden className="size-4" />
            <span className="sr-only">Clear search</span>
          </button>
        )}
      </div>

      <p aria-live="polite" className="sr-only">
        {showResults
          ? hasResults
            ? `${results.length} tool${results.length === 1 ? "" : "s"} found`
            : "No tools found"
          : ""}
      </p>

      {showResults && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Search results"
          className="bg-popover absolute top-full z-50 mt-2 w-full overflow-hidden rounded-xl border shadow-lg"
        >
          {hasResults ? (
            results.map((tool, position) => (
              <li
                key={tool.slug}
                id={`${listId}-${position}`}
                role="option"
                aria-selected={position === active}
              >
                <button
                  type="button"
                  tabIndex={-1}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActive(position)}
                  onClick={() => go(tool)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-left",
                    position === active ? "bg-accent" : "bg-transparent",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-lg",
                      tool.category === "pdf" ? "bg-pdf/10 text-pdf" : "bg-image/10 text-image",
                    )}
                  >
                    <ToolIcon name={tool.icon} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{tool.name}</span>
                    <span className="text-muted-foreground block truncate text-xs">{tool.description}</span>
                  </span>
                  <span className="text-muted-foreground ml-auto hidden text-xs sm:block">
                    {CATEGORY_LABELS[tool.category]}
                  </span>
                </button>
              </li>
            ))
          ) : (
            <li className="text-muted-foreground px-4 py-6 text-center text-sm">
              No tools match “{query}”. Try “compress”, “convert” or “merge”.
            </li>
          )}
        </ul>
      )}

      {!showResults && quickPicks.length > 0 && (
        <ul className="mt-4 flex flex-wrap justify-center gap-2">
          {quickPicks.map((tool) => (
            <li key={tool.slug}>
              <a
                href={`/${tool.category}/${tool.slug}`}
                className="bg-card hover:border-brand/50 hover:text-brand focus-visible:ring-ring inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                <ToolIcon name={tool.icon} className="size-4" />
                {tool.name}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
