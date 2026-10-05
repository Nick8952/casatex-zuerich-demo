import "server-only";
import { createClient, type SanityClient } from "@sanity/client";
import { z } from "zod";
import {
  einstellungenSchema, kontaktSeiteSchema, leistungSchema, leistungenSeiteSchema, materialSchema, partnerSchema, pruefen, rechtSeiteSchema,
  referenzSchema, startseiteSchema, texteSchema, ueberSeiteSchema,
  type Bild, type Block, type Inhaltsquelle, type Inline,
} from "./modell";

/**
 * Sanity-Inhaltsquelle, VORBEREITET (es existiert noch kein Sanity-Projekt).
 *
 * Wird nur geladen, wenn CONTENT_SOURCE=sanity gesetzt ist. Sie liest beim Build die veröffentlichten Dokumente,
 * überführt sie in das Domainmodell (lib/content/modell.ts) und prüft sie gegen dieselben Schemas wie die lokalen Inhalte.
 * Die Website bleibt ein statischer Export: Änderungen in Sanity werden sichtbar, sobald ein neuer Build gelaufen ist
 * (Webhook → Vercel-Deploy-Hook, siehe docs/SANITY-VERCEL-EINRICHTUNG.md).
 *
 * Die Dokumenttypen und Felder entsprechen studio/schemas/. Der Import der lokalen Inhalte: scripts/seed.mts.
 */
let client: SanityClient | null = null;
function sanity(): SanityClient {
  if (client) return client;
  const projectId = (process.env.SANITY_PROJECT_ID ?? "").trim();
  const dataset = (process.env.SANITY_DATASET ?? "").trim();
  if (!/^[a-z0-9]{8,}$/.test(projectId) || !dataset) {
    throw new Error("CONTENT_SOURCE=sanity verlangt SANITY_PROJECT_ID und SANITY_DATASET (siehe .env.example). Ohne diese Angaben baut die Website mit den lokalen Inhalten: CONTENT_SOURCE weglassen.");
  }
  const token = process.env.SANITY_API_READ_TOKEN?.trim() || undefined;
  client = createClient({ projectId, dataset, apiVersion: "2025-02-19", useCdn: false, perspective: "published", token });
  return client;
}

// ── Abfragen (GROQ) ────────────────────────────────────────────────────────
const BILD = `{ alt, legende, symbolbild, nachweis, "url": asset->url, "breite": asset->metadata.dimensions.width, "hoehe": asset->metadata.dimensions.height }`;
const HERKUNFT = `herkunft[]{ quelle, url, abgerufen, art }`;
const AUSSAGE = `{ _key, titel, text, link, ${HERKUNFT}, freigabe }`;
const MATERIAL = `{ "slug": slug.current, titel, gruppe, kurz, abschnitte[]{ _key, titel, text }, eigenschaften, "bild": bild${BILD}, muster[]{ _key, art, titel, text }, reihenfolge }`;
const ABFRAGEN = {
  einstellungen: `*[_type == "einstellungen"][0]{ firma, kurzname, claim, rechtsform, uid, adresse, telefon, email, routenlink, oeffnungszeiten[]{ _key, tage, zeiten }, oeffnungszeitenHinweis, "logo": logo${BILD}, "seoBild": seoBild${BILD}, ${HERKUNFT} }`,
  texte: `*[_type == "texte"][0]{ demoHinweis, navigation, kopf, footer, ui, formular, einwilligung, seo }`,
  startseite: `*[_type == "startseite"][0]{ hero{ titel, text, knopf, zweiterKnopf, wechselTitel, imBild, boeden[]{ _key, titel, kachelbreite, "bild": bild${BILD} } }, leistungen, materialien{ titel, text, link, "bild": bild${BILD} }, ueber, referenzen, partner, kontakt, seoTitel, seoBeschreibung }`,
  leistungen: `*[_type == "leistung"] | order(reihenfolge asc){ "slug": slug.current, titel, kurztitel, kurz, einleitung, aussagen[]${AUSSAGE}, "bild": bild${BILD}, "boden": boden${BILD}, "materialien": materialien[]->${MATERIAL}, fragen[]{ _key, titel, text }, seoTitel, seoBeschreibung, reihenfolge }`,
  materialien: `*[_type == "material"] | order(reihenfolge asc)${MATERIAL}`,
  leistungenSeite: `*[_type == "leistungenSeite"][0]{ titel, einleitung, "bild": bild${BILD}, bereicheTitel, materialkundeTitel, materialkundeText, gruppen[]{ kennung, titel, text }, aufruf, seoTitel, seoBeschreibung }`,
  ueberSeite: `*[_type == "ueberSeite"][0]{ titel, einleitung, "bild": bild${BILD}, aussagenTitel, aussagen[]${AUSSAGE}, zweck{ titel, zitat, text, ${HERKUNFT}, freigabe }, aufruf, seoTitel, seoBeschreibung }`,
  kontaktSeite: `*[_type == "kontaktSeite"][0]{ titel, einleitung, direktTitel, anfahrtTitel, anfahrtText, oeffnungszeitenTitel, seoTitel, seoBeschreibung }`,
  rechtSeite: `*[_type == "rechtSeite" && slug.current == $slug][0]{ "slug": slug.current, titel, einleitung, stand, inhalt, seoTitel, seoBeschreibung }`,
  referenzen: `*[_type == "referenz"] | order(reihenfolge asc){ "_key": _id, titel, ort, jahr, text, "bild": bild${BILD}, ${HERKUNFT}, freigabe }`,
  partner: `*[_type == "partner"] | order(reihenfolge asc){ "_key": _id, name, art, url, "logo": logo${BILD}, ${HERKUNFT}, freigabe }`,
  bildnachweise: `*[defined(bild.nachweis.quelle)]{ "titel": coalesce(bild.legende, bild.alt), "urheber": bild.nachweis.urheber, "quelle": bild.nachweis.quelle, "lizenz": bild.nachweis.lizenz }`,
} as const;

