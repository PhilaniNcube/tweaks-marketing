import { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/app-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();

  const routes = [
    "",
    "/abstract-editing",
    "/academic-editing",
    "/formatting",
    "/journal-article-proposal-editing",
    "/reference-checking",
    "/reference-list-editing",
    // "/transcription", // temporarily disabled
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
