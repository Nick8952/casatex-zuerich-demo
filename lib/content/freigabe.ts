import type { Block, Inhaltsquelle } from "./modell";

const blockText = (b: Block): string => (b.art === "titel" ? b.text : b.art === "liste" ? b.punkte.flat().map((t) => (typeof t === "string" ? t : t.text)).join(" ") : b.inhalt.map((t) => (typeof t === "string" ? t : t.text)).join(""));

/**
 * Was vor dem Go-Live noch offen ist, gelesen aus der Inhaltsquelle, die der Build tatsächlich verwendet (lokal oder Sanity):
 *  - Unternehmensaussagen und Seitenbelege, die das Unternehmen noch nicht freigegeben hat (`freigabe` ist nicht «live»)
 *  - Rechtstexte, die noch die Demo beschreiben
 * Die Liste benutzt `npm run inhalt:pruefen -- --live`, und der Build bricht mit ihr ab, sobald INDEXIERUNG=1 für eine echte
 * Domain gesetzt ist: Eine indexierbare Website mit unbestätigten Aussagen kann so nicht entstehen.
 */
export async function offeneFreigaben(q: Inhaltsquelle): Promise<string[]> {
  const [start, leistungen, leistungenSeite, ueber, referenzen, partner, impressum, datenschutz] = await Promise.all([
    q.getStartseite(), q.getLeistungen(), q.getLeistungenSeite(), q.getUeberSeite(), q.getReferenzen(), q.getPartner(), q.getRechtSeite("impressum"), q.getRechtSeite("datenschutz"),
  ]);
  const offen: string[] = [];
  const pruefe = (wo: string, titel: string, freigabe: string) => { if (freigabe !== "live") offen.push(`Noch nicht vom Unternehmen freigegeben: ${wo}, «${titel}»`); };
  pruefe("Startseite", "Texte im Einstieg und in den Abschnitten", start.belege.freigabe);
  pruefe("Leistungen und Materialien", "Einleitung", leistungenSeite.belege.freigabe);
  pruefe("Über Casatex", "Einleitung", ueber.belege.freigabe);
  for (const l of leistungen) for (const a of l.aussagen) pruefe(`Leistung «${l.slug}»`, a.titel, a.freigabe);
  for (const a of ueber.aussagen) pruefe("Über Casatex", a.titel, a.freigabe);
  pruefe("Über Casatex", ueber.zweck.titel, ueber.zweck.freigabe);
  for (const r of referenzen) pruefe("Referenzen", r.titel, r.freigabe);
  for (const p of partner) pruefe("Partner", p.name, p.freigabe);
  if (impressum.bloecke.some((b) => /\bDemo\b/.test(blockText(b)))) offen.push("Das Impressum beschreibt noch die Demo (Betreiber, Zweck): für den Produktivbetrieb neu schreiben.");
  if (datenschutz.bloecke.some((b) => /\bDemo\b|GitHub Pages/.test(blockText(b)))) offen.push("Die Datenschutzerklärung beschreibt noch die Demo auf GitHub Pages: an das produktive Hosting anpassen.");
  return offen;
}
