import { defineArrayMember, defineField, defineType } from "sanity";

/** Dieselbe Regel wie lib/assets.ts (istErlaubtesLinkziel): interne Seite, Sprungmarke, https, E-Mail oder Telefon. */
export const linkzielErlaubt = (ziel: string | undefined) =>
  !ziel || /^\/(?!\/)/.test(ziel) || /^#[A-Za-z][\w-]*$/.test(ziel) || /^(https:\/\/[^\s]+|mailto:[^\s]+|tel:\+?[\d\s()-]+)$/.test(ziel) ? true : "Erlaubt sind interne Seiten («/kontakt/»), Sprungmarken («#anker»), https://-Adressen, mailto: und tel:.";

/** Schweizer Schreibweise und ruhige Satzzeichen: gilt für alle sichtbaren Texte. */
export const schreibweise = (text: string | undefined) => {
  if (!text) return true;
  if (text.includes("ß")) return "Bitte «ss» statt «ß» schreiben (Schweizer Schreibweise).";
  if (/[—–]/.test(text)) return "Bitte keinen Gedankenstrich verwenden: Satz umstellen oder einen Punkt setzen.";
  return true;
};

export const verweis = defineType({
  name: "verweis",
  title: "Link",
  type: "object",
  fields: [
    defineField({ name: "text", title: "Beschriftung", type: "string", validation: (r) => r.required().custom(schreibweise) }),
    defineField({ name: "ziel", title: "Ziel", type: "string", description: "Interne Seite («/kontakt/»), Sprungmarke («/leistungen/#materialkunde»), https://-Adresse, mailto: oder tel:", validation: (r) => r.required().custom(linkzielErlaubt) }),
  ],
  preview: { select: { title: "text", subtitle: "ziel" } },
});

export const bildMitText = defineType({
  name: "bildMitText",
  title: "Bild",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({ name: "alt", title: "Bildbeschreibung (Alternativtext)", type: "string", description: "Beschreibt, was auf dem Bild zu sehen ist, für Menschen, die es nicht sehen. Zum Beispiel «Fischgratparkett in Eiche, geölt».", validation: (r) => r.required().min(5).custom(schreibweise) }),
    defineField({ name: "legende", title: "Bildlegende", type: "string", description: "Kurzer Text unter dem Bild (optional).", validation: (r) => r.custom(schreibweise) }),
    defineField({ name: "symbolbild", title: "Materialbeispiel (kein eigenes Projekt)", type: "boolean", description: "Eingeschaltet: Das Bild wird sichtbar als «Materialbeispiel, kein Projekt von Casatex» gekennzeichnet. Nur ausschalten, wenn das Bild eine eigene Arbeit oder den eigenen Betrieb zeigt.", initialValue: true }),
    defineField({
      name: "nachweis",
      title: "Bildnachweis",
      type: "object",
      description: "Erscheint im Impressum. Bei eigenen Fotos: Fotografin oder Fotograf und «eigenes Bild».",
      fields: [
        defineField({ name: "urheber", title: "Urheberin oder Urheber", type: "string", validation: (r) => r.required() }),
        defineField({ name: "quelle", title: "Quelle", type: "string", description: "Adresse der Bildquelle oder «eigenes Bild»", validation: (r) => r.required() }),
        defineField({ name: "lizenz", title: "Lizenz oder Nutzungsrecht", type: "string", description: "Zum Beispiel «Unsplash License», «CC0 1.0» oder «Alle Rechte bei Casatex Zürich AG»", validation: (r) => r.required() }),
      ],
      validation: (r) => r.required(),
    }),
  ],
});

