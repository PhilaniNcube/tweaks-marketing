import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://tweaks.co.za";

  const routes = [
    "",
    "/abstract-editing",
    "/academic-editing",
    "/formatting",
    "/journal-article-proposal-editing",
    "/reference-checking",
    "/reference-list-editing",
    "/transcription",
    "/contact",
    "/privacy-policy",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "monthly" : "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}
