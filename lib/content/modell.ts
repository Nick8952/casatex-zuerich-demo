import { z } from "zod";

/**
 * Das eine Domainmodell der Website. Komponenten kennen nur diese Typen.
 * Beide Inhaltsquellen (lokale JSON-Dateien, später Sanity) normalisieren in dieses Modell und werden beim Build
 * gegen diese Schemas geprüft: fehlerhafte Inhalte brechen den Build mit einer klaren Meldung ab.
 *
 * Zwei Arten von Inhalt werden bewusst getrennt:
 *  - UNTERNEHMENSAUSSAGEN (Typ `Aussage`): alles, was etwas über die Casatex Zürich AG behauptet. Jede Aussage trägt ihre
 *    Herkunft (Quelle, Abrufdatum, Art) und den Freigabestand. Verzeichniseinträge sind als Herkunft nicht zugelassen.
 *  - MATERIALKUNDE (Typ `Material`): allgemeine Information über Materialien, ohne Aussage über das Angebot des Betriebs.
 */

/** Zugelassene Herkunftsarten für Unternehmensaussagen. «Verzeichnis» fehlt absichtlich. */
export const HERKUNFT_ARTEN = ["amtlich", "verband", "behoerdenportal", "eigene-quelle"] as const;
export const herkunftSchema = z.object({
  quelle: z.string().min(3),
  url: z.url().optional(),
  abgerufen: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Datum als JJJJ-MM-TT"),
  art: z.enum(HERKUNFT_ARTEN),
});
export type Herkunft = z.infer<typeof herkunftSchema>;

/** «demo»: für die Verkaufs-Demo belegt. «live»: zusätzlich vom Unternehmen für den Produktivbetrieb freigegeben. */
export const freigabeSchema = z.enum(["demo", "live"]);
export type Freigabe = z.infer<typeof freigabeSchema>;

export const linkSchema = z.object({ text: z.string().min(1), ziel: z.string().min(1) });
export type Link = z.infer<typeof linkSchema>;

const varianteSchema = z.object({ breite: z.number().int().positive(), url: z.string().min(1) });
export const bildSchema = z.object({
  /** Alternativtext; leer nur bei rein dekorativen Bildern */
  alt: z.string(),
  breite: z.number().int().positive(),
  hoehe: z.number().int().positive(),
  quellen: z.object({ avif: z.array(varianteSchema), webp: z.array(varianteSchema).min(1) }),
  /** true = Materialbeispiel, kein Bild eines Casatex-Projekts. Wird sichtbar gekennzeichnet. */
  symbolbild: z.boolean(),
  legende: z.string().optional(),
  nachweis: z.object({ urheber: z.string(), quelle: z.string(), lizenz: z.string() }).optional(),
});
export type Bild = z.infer<typeof bildSchema>;

// ── Fliesstext ─────────────────────────────────────────────────────────────
const inlineSchema = z.union([z.string(), z.object({ text: z.string(), fett: z.boolean().optional(), link: z.string().optional() })]);
export type Inline = z.infer<typeof inlineSchema>;
export const blockSchema = z.discriminatedUnion("art", [
  z.object({ art: z.literal("absatz"), inhalt: z.array(inlineSchema) }),
  z.object({ art: z.literal("titel"), stufe: z.union([z.literal(2), z.literal(3)]), text: z.string().min(1), anker: z.string().optional() }),
  z.object({ art: z.literal("liste"), punkte: z.array(z.array(inlineSchema)).min(1) }),
]);
export type Block = z.infer<typeof blockSchema>;

// ── Unternehmensaussagen ───────────────────────────────────────────────────
export const aussageSchema = z.object({
  _key: z.string().min(1),
  titel: z.string().min(1),
  text: z.string().min(1),
  link: linkSchema.optional(),
  herkunft: z.array(herkunftSchema).min(1, "Jede Unternehmensaussage braucht mindestens eine Quelle."),
  freigabe: freigabeSchema,
});
export type Aussage = z.infer<typeof aussageSchema>;