export const herkunft = defineType({
  name: "herkunft",
  title: "Quelle",
  type: "object",
  fields: [
    defineField({ name: "quelle", title: "Bezeichnung der Quelle", type: "string", description: "Zum Beispiel «Zentraler Firmenindex Zefix» oder «Bestätigung von Herrn Muster, E-Mail vom 3. März»", validation: (r) => r.required().min(3) }),
    defineField({
      name: "url", title: "Adresse der Quelle", type: "url",
      description: "Pflicht bei amtlichen Quellen, Verbänden und Behördenportalen. Bei eigenen Angaben des Unternehmens darf sie fehlen; dann steht in der Bezeichnung, wer wann bestätigt hat.",
      validation: (r) => r.uri({ scheme: ["https"] }).custom((url, kontext) => (url || (kontext.parent as { art?: string } | undefined)?.art === "eigene-quelle" ? true : "Bitte die Adresse der Quelle angeben.")),
    }),
    defineField({ name: "abgerufen", title: "Abgerufen oder bestätigt am", type: "date", validation: (r) => r.required() }),
    defineField({
      name: "art",
      title: "Art der Quelle",
      type: "string",
      description: "Verzeichniseinträge und automatisch erzeugte Texte sind keine zulässige Quelle.",
      options: { list: [{ title: "Amtlich (Handelsregister)", value: "amtlich" }, { title: "Verband", value: "verband" }, { title: "Behördenportal", value: "behoerdenportal" }, { title: "Eigene Angabe des Unternehmens", value: "eigene-quelle" }], layout: "radio" },
      validation: (r) => r.required(),
    }),
  ],
  preview: { select: { title: "quelle", subtitle: "abgerufen" } },
});

export const aussage = defineType({
  name: "aussage",
  title: "Aussage über das Unternehmen",
  type: "object",
  description: "Alles, was etwas über Casatex behauptet, braucht eine Quelle.",
  fields: [
    defineField({ name: "titel", title: "Titel", type: "string", validation: (r) => r.required().custom(schreibweise) }),
    defineField({ name: "text", title: "Text", type: "text", rows: 3, validation: (r) => r.required().custom(schreibweise) }),
    defineField({ name: "link", title: "Weiterführender Link (optional)", type: "verweis" }),
    defineField({ name: "herkunft", title: "Quellen", type: "array", of: [defineArrayMember({ type: "herkunft" })], validation: (r) => r.required().min(1).error("Mindestens eine Quelle angeben.") }),
    defineField({ name: "freigabe", title: "Freigabe", type: "string", description: "«Demo»: belegt, aber vom Unternehmen noch nicht bestätigt. «Live»: vom Unternehmen freigegeben.", options: { list: [{ title: "Demo (belegt, nicht bestätigt)", value: "demo" }, { title: "Live (vom Unternehmen freigegeben)", value: "live" }], layout: "radio" }, initialValue: "demo", validation: (r) => r.required() }),
  ],
  preview: { select: { title: "titel", subtitle: "freigabe" }, prepare: ({ title, subtitle }) => ({ title, subtitle: subtitle === "live" ? "freigegeben" : "Demo, noch nicht bestätigt" }) },
});

export const belege = defineType({
  name: "belege",
  title: "Belege für die Texte dieser Seite",
  type: "object",
  description: "Einleitungen und freie Texte dieser Seite sagen etwas über das Unternehmen. Hier steht, worauf sie sich stützen und ob das Unternehmen sie freigegeben hat.",
  fields: [
    defineField({ name: "herkunft", title: "Quellen", type: "array", of: [defineArrayMember({ type: "herkunft" })], validation: (r) => r.required().min(1).error("Mindestens eine Quelle angeben.") }),
    defineField({ name: "freigabe", title: "Freigabe", type: "string", description: "«Live» erst, wenn das Unternehmen die Texte dieser Seite bestätigt hat. Vorher lässt sich die Website nicht für Suchmaschinen freigeben.", options: { list: [{ title: "Demo (belegt, nicht bestätigt)", value: "demo" }, { title: "Live (vom Unternehmen freigegeben)", value: "live" }], layout: "radio" }, initialValue: "demo", validation: (r) => r.required() }),
  ],
});

