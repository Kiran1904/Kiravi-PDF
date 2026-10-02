import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { expect, it } from "vitest";

/**
 * PLAN.md R5: pdfjs-dist, pdf-lib and jszip may only be imported dynamically,
 * and only from their loader modules. A static import anywhere else would pull
 * ~1 MB into a page bundle — this test is what enforces the rule.
 */
const HEAVY = ["pdfjs-dist", "pdf-lib", "jszip"];
const ALLOWED_STATIC = new Set([
  "lib/pdf/pdfjs.ts", // `import type` + `await import` only, verified below
  "lib/pdf/pdf-lib.ts",
]);

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".") || entry === "tests") continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (/\.(ts|tsx)$/.test(entry)) out.push(path);
  }
  return out;
}

it("no source file statically imports a heavy processing library", () => {
  const root = process.cwd();
  const offenders: string[] = [];

  for (const file of walk(root)) {
    const relative = file.slice(root.length + 1);
    const source = readFileSync(file, "utf8");
    for (const lib of HEAVY) {
      const staticImport = new RegExp(`^import\\s+(?!type\\s)[^;]*?from\\s+["']${lib}`, "m");
      if (staticImport.test(source) && !ALLOWED_STATIC.has(relative)) offenders.push(`${relative} -> ${lib}`);
    }
  }

  expect(offenders).toEqual([]);

  // And the loader modules themselves must use dynamic import, not static.
  for (const relative of ALLOWED_STATIC) {
    const source = readFileSync(join(root, relative), "utf8");
    expect(source, relative).not.toMatch(/^import\s+(?!type\s)[^;]*?from\s+["'](pdfjs-dist|pdf-lib)/m);
    expect(source, relative).toMatch(/import\(["'](pdfjs-dist|pdf-lib)["']\)/);
  }
});
