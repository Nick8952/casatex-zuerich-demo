import type { MetadataRoute } from "next";
import { inhaltsquelle, pfade } from "@/lib/content";
import { siteUrl } from "@/lib/deploy-ziel";

export const dynamic = "force-static";

/** Sitemap aller Seiten. In der Demo (ohne INDEXIERUNG=1) löscht scripts/export-nachbereiten.mjs die Datei wieder. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const q = await inhaltsquelle();
  const leistungen = await q.getLeistungen();
  const seiten = [pfade.start, pfade.leistungen, ...leistungen.map((l) => pfade.leistung(l.slug)), pfade.ueber, pfade.kontakt, pfade.impressum, pfade.datenschutz];
  return seiten.map((p) => ({ url: `${siteUrl}${p}` }));
}
