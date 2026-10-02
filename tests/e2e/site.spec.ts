import { expect, test } from "@playwright/test";

import { guardPage } from "./helpers";

test("homepage renders, searches and never loads the PDF libraries", async ({ page }) => {
  const guard = guardPage(page);
  const scripts: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "script") scripts.push(request.url());
  });

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Free PDF & Image Tools");
  await expect(page.getByText("Merge, split, compress, convert and edit your files online")).toBeVisible();

  const search = page.getByRole("combobox", { name: "Search tools" }).first();
  await search.fill("compress");
  const options = page.getByRole("listbox", { name: "Search results" }).getByRole("option");
  await expect(options).toHaveCount(2);
  await expect(options.first()).toContainText("Compress PDF");
  await expect(options.nth(1)).toContainText("Compress Image");

  await search.fill("convert");
  await expect(options.first()).toBeVisible();
  const converters = await options.allInnerTexts();
  for (const name of ["PDF to JPG", "JPG to PDF", "JPG to PNG", "PNG to JPG", "WebP Converter"]) {
    expect(
      converters.some((text) => text.startsWith(name)),
      name,
    ).toBe(true);
  }

  await search.press("Escape");
  await expect(page.getByRole("listbox", { name: "Search results" })).toBeHidden();
  await page.getByRole("link", { name: "See all tools" }).click();
  await expect(page).toHaveURL(/#pdf-tools$/);
  await expect(page.locator("#pdf-tools")).toBeInViewport();

  await search.fill("merge");
  await search.press("Enter");
  await expect(page).toHaveURL(/\/pdf\/merge-pdf$/);

  expect(
    scripts.filter((url) => /pdfjs|pdf-lib|jszip/i.test(url)),
    "heavy libraries on the homepage",
  ).toEqual([]);
  guard.assertClean();
});

test("every tool card, nav and footer link resolves to a real page", async ({ page }) => {
  await page.goto("/");
  const hrefs = new Set<string>();
  for (const href of await page
    .locator("a[href^='/']")
    .evaluateAll((anchors) => anchors.map((a) => a.getAttribute("href")!))) {
    hrefs.add(href.split("#")[0]);
  }
  hrefs.delete("");
  const tools = [...hrefs].filter((href) => /^\/(pdf|image)\/[a-z-]+$/.test(href));
  expect(tools.length).toBe(19);

  for (const href of hrefs) {
    const response = await page.request.get(href);
    expect(response.status(), href).toBe(200);
    expect(await response.text(), href).toContain("<h1");
  }
});

test("tool pages carry unique metadata and structured data", async ({ page }) => {
  await page.goto("/pdf/compress-pdf");
  await expect(page).toHaveTitle("Compress PDF — Reduce PDF File Size Online Free | Kiravi PDF");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/pdf\/compress-pdf$/);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /Compress PDF/);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/og\/compress-pdf$/);
  const card = await page.request.get("/og/compress-pdf");
  expect(card.status()).toBe(200);
  expect(card.headers()["content-type"]).toBe("image/png");
  expect((await card.body()).length).toBeGreaterThan(10_000);

  const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
  const types = schemas.flatMap((json) => {
    const parsed = JSON.parse(json);
    return (Array.isArray(parsed) ? parsed : [parsed]).map((entry: { "@type": string }) => entry["@type"]);
  });
  expect(types).toEqual(
    expect.arrayContaining(["WebSite", "WebApplication", "BreadcrumbList", "FAQPage", "HowTo"]),
  );

  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toContainText("PDF Tools");
  await expect(page.getByRole("heading", { name: "What is Compress PDF?" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Related tools" })).toBeVisible();

  await page.getByRole("button", { name: "Why did my PDF barely get smaller?" }).click();
  await expect(page.getByText("Because there was little to remove", { exact: false })).toBeVisible();
});

test("the structured-data search action really works", async ({ page }) => {
  await page.goto("/?q=rotate");
  const options = page.getByRole("listbox", { name: "Search results" }).getByRole("option");
  await expect(options).toHaveCount(2);
  await expect(page.getByRole("combobox", { name: "Search tools" }).first()).toHaveValue("rotate");
});

test("sitemap and robots are generated from the registry", async ({ page }) => {
  const sitemap = await (await page.request.get("/sitemap.xml")).text();
  expect(sitemap.match(/<loc>/g)).toHaveLength(26);
  expect(sitemap).toContain("/pdf/merge-pdf</loc>");
  expect(sitemap).toContain("/image/remove-metadata</loc>");

  const robots = await (await page.request.get("/robots.txt")).text();
  expect(robots).toContain("Allow: /");
  expect(robots).toMatch(/Sitemap: .*\/sitemap\.xml/);
});

test("unknown routes get a helpful 404", async ({ page }) => {
  const response = await page.goto("/pdf/not-a-tool");
  expect(response?.status()).toBe(404);
  await expect(page.getByText(/couldn.t find that page/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to home" })).toBeVisible();
});

test("mobile menu lists every tool", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile only");
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("link", { name: "Remove Image Metadata" })).toBeVisible();
  await dialog.getByRole("link", { name: "Merge PDF" }).click();
  await expect(page).toHaveURL(/\/pdf\/merge-pdf$/);
});

test("header search opens in a sheet and navigates", async ({ page }) => {
  await page.goto("/about");
  await page.getByRole("button", { name: "Search tools", exact: true }).click();
  const search = page.getByRole("dialog").getByRole("combobox", { name: "Search tools" });
  await search.fill("resize");
  await search.press("Enter");
  await expect(page).toHaveURL(/\/image\/resize-image$/);
});

test("contact email button is readable, not brand-on-brand", async ({ page }) => {
  await page.goto("/contact");
  const link = page.getByRole("link", { name: /hello@kiravipdf\.com/ });
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute("href", "mailto:hello@kiravipdf.com");
  const style = await link.evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      color: computed.color,
      background: computed.backgroundColor,
      decoration: computed.textDecorationLine,
    };
  });
  expect(style.color).not.toBe(style.background);
  expect(style.decoration).toBe("none");
  // Inline prose links keep their brand styling.
  const prose = page.getByRole("link", { name: "privacy page" });
  expect(await prose.evaluate((element) => getComputedStyle(element).textDecorationLine)).toBe("underline");
});
