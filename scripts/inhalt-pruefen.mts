// Prüft die lokalen Inhalte über das Schema hinaus (das Schema selbst prüft lib/content/local.ts beim Laden):
//  - Schweizer Schreibweise (kein «ß»), keine Gedankenstriche, keine geraden Anführungszeichen als Zitatzeichen
//  - keine unbelegten Behauptungen (Preise, Garantien, Jahreszahlen, Zertifikate, Ausstellung, Antwortzeiten)
//  - alle Linkziele erlaubt, interne Ziele und Sprungmarken vorhanden
//  - ein Ziel, eine Beschriftung: Knöpfe zur Kontaktseite heissen überall gleich
//  - Einstieg: Titel kurz, Text höchstens 20 Wörter
//  - Bilder: Alternativtext vorhanden, Materialbeispiele mit Bildnachweis
//  - Unternehmensaussagen: Quelle mit Adresse; mit --live zusätzlich: alles vom Unternehmen freigegeben?
// Aufruf: npm run inhalt:pruefen   ·   vor dem Go-Live: npm run inhalt:pruefen -- --live
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { lokaleQuelle } from "../lib/content/local";
import { pfade, type Aussage } from "../lib/content/modell";
import { istErlaubtesLinkziel } from "../lib/assets";

const live = process.argv.includes("--live");
const fehler: string[] = [];
const hinweise: string[] = [];
const q = lokaleQuelle;
const [e, t, start, leistungen, materialien, lSeite, ueber, kontakt, impressum, datenschutz, referenzen, partner] = await Promise.all([
  q.getEinstellungen(), q.getTexte(), q.getStartseite(), q.getLeistungen(), q.getMaterialien(), q.getLeistungenSeite(), q.getUeberSeite(), q.getKontaktSeite(),
  q.getRechtSeite("impressum"), q.getRechtSeite("datenschutz"), q.getReferenzen(), q.getPartner(),
]);
const alles = { e, t, start, leistungen, materialien, lSeite, ueber, kontakt, impressum, datenschutz, referenzen, partner };

// ── alle Zeichenketten und Links einsammeln ────────────────────────────────
type Fund = { pfad: string; text: string };
const texte: Fund[] = [];
const links: { pfad: string; ziel: string; text?: string }[] = [];
function gehen(wert: unknown, pfad: string) {
  if (typeof wert === "string") { texte.push({ pfad, text: wert }); return; }
  if (Array.isArray(wert)) { wert.forEach((v, i) => gehen(v, `${pfad}[${i}]`)); return; }
  if (wert && typeof wert === "object") {
    const o = wert as Record<string, unknown>;
    if (typeof o.ziel === "string") links.push({ pfad, ziel: o.ziel, text: typeof o.text === "string" ? o.text : undefined });
    if (typeof o.link === "string") links.push({ pfad, ziel: o.link, text: typeof o.text === "string" ? o.text : undefined });
    for (const [k, v] of Object.entries(o)) {
      if (k === "quellen" || k === "nachweis" || k === "url" || k === "herkunft") continue; // Dateipfade und Quellenangaben sind keine Seitentexte
      gehen(v, `${pfad}.${k}`);
    }
  }
}
for (const [name, wert] of Object.entries(alles)) gehen(wert, name);

// ── Schreibweise ───────────────────────────────────────────────────────────
for (const { pfad, text } of texte) {
  if (text.includes("ß")) fehler.push(`${pfad}: «ß» gefunden (Schweizer Schreibweise verlangt «ss»): ${text.slice(0, 60)}`);
  if (/[—–]/.test(text)) fehler.push(`${pfad}: Gedankenstrich gefunden (Satz umstellen oder Bindestrich verwenden): ${text.slice(0, 60)}`);
  if (/(^|\s)"[^"]+"/.test(text)) fehler.push(`${pfad}: gerade Anführungszeichen (stattdessen «…»): ${text.slice(0, 60)}`);
  if (/\s{2,}/.test(text.trim())) fehler.push(`${pfad}: doppelte Leerzeichen: ${text.slice(0, 60)}`);
}

