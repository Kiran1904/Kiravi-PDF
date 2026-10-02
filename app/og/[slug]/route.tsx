import { ImageResponse } from "next/og";

import { LogoMark } from "@/components/layout/LogoMark";
import { site } from "@/lib/site";
import { CATEGORY_LABELS, getTool, tools } from "@/lib/tools/registry";

/**
 * Link-preview cards, prerendered at build time: /og/home, /og/pdf, /og/image
 * and one per tool slug. Referenced from openGraph.images / twitter.images.
 */
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return [
    { slug: "home" },
    { slug: "pdf" },
    { slug: "image" },
    ...tools.map((tool) => ({ slug: tool.slug })),
  ];
}

const CARDS: Record<string, { eyebrow: string; title: string; subtitle: string }> = {
  home: {
    eyebrow: site.tagline,
    title: "Free PDF & Image Tools",
    subtitle: "Merge, split, compress, convert and edit your files — right in your browser.",
  },
  pdf: {
    eyebrow: site.name,
    title: "PDF Tools",
    subtitle: "Merge, split, compress, rotate, convert and edit PDFs without uploading them.",
  },
  image: {
    eyebrow: site.name,
    title: "Image Tools",
    subtitle: "Compress, resize, crop, rotate and convert images without uploading them.",
  },
};

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getTool(slug);
  const card = tool
    ? {
        eyebrow: `${site.name} · ${CATEGORY_LABELS[tool.category]}`,
        title: tool.name,
        subtitle: tool.description,
      }
    : CARDS[slug];
  if (!card) return new Response("Not found", { status: 404 });

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "linear-gradient(135deg, #4f46e5 0%, #312e81 100%)",
        color: "#ffffff",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 64,
            height: 64,
            borderRadius: 16,
            background: "rgba(255,255,255,0.16)",
          }}
        >
          <LogoMark size={40} color="#ffffff" />
        </div>
        <div style={{ display: "flex", fontSize: 34, fontWeight: 700, letterSpacing: -0.5 }}>{site.name}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", fontSize: 26, opacity: 0.85 }}>{card.eyebrow}</div>
        <div
          style={{
            display: "flex",
            fontSize: card.title.length > 18 ? 76 : 92,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: -2,
          }}
        >
          {card.title}
        </div>
        <div style={{ display: "flex", fontSize: 32, lineHeight: 1.35, opacity: 0.9, maxWidth: 1000 }}>
          {card.subtitle}
        </div>
      </div>

      <div style={{ display: "flex", gap: 14 }}>
        {["Free", "Runs in your browser", "No upload, no account"].map((label) => (
          <div
            key={label}
            style={{
              display: "flex",
              padding: "10px 22px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.16)",
              fontSize: 24,
            }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
