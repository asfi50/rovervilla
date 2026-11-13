import type { Metadata } from "next";

/** Canonical origin. NEXT_PUBLIC_SITE_URL overrides it, e.g. for a preview deploy. */
export const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://rovervilla.space").replace(/\/$/, "");

const SITE_KEYWORDS = [
  "Rover Villa",
  "Mars rovers memorial",
  "Moon landers",
  "Opportunity rover",
  "Spirit rover",
  "Ingenuity helicopter",
  "Viking lander",
  "space exploration history",
  "last signal",
];

interface SEOConfig {
  title: string;
  description: string;
  path?: string;
  ogImage?: string;
  keywords?: string[];
}

/** Generates consistent Metadata for any page: Open Graph, Twitter Card, canonical and robots. */
export function generateSEO({
  title,
  description,
  path = "",
  ogImage = "/images/hero-opportunity.jpg",
  keywords = [],
}: SEOConfig): Metadata {
  const url = `${BASE_URL}${path}`;
  const imageUrl = ogImage.startsWith("http") ? ogImage : `${BASE_URL}${ogImage}`;
  const allKeywords = [...new Set([...keywords, ...SITE_KEYWORDS])];

  return {
    title,
    description,
    metadataBase: new URL(BASE_URL),
    keywords: allKeywords,
    alternates: { canonical: url },
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large" as const,
      "max-snippet": -1,
      "max-video-preview": -1,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      siteName: "Rover Villa",
      title,
      description,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
    },
    icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }] },
    other: { "format-detection": "telephone=no" },
  };
}

export const defaultSEO: Metadata = generateSEO({
  title: "Rover Villa: a memorial for the machines we left on Mars and the Moon",
  description:
    "Their mission ended. Their story didn't. The life stories of the rovers, landers and probes that went where we couldn't and never came back.",
});