// ── Unbelegte Behauptungen ─────────────────────────────────────────────────
// Rechtsseiten und technische Texte sind ausgenommen; geprüft werden die Inhalte, die etwas über den Betrieb oder das Angebot sagen.
const VERBOTEN: [RegExp, string][] = [
  [/kostenlos|gratis|unverbindliche[rs]? (Offerte|Beratung)/i, "kostenlose/unverbindliche Leistung"],
  [/garantie|garantiert/i, "Garantie"],
  [/seit (über )?\d+ Jahren|Jahre Erfahrung|seit (19|20)\d\d|gegründet/i, "Firmengeschichte oder Erfahrung in Jahren"],
  [/zertifiziert|Zertifikat|ausgezeichnet/i, "Zertifizierung oder Auszeichnung"],
  [/Ausstellung|Showroom/i, "Ausstellung"],
  [/innert \d+|innerhalb von \d+|24 Stunden/i, "zugesagte Frist"],
  [/Mitarbeitende[n]? zählen|\d+ Mitarbeit/i, "Mitarbeiterzahl"],
  [/\bCHF\b|\bFr\.\s?\d|\d+ Franken/, "Preis"],
  [/marktführend|\bführende[rn]? |Nr\. ?1\b|\b(der|die|das|unsere) beste[nr]? /i, "Superlativ"],
];
for (const { pfad, text } of texte) {
  if (/^(impressum|datenschutz|t\.einwilligung|t\.formular)/.test(pfad)) continue;
  for (const [muster, was] of VERBOTEN) if (muster.test(text)) fehler.push(`${pfad}: unbelegte Behauptung (${was}): «${text.slice(0, 80)}»`);
}

// ── Links ──────────────────────────────────────────────────────────────────
const seiten = new Set<string>([pfade.start, pfade.leistungen, pfade.ueber, pfade.kontakt, pfade.impressum, pfade.datenschutz, ...leistungen.map((l) => pfade.leistung(l.slug))]);
const anker: Record<string, Set<string>> = {
  [pfade.leistungen]: new Set(["materialkunde", ...materialien.map((m) => `material-${m.slug}`)]),
  [pfade.impressum]: new Set(impressum.bloecke.flatMap((b) => (b.art === "titel" && b.anker ? [b.anker] : []))),
  [pfade.datenschutz]: new Set(datenschutz.bloecke.flatMap((b) => (b.art === "titel" && b.anker ? [b.anker] : []))),
};
for (const l of links) {
  if (!istErlaubtesLinkziel(l.ziel)) { fehler.push(`${l.pfad}: Linkziel nicht erlaubt: ${l.ziel}`); continue; }
  if (!l.ziel.startsWith("/")) continue;
  const [seite, marke] = l.ziel.split("#");
  if (!seiten.has(seite)) fehler.push(`${l.pfad}: interne Seite gibt es nicht: ${l.ziel}`);
  else if (marke && !anker[seite]?.has(marke)) fehler.push(`${l.pfad}: Sprungmarke gibt es nicht: ${l.ziel}`);
}
// Ein Ziel, eine Beschriftung (Kontaktseite): Navigation und Fusszeile nennen den Seitennamen, alle Knöpfe den einen Aufruf.
const aufruf = t.kopf.aufruf;
for (const l of links) {
  if (l.ziel !== aufruf.ziel || !l.text) continue;
  if (/^t\.(navigation|footer)/.test(l.pfad)) continue;
  if (l.text !== aufruf.text) fehler.push(`${l.pfad}: Knopf zur Kontaktseite heisst «${l.text}», überall sonst «${aufruf.text}»`);
}
const materialLinks = [start.hero.zweiterKnopf, start.materialien.link, t.kopf.materialkundeLink];
if (new Set(materialLinks.map((l) => l.text)).size > 1) fehler.push(`Links zur Materialkunde heissen unterschiedlich: ${materialLinks.map((l) => `«${l.text}»`).join(", ")}`);

// ── Einstieg ───────────────────────────────────────────────────────────────
const woerter = start.hero.text.trim().split(/\s+/).length;
if (woerter > 20) fehler.push(`start.hero.text: ${woerter} Wörter (höchstens 20, damit der Einstieg auf einen Blick lesbar bleibt)`);
if (start.hero.titel.length > 34) fehler.push(`start.hero.titel: ${start.hero.titel.length} Zeichen (höchstens 34, sonst bricht der Titel auf mehr als zwei Zeilen)`);

