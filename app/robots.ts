import type { MetadataRoute } from "next";
import { indexierungErlaubt, siteUrl } from "@/lib/deploy-ziel";

export const dynamic = "force-static";

/**
 * Die Demo sperrt Suchmaschinen NICHT über robots.txt aus, sondern kennzeichnet jede Seite mit noindex.
 * Eine Sperre würde verhindern, dass Suchmaschinen das noindex überhaupt lesen. (Unter einem Repository-Unterpfad auf
 * GitHub Pages wäre eine robots.txt ohnehin wirkungslos, weil sie nur an der Wurzel einer Domain gilt.)
 * Erst mit INDEXIERUNG=1 auf der Kundendomain wird die Sitemap genannt.
 */
export default function robots(): MetadataRoute.Robots {
  return indexierungErlaubt ? { rules: { userAgent: "*", allow: "/" }, sitemap: `${siteUrl}/sitemap.xml` } : { rules: { userAgent: "*", allow: "/" } };
}