// ── Normalisierung ─────────────────────────────────────────────────────────
type RohBild = { url?: string | null; breite?: number | null; hoehe?: number | null; alt?: string | null; legende?: string | null; symbolbild?: boolean | null; nachweis?: Bild["nachweis"] | null };
const BREITEN = [480, 960, 1600];

function istRohBild(w: unknown): w is RohBild {
  return typeof w === "object" && w !== null && "url" in w && "breite" in w && "hoehe" in w;
}

/** Sanity-Bild → Bild des Domainmodells. Die Varianten liefert das Sanity-CDN als WebP in festen Breiten (nie grösser als das Original). */
function bild(roh: RohBild): Bild | undefined {
  if (!roh.url || !roh.breite || !roh.hoehe) return undefined;
  const breiten = [...new Set(BREITEN.map((b) => Math.min(b, roh.breite as number)))];
  return {
    alt: roh.alt ?? "",
    breite: breiten[breiten.length - 1],
    hoehe: Math.round((breiten[breiten.length - 1] / roh.breite) * roh.hoehe),
    quellen: { avif: [], webp: breiten.map((b) => ({ breite: b, url: `${roh.url}?w=${b}&fm=webp&q=75` })) },
    symbolbild: roh.symbolbild === true,
    legende: roh.legende ?? undefined,
    nachweis: roh.nachweis ?? undefined,
  };
}

/** Geht die Antwort rekursiv durch: wandelt Bilder um und entfernt null (GROQ liefert null, das Domainmodell kennt nur «fehlt»). */
export function normalisieren(wert: unknown): unknown {
  if (wert === null) return undefined;
  if (Array.isArray(wert)) return wert.map(normalisieren).filter((v) => v !== undefined);
  if (istRohBild(wert)) return bild(wert);
  if (typeof wert === "object") {
    const aus: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(wert as Record<string, unknown>)) {
      const n = normalisieren(v);
      if (n !== undefined) aus[k] = n;
    }
    return aus;
  }
  return wert;
}

// Portable Text (Sanity) → Fliesstext des Domainmodells
type PtSpan = { _type: "span"; text: string; marks?: string[] };
type PtBlock = { _type: string; style?: string; listItem?: string; children?: PtSpan[]; markDefs?: { _key: string; _type: string; href?: string }[] };