// ── Materialkunde (allgemein) ──────────────────────────────────────────────
export const MATERIAL_GRUPPEN = ["holz", "textil", "elastisch", "weitere"] as const;
export const VERLEGEMUSTER = ["schiffsboden", "englisch", "fischgrat", "wuerfel"] as const;
export type VerlegemusterArt = (typeof VERLEGEMUSTER)[number];
export const materialSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  titel: z.string().min(1),
  gruppe: z.enum(MATERIAL_GRUPPEN),
  /** Ein Satz für Übersichten und Handmuster */
  kurz: z.string().min(1),
  abschnitte: z.array(z.object({ _key: z.string(), titel: z.string(), text: z.string() })).min(1),
  eigenschaften: z.array(z.string()),
  bild: bildSchema.optional(),
  /** Nur Parkett: gezeichnete Verlegemuster mit Erklärung */
  muster: z.array(z.object({ _key: z.string(), art: z.enum(VERLEGEMUSTER), titel: z.string(), text: z.string() })).optional(),
  reihenfolge: z.number(),
});
export type Material = z.infer<typeof materialSchema>;

// ── Leistungsbereiche ──────────────────────────────────────────────────────
export const leistungSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  titel: z.string().min(1),
  kurztitel: z.string().min(1),
  /** Ein Satz für die Übersicht («Diele») */
  kurz: z.string().min(1),
  /** Einleitung der Detailseite (allgemein formuliert) */
  einleitung: z.string().min(1),
  /** Was über den Betrieb in diesem Bereich belegt ist */
  aussagen: z.array(aussageSchema).min(1),
  bild: bildSchema,
  /** Textur der Bodenfläche im Seitenkopf */
  boden: bildSchema,
  materialien: z.array(materialSchema).min(1),
  /** Allgemeine Punkte, die vor der Materialwahl zu klären sind */
  fragen: z.array(z.object({ _key: z.string(), titel: z.string(), text: z.string() })),
  seoTitel: z.string().optional(),
  seoBeschreibung: z.string().optional(),
  reihenfolge: z.number(),
});
export type Leistung = z.infer<typeof leistungSchema>;

// ── Optionale Bereiche (erscheinen erst mit Inhalt) ────────────────────────
export const referenzSchema = z.object({
  _key: z.string(),
  titel: z.string().min(1),
  ort: z.string().optional(),
  jahr: z.string().optional(),
  text: z.string().min(1),
  bild: bildSchema.optional(),
  herkunft: z.array(herkunftSchema).min(1),
  freigabe: freigabeSchema,
});
export type Referenz = z.infer<typeof referenzSchema>;
export const partnerSchema = z.object({
  _key: z.string(),
  name: z.string().min(1),
  art: z.enum(["marke", "verband", "partner"]),
  url: z.string().optional(),
  logo: bildSchema.optional(),
  herkunft: z.array(herkunftSchema).min(1),
  freigabe: freigabeSchema,
});
export type Partner = z.infer<typeof partnerSchema>;

// ── Einstellungen ──────────────────────────────────────────────────────────
export const einstellungenSchema = z.object({
  firma: z.string().min(1),
  kurzname: z.string().min(1),
  claim: z.string().min(1),
  rechtsform: z.string().min(1),
  uid: z.string().regex(/^CHE-\d{3}\.\d{3}\.\d{3}$/),
  adresse: z.object({ strasse: z.string(), plz: z.string(), ort: z.string(), quartier: z.string().optional(), land: z.string() }),
  telefon: z.string().min(1),
  email: z.email(),
  routenlink: z.string().startsWith("https://"),
  /** Leer = nicht bestätigt: der Abschnitt Öffnungszeiten erscheint dann nirgends, auch nicht in den strukturierten Daten. */
  oeffnungszeiten: z.array(z.object({ _key: z.string(), tage: z.string(), zeiten: z.string() })),
  oeffnungszeitenHinweis: z.string().optional(),
  logo: bildSchema,
  seoBild: bildSchema,
  herkunft: z.array(herkunftSchema).min(1),
});
export type Einstellungen = z.infer<typeof einstellungenSchema>;