export const abschnitt = defineType({
  name: "abschnitt",
  title: "Abschnitt",
  type: "object",
  fields: [
    defineField({ name: "titel", title: "Titel", type: "string", validation: (r) => r.required().custom(schreibweise) }),
    defineField({ name: "text", title: "Text", type: "text", rows: 4, validation: (r) => r.required().custom(schreibweise) }),
  ],
  preview: { select: { title: "titel", subtitle: "text" } },
});

export const verlegemuster = defineType({
  name: "verlegemuster",
  title: "Verlegemuster",
  type: "object",
  fields: [
    defineField({ name: "art", title: "Zeichnung", type: "string", description: "Die Website zeichnet das Muster selbst.", options: { list: [{ title: "Schiffsboden", value: "schiffsboden" }, { title: "Englischer Verband", value: "englisch" }, { title: "Fischgrat", value: "fischgrat" }, { title: "Würfel", value: "wuerfel" }] }, validation: (r) => r.required() }),
    defineField({ name: "titel", title: "Titel", type: "string", validation: (r) => r.required() }),
    defineField({ name: "text", title: "Erklärung", type: "text", rows: 2, validation: (r) => r.required().custom(schreibweise) }),
  ],
  preview: { select: { title: "titel", subtitle: "text" } },
});

export const bodenwahl = defineType({
  name: "bodenwahl",
  title: "Boden im Einstieg",
  type: "object",
  fields: [
    defineField({ name: "titel", title: "Beschriftung", type: "string", description: "Kurz, zum Beispiel «Parkett»", validation: (r) => r.required().max(14) }),
    defineField({ name: "bild", title: "Textur", type: "bildMitText", description: "Quadratische, nahtlos wiederholbare Textur von oben (mindestens 1024 × 1024 Pixel). Die Legende erscheint als «Im Bild: …».", validation: (r) => r.required() }),
    defineField({ name: "kachelbreite", title: "Kachelbreite in Pixel", type: "number", description: "Wie breit sich die Textur an der Wandkante wiederholt. 380 bis 520 passt meist.", initialValue: 480, validation: (r) => r.required().integer().min(200).max(900) }),
  ],
  preview: { select: { title: "titel", media: "bild" } },
});

export const aufruf = defineType({
  name: "aufruf",
  title: "Aufruf",
  type: "object",
  fields: [
    defineField({ name: "titel", title: "Titel", type: "string", validation: (r) => r.required().custom(schreibweise) }),
    defineField({ name: "text", title: "Text", type: "text", rows: 2, validation: (r) => r.required().custom(schreibweise) }),
    defineField({ name: "knopf", title: "Knopf", type: "verweis", validation: (r) => r.required() }),
  ],
});

/** Kurzform für ein einfaches Pflicht-Textfeld mit Schreibweise-Prüfung (einzeilig, mit `zeilen` mehrzeilig). */
export function text(name: string, title: string, description?: string, zeilen?: number) {
  return zeilen
    ? defineField({ name, title, description, type: "text", rows: zeilen, validation: (r) => r.required().custom(schreibweise) })
    : defineField({ name, title, description, type: "string", validation: (r) => r.required().custom(schreibweise) });
}

export const seoFelder = [
  defineField({ name: "seoTitel", title: "Seitentitel für Suchmaschinen", type: "string", description: "Erscheint im Browser-Tab und in Suchergebnissen. Der Firmenname wird automatisch angehängt.", group: "seo", validation: (r) => r.max(50).custom(schreibweise) }),
  defineField({ name: "seoBeschreibung", title: "Beschreibung für Suchmaschinen", type: "text", rows: 3, description: "Ein bis zwei Sätze, 50 bis 170 Zeichen.", group: "seo", validation: (r) => r.min(50).max(170).custom(schreibweise) }),
];
export const seoGruppe = [{ name: "inhalt", title: "Inhalt", default: true }, { name: "seo", title: "Suchmaschinen" }];
