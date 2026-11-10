import { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/app-url";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/actions/",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