// ── Wiederkehrende Texte (Navigation, Footer, Formular, Einwilligung) ──────
export const texteSchema = z.object({
  demoHinweis: z.string(),
  navigation: z.array(linkSchema).min(1),
  kopf: z.object({ aufruf: linkSchema, telefonLabel: z.string(), registerKnopf: z.string(), registerTitel: z.string(), registerText: z.string(), menueKnopf: z.string(), schliessen: z.string(), materialkundeLink: linkSchema }),
  footer: z.object({ leitsatz: z.string(), kontaktTitel: z.string(), seitenTitel: z.string(), rechtlichesTitel: z.string(), rechtliches: z.array(linkSchema), route: z.string(), bildnachweis: linkSchema, copyright: z.string(), demoHinweis: z.string() }),
  ui: z.object({ zumInhalt: z.string(), symbolbild: z.string(), materialinfo: z.string(), mehrErfahren: z.string(), zurUebersicht: z.string(), weitereBereiche: z.string(), telefon: z.string(), email: z.string(), adresse: z.string(), quellen: z.string(), aussagenTitel: z.string(), materialkundeTitel: z.string(), fragenTitel: z.string(), fragenText: z.string(), zumBereich: z.string(), nichtGefundenTitel: z.string(), nichtGefundenText: z.string(), nichtGefundenLink: linkSchema }),
  formular: z.object({
    titel: z.string(), einleitung: z.string(), name: z.string(), email: z.string(), telefon: z.string(), anliegen: z.string(),
    anliegenOptionen: z.array(z.object({ wert: z.string(), titel: z.string() })).min(1),
    nachricht: z.string(), nachrichtHilfe: z.string(), pflicht: z.string(), datenschutzHinweis: z.string(), datenschutzLink: linkSchema,
    absenden: z.string(), hinweisNachher: z.string(), kopieren: z.string(), kopiert: z.string(), kopierenFehler: z.string(), betreff: z.string(),
    fehlerName: z.string(), fehlerEmail: z.string(), fehlerNachricht: z.string(), ohneJavascript: z.string(),
  }),
  einwilligung: z.object({
    fussLink: z.string(), ruhendTitel: z.string(), ruhendText: z.string(),
    bannerTitel: z.string(), bannerText: z.string(), alleAkzeptieren: z.string(), nurNotwendige: z.string(), einstellungen: z.string(),
    auswahlSpeichern: z.string(), widerrufen: z.string(), notwendigTitel: z.string(), notwendigText: z.string(), datenschutzerklaerung: z.string(),
    /** Leer = keine einwilligungspflichtigen Dienste: kein Banner. Mit Einträgen wird der Banner aktiv. */
    kategorien: z.array(z.object({ kennung: z.string().regex(/^[a-z]+$/), titel: z.string(), beschreibung: z.string() })),
  }),
  seo: z.object({ titelZusatz: z.string(), beschreibung: z.string() }),
});
export type Texte = z.infer<typeof texteSchema>;

// ── Seiten ─────────────────────────────────────────────────────────────────
const seoSchema = { seoTitel: z.string().optional(), seoBeschreibung: z.string().optional() };

export const bodenwahlSchema = z.object({ _key: z.string(), titel: z.string().min(1), bild: bildSchema, kachelbreite: z.number().int().positive() });
export type Bodenwahl = z.infer<typeof bodenwahlSchema>;

export const startseiteSchema = z.object({
  hero: z.object({ titel: z.string().min(1), text: z.string().min(1), knopf: linkSchema, zweiterKnopf: linkSchema, wechselTitel: z.string(), imBild: z.string(), boeden: z.array(bodenwahlSchema).min(1) }),
  leistungen: z.object({ titel: z.string(), text: z.string() }),
  materialien: z.object({ titel: z.string(), text: z.string(), link: linkSchema, bild: bildSchema }),
  ueber: z.object({ titel: z.string(), text: z.string(), link: linkSchema }),
  referenzen: z.object({ titel: z.string(), text: z.string() }),
  partner: z.object({ titel: z.string(), text: z.string() }),
  kontakt: z.object({ titel: z.string(), text: z.string() }),
  ...seoSchema,
});
export type Startseite = z.infer<typeof startseiteSchema>;