// ── Bilder ─────────────────────────────────────────────────────────────────
const verzeichnis = JSON.parse(readFileSync("data/bilder.json", "utf8")) as Record<string, { alt: string; symbolbild: boolean; nachweis?: { urheber?: string; quelle?: string; lizenz?: string }; quellen: { avif: { url: string }[]; webp: { url: string }[] } }>;
const vorhanden = new Set(readdirSync("public/bilder"));
for (const [id, b] of Object.entries(verzeichnis)) {
  if (!b.alt.trim()) fehler.push(`Bild «${id}»: Alternativtext fehlt`);
  if (!b.nachweis?.urheber || !b.nachweis.quelle || !b.nachweis.lizenz) fehler.push(`Bild «${id}»: Bildnachweis unvollständig`);
  for (const v of [...b.quellen.avif, ...b.quellen.webp]) if (!vorhanden.has(path.basename(v.url))) fehler.push(`Bild «${id}»: Datei fehlt in public/bilder: ${v.url} (npm run bilder)`);
}

// Jedes Bild im Verzeichnis wird auch gezeigt (sonst stünde es zu Unrecht im Bildnachweis und würde unnötig ausgeliefert)
const rohInhalte = ["einstellungen", "startseite", "leistungen", "materialien", "seiten/leistungen", "seiten/ueber-casatex"].map((d) => readFileSync(`data/${d}.json`, "utf8")).join("\n");
for (const id of Object.keys(verzeichnis)) if (!rohInhalte.includes(`"${id}"`)) fehler.push(`Bild «${id}» wird nirgends verwendet: aus scripts/bilder-liste.json entfernen oder einsetzen`);

// ── Unternehmensaussagen ───────────────────────────────────────────────────
const aussagen: { wo: string; a: Pick<Aussage, "titel" | "herkunft" | "freigabe"> }[] = [
  ...leistungen.flatMap((l) => l.aussagen.map((a) => ({ wo: `Leistung «${l.slug}»`, a }))),
  ...ueber.aussagen.map((a) => ({ wo: "Über Casatex", a })),
  { wo: "Über Casatex", a: { titel: ueber.zweck.titel, herkunft: ueber.zweck.herkunft, freigabe: ueber.zweck.freigabe } },
  ...referenzen.map((r) => ({ wo: "Referenzen", a: { titel: r.titel, herkunft: r.herkunft, freigabe: r.freigabe } })),
  ...partner.map((p) => ({ wo: "Partner", a: { titel: p.name, herkunft: p.herkunft, freigabe: p.freigabe } })),
];
for (const { wo, a } of aussagen) {
  for (const h of a.herkunft) if (!h.url) fehler.push(`${wo}, «${a.titel}»: Quelle «${h.quelle}» ohne Adresse`);
}
const offen = aussagen.filter(({ a }) => a.freigabe !== "live");
if (live) {
  for (const { wo, a } of offen) fehler.push(`Noch nicht vom Unternehmen freigegeben: ${wo}, «${a.titel}»`);
  if (!e.oeffnungszeiten.length) hinweise.push("Öffnungszeiten sind leer: Abschnitt erscheint nicht. Beim Unternehmen erfragen.");
  if (/Nick Holzbecher/.test(JSON.stringify(impressum))) fehler.push("Impressum nennt noch den Betreiber der Demo: für den Produktivbetrieb neu schreiben.");
  if (/GitHub/.test(JSON.stringify(datenschutz))) fehler.push("Datenschutzerklärung beschreibt noch GitHub Pages: an das produktive Hosting anpassen.");
} else if (offen.length) {
  hinweise.push(`${offen.length} Unternehmensaussagen sind für die Demo belegt, aber noch nicht vom Unternehmen freigegeben (Liste: npm run inhalt:pruefen -- --live).`);
}

for (const h of hinweise) console.log(`· ${h}`);
if (fehler.length) {
  console.error(`✗ ${fehler.length} Problem(e) in den Inhalten:\n` + fehler.map((f) => `  - ${f}`).join("\n"));
  process.exit(1);
}
console.log(`✓ Inhalte in Ordnung: ${texte.length} Texte, ${links.length} Links, ${Object.keys(verzeichnis).length} Bilder, ${aussagen.length} Unternehmensaussagen mit Quelle${live ? ", alle freigegeben" : ""}.`);