function inlineAusPt(b: PtBlock): Inline[] {
  return (b.children ?? []).filter((c) => c._type === "span" && c.text).map((c) => {
    const marks = c.marks ?? [];
    const link = b.markDefs?.find((d) => d._type === "link" && marks.includes(d._key))?.href;
    if (link) return { text: c.text, link };
    if (marks.includes("strong")) return { text: c.text, fett: true };
    return c.text;
  });
}
const anker = (text: string) => text.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function portableTextZuBloecken(pt: PtBlock[]): Block[] {
  const bloecke: Block[] = [];
  for (const b of pt ?? []) {
    if (b._type !== "block") continue;
    const inhalt = inlineAusPt(b);
    if (!inhalt.length) continue;
    if (b.listItem) {
      const letzter = bloecke[bloecke.length - 1];
      if (letzter?.art === "liste") letzter.punkte.push(inhalt);
      else bloecke.push({ art: "liste", punkte: [inhalt] });
    } else if (b.style === "h2" || b.style === "h3") {
      const text = inhalt.map((t) => (typeof t === "string" ? t : t.text)).join("");
      bloecke.push({ art: "titel", stufe: b.style === "h2" ? 2 : 3, text, anker: anker(text) });
    } else {
      bloecke.push({ art: "absatz", inhalt });
    }
  }
  return bloecke;
}

// ── Quelle ─────────────────────────────────────────────────────────────────
const zwischenspeicher = new Map<string, Promise<unknown>>();
/** Jede Abfrage läuft pro Build höchstens einmal. */
function holen(name: keyof typeof ABFRAGEN, parameter: Record<string, string> = {}): Promise<unknown> {
  const schluessel = `${name}:${JSON.stringify(parameter)}`;
  let p = zwischenspeicher.get(schluessel);
  if (!p) {
    p = sanity().fetch(ABFRAGEN[name], parameter).then((roh) => {
      if (roh === null) throw new Error(`Sanity: Dokument «${name}» fehlt oder ist nicht veröffentlicht (Import mit npm run seed, dann im Studio veröffentlichen).`);
      return normalisieren(roh);
    });
    zwischenspeicher.set(schluessel, p);
  }
  return p;
}

export const sanityQuelle: Inhaltsquelle = {
  getEinstellungen: async () => pruefen(einstellungenSchema, await holen("einstellungen"), "Sanity: Einstellungen"),
  getTexte: async () => pruefen(texteSchema, await holen("texte"), "Sanity: Texte"),
  getStartseite: async () => pruefen(startseiteSchema, await holen("startseite"), "Sanity: Startseite"),
  getLeistungen: async () => pruefen(z.array(leistungSchema), await holen("leistungen"), "Sanity: Leistungen"),
  getLeistung: async (slug) => (await sanityQuelle.getLeistungen()).find((l) => l.slug === slug) ?? null,
  getMaterialien: async () => pruefen(z.array(materialSchema), await holen("materialien"), "Sanity: Materialien"),
  getLeistungenSeite: async () => pruefen(leistungenSeiteSchema, await holen("leistungenSeite"), "Sanity: Seite Leistungen"),
  getUeberSeite: async () => pruefen(ueberSeiteSchema, await holen("ueberSeite"), "Sanity: Seite Über Casatex"),
  getKontaktSeite: async () => pruefen(kontaktSeiteSchema, await holen("kontaktSeite"), "Sanity: Seite Kontakt"),
  getRechtSeite: async (slug) => {
    const roh = (await holen("rechtSeite", { slug })) as { inhalt?: PtBlock[] } & Record<string, unknown>;
    const { inhalt, ...rest } = roh;
    return pruefen(rechtSeiteSchema, { ...rest, bloecke: portableTextZuBloecken(inhalt ?? []) }, `Sanity: Rechtsseite «${slug}»`);
  },
  getReferenzen: async () => pruefen(z.array(referenzSchema), await holen("referenzen"), "Sanity: Referenzen"),
  getPartner: async () => pruefen(z.array(partnerSchema), await holen("partner"), "Sanity: Partner"),
  getBildnachweise: async () => {
    const liste = pruefen(z.array(z.object({ titel: z.string(), urheber: z.string(), quelle: z.string(), lizenz: z.string() })), await holen("bildnachweise"), "Sanity: Bildnachweise");
    const gesehen = new Set<string>();
    return liste.filter((n) => (gesehen.has(n.quelle) ? false : (gesehen.add(n.quelle), true)));
  },
};