export const leistungenSeiteSchema = z.object({
  titel: z.string().min(1), einleitung: z.string().min(1), bild: bildSchema,
  bereicheTitel: z.string(), materialkundeTitel: z.string(), materialkundeText: z.string(),
  gruppen: z.array(z.object({ kennung: z.enum(MATERIAL_GRUPPEN), titel: z.string(), text: z.string() })),
  aufruf: z.object({ titel: z.string(), text: z.string(), knopf: linkSchema }),
  ...seoSchema,
});
export type LeistungenSeite = z.infer<typeof leistungenSeiteSchema>;

export const ueberSeiteSchema = z.object({
  titel: z.string().min(1), einleitung: z.string().min(1), bild: bildSchema,
  aussagenTitel: z.string(), aussagen: z.array(aussageSchema).min(1),
  zweck: z.object({ titel: z.string(), zitat: z.string(), text: z.string(), herkunft: z.array(herkunftSchema).min(1), freigabe: freigabeSchema }),
  aufruf: z.object({ titel: z.string(), text: z.string(), knopf: linkSchema }),
  ...seoSchema,
});
export type UeberSeite = z.infer<typeof ueberSeiteSchema>;

export const kontaktSeiteSchema = z.object({
  titel: z.string().min(1), einleitung: z.string().min(1),
  direktTitel: z.string(), anfahrtTitel: z.string(), anfahrtText: z.string(), oeffnungszeitenTitel: z.string(),
  ...seoSchema,
});
export type KontaktSeite = z.infer<typeof kontaktSeiteSchema>;

export const rechtSeiteSchema = z.object({
  slug: z.enum(["impressum", "datenschutz"]),
  titel: z.string().min(1), einleitung: z.string().optional(), stand: z.string().min(1),
  bloecke: z.array(blockSchema).min(1),
  ...seoSchema,
});
export type RechtSeite = z.infer<typeof rechtSeiteSchema>;

// ── Schnittstelle der Inhaltsquellen ───────────────────────────────────────
export interface Inhaltsquelle {
  getEinstellungen(): Promise<Einstellungen>;
  getTexte(): Promise<Texte>;
  getStartseite(): Promise<Startseite>;
  getLeistungen(): Promise<Leistung[]>;
  getLeistung(slug: string): Promise<Leistung | null>;
  getMaterialien(): Promise<Material[]>;
  getLeistungenSeite(): Promise<LeistungenSeite>;
  getUeberSeite(): Promise<UeberSeite>;
  getKontaktSeite(): Promise<KontaktSeite>;
  getRechtSeite(slug: "impressum" | "datenschutz"): Promise<RechtSeite>;
  getReferenzen(): Promise<Referenz[]>;
  getPartner(): Promise<Partner[]>;
  /** Alle Bilder mit Nachweis, für den Bildnachweis im Impressum */
  getBildnachweise(): Promise<{ titel: string; urheber: string; quelle: string; lizenz: string }[]>;
}

// ── Pfade ──────────────────────────────────────────────────────────────────
// Liegen in einer eigenen Datei ohne zod, damit Client-Komponenten sie einbinden können, ohne die Schemas mitzuladen.
export { LEISTUNGEN_BASIS, pfade } from "./pfade";

/** Prüft Daten gegen ein Schema und meldet Fehler mit Fundstelle, damit der Build verständlich abbricht. */
export function pruefen<T>(schema: z.ZodType<T>, daten: unknown, wo: string): T {
  const ergebnis = schema.safeParse(daten);
  if (ergebnis.success) return ergebnis.data;
  const zeilen = ergebnis.error.issues.slice(0, 12).map((i) => `  - ${i.path.join(".") || "(Wurzel)"}: ${i.message}`);
  throw new Error(`Inhalt ungültig (${wo}):\n${zeilen.join("\n")}`);
}
