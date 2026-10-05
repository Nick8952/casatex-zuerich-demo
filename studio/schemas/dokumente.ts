import { defineArrayMember, defineField, defineType } from "sanity";
import { linkzielErlaubt, schreibweise, seoFelder, seoGruppe, text } from "./objekte";

const reihenfolge = defineField({ name: "reihenfolge", title: "Reihenfolge", type: "number", description: "Kleinere Zahlen stehen weiter vorne (10, 20, 30 lässt Platz für Einschübe).", initialValue: 100, validation: (r) => r.required() });
const slug = (quelle: string) =>
  defineField({ name: "slug", title: "Adresse (letzter Teil)", type: "slug", description: "Wird aus dem Titel erzeugt. Nach der Veröffentlichung nicht mehr ändern, sonst brechen bestehende Links.", options: { source: quelle, maxLength: 60 }, validation: (r) => r.required() });
const GRUPPEN = [{ title: "Holz", value: "holz" }, { title: "Textil", value: "textil" }, { title: "Elastische Beläge", value: "elastisch" }, { title: "Weitere", value: "weitere" }];

// ── Unternehmen und Kontakt ────────────────────────────────────────────────
export const einstellungen = defineType({
  name: "einstellungen",
  title: "Unternehmen und Kontakt",
  type: "document",
  groups: [{ name: "firma", title: "Unternehmen", default: true }, { name: "kontakt", title: "Kontakt" }, { name: "zeiten", title: "Öffnungszeiten" }, { name: "bilder", title: "Logo und Vorschaubild" }, { name: "quellen", title: "Quellen" }],
  fields: [
    defineField({ name: "firma", title: "Firmenname", type: "string", group: "firma", validation: (r) => r.required() }),
    defineField({ name: "kurzname", title: "Kurzname", type: "string", group: "firma", validation: (r) => r.required() }),
    defineField({ name: "claim", title: "Leitzeile", type: "string", description: "Erscheint im Titel der Startseite, zum Beispiel «Parkett, Teppiche und Bodenbeläge in Zürich».", group: "firma", validation: (r) => r.required().custom(schreibweise) }),
    defineField({ name: "rechtsform", title: "Rechtsform", type: "string", group: "firma", validation: (r) => r.required() }),
    defineField({ name: "uid", title: "Unternehmens-Identifikationsnummer (UID)", type: "string", description: "Format CHE-123.456.789", group: "firma", validation: (r) => r.required().regex(/^CHE-\d{3}\.\d{3}\.\d{3}$/, { name: "UID" }) }),
    defineField({
      name: "adresse", title: "Adresse", type: "object", group: "kontakt",
      fields: [
        defineField({ name: "strasse", title: "Strasse und Nummer", type: "string", validation: (r) => r.required() }),
        defineField({ name: "plz", title: "Postleitzahl", type: "string", validation: (r) => r.required().regex(/^\d{4}$/, { name: "vierstellige Postleitzahl" }) }),
        defineField({ name: "ort", title: "Ort", type: "string", validation: (r) => r.required() }),
        defineField({ name: "quartier", title: "Quartier (optional)", type: "string" }),
        defineField({ name: "land", title: "Land", type: "string", initialValue: "Schweiz", validation: (r) => r.required() }),
      ],
    }),
    defineField({ name: "telefon", title: "Telefon", type: "string", description: "Im internationalen Format: +41 44 432 61 61. Die Website zeigt daraus «044 432 61 61».", group: "kontakt", validation: (r) => r.required().regex(/^\+41 \d{2} \d{3} \d{2} \d{2}$/, { name: "Format +41 44 123 45 67" }) }),
    defineField({ name: "email", title: "E-Mail", type: "string", description: "An diese Adresse richtet das Anfrageformular die vorbereitete E-Mail.", group: "kontakt", validation: (r) => r.required().email() }),
    defineField({ name: "routenlink", title: "Link zur Route (Google Maps)", type: "url", description: "Öffnet sich in einem neuen Fenster. Es wird keine Karte eingebettet.", group: "kontakt", validation: (r) => r.required().uri({ scheme: ["https"] }) }),
    defineField({
      name: "oeffnungszeiten", title: "Öffnungszeiten", type: "array", group: "zeiten",
      description: "Leer lassen, solange die Zeiten nicht feststehen: Der Abschnitt erscheint dann nirgends.",
      of: [defineArrayMember({ type: "object", name: "oeffnungszeit", fields: [defineField({ name: "tage", title: "Tage", type: "string", description: "Zum Beispiel «Montag bis Freitag»", validation: (r) => r.required() }), defineField({ name: "zeiten", title: "Zeiten", type: "string", description: "Zum Beispiel «08.00 bis 12.00 und 13.30 bis 17.00 Uhr»", validation: (r) => r.required().custom(schreibweise) })], preview: { select: { title: "tage", subtitle: "zeiten" } } })],
    }),
    defineField({ name: "oeffnungszeitenHinweis", title: "Hinweis zu den Öffnungszeiten (optional)", type: "string", description: "Zum Beispiel «Samstag nach Vereinbarung»", group: "zeiten", validation: (r) => r.custom(schreibweise) }),
    defineField({ name: "logo", title: "Logo", type: "bildMitText", description: "Am besten als PNG oder WebP mit transparentem Hintergrund.", group: "bilder", validation: (r) => r.required() }),
    defineField({ name: "seoBild", title: "Vorschaubild für geteilte Links", type: "bildMitText", description: "1200 × 630 Pixel. Erscheint, wenn die Website in WhatsApp, LinkedIn usw. geteilt wird.", group: "bilder", validation: (r) => r.required() }),
    defineField({ name: "herkunft", title: "Quellen der Unternehmensangaben", type: "array", of: [defineArrayMember({ type: "herkunft" })], group: "quellen", validation: (r) => r.required().min(1) }),
  ],
  preview: { select: { title: "firma", subtitle: "email", media: "logo" } },
});

// ── Navigation, Fusszeile und Formulartexte ────────────────────────────────
export const texte = defineType({
  name: "texte",
  title: "Navigation, Fusszeile und Formulartexte",
  type: "document",
  groups: [{ name: "navigation", title: "Navigation", default: true }, { name: "fuss", title: "Fusszeile" }, { name: "ui", title: "Kleine Texte" }, { name: "formular", title: "Anfrageformular" }, { name: "einwilligung", title: "Datenschutz-Einstellungen" }, { name: "seo", title: "Suchmaschinen" }],
  fields: [
    defineField({ name: "demoHinweis", title: "Hinweis «Entwurf»", type: "string", description: "Schmale Zeile über der Kopfzeile. Sie erscheint nur, solange die Website nicht für Suchmaschinen freigegeben ist.", group: "navigation" }),
    defineField({ name: "navigation", title: "Seiten in der Navigation", type: "array", of: [defineArrayMember({ type: "verweis" })], group: "navigation", validation: (r) => r.required().min(1).max(5) }),
    defineField({
      name: "kopf", title: "Kopfzeile", type: "object", group: "navigation",
      fields: [
        defineField({ name: "aufruf", title: "Knopf in der Kopfzeile", type: "verweis", description: "Der eine Aufruf der Website. Alle Knöpfe zur Kontaktseite sollten gleich heissen.", validation: (r) => r.required() }),
        text("telefonLabel", "Beschriftung des Telefon-Links (für Screenreader)"), text("registerKnopf", "Knopf «Materialregister»"), text("registerTitel", "Titel des Materialregisters"),
        text("registerText", "Text im Materialregister"), text("menueKnopf", "Knopf «Menü» (Handy)"), text("schliessen", "Knopf «Schliessen»"),
        defineField({ name: "materialkundeLink", title: "Link zur Materialkunde", type: "verweis", validation: (r) => r.required() }),
      ],
    }),
    defineField({
      name: "footer", title: "Fusszeile", type: "object", group: "fuss",
      fields: [
        text("leitsatz", "Leitsatz"), text("kontaktTitel", "Titel «Kontakt»"), text("seitenTitel", "Titel «Seiten»"), text("rechtlichesTitel", "Titel «Rechtliches»"),
        defineField({ name: "rechtliches", title: "Rechtliche Seiten", type: "array", of: [defineArrayMember({ type: "verweis" })], validation: (r) => r.required().min(1) }),
        text("route", "Beschriftung des Routenlinks"),
        defineField({ name: "bildnachweis", title: "Link zum Bildnachweis", type: "verweis", validation: (r) => r.required() }),
        text("copyright", "Copyright-Inhaber"), text("demoHinweis", "Hinweis in der Fusszeile, solange die Website ein Entwurf ist", undefined, 2),
      ],
    }),
    defineField({
      name: "ui", title: "Kleine Texte", type: "object", group: "ui",
      fields: [
        text("zumInhalt", "Sprunglink"), text("symbolbild", "Kennzeichnung von Materialbeispielen", "Steht unter jedem Bild, das kein eigenes Projekt zeigt."), text("materialinfo", "Kennzeichnung der Materialkunde"),
        text("mehrErfahren", "«Mehr erfahren»"), text("zurUebersicht", "Link zurück zur Übersicht"), text("weitereBereiche", "Titel «Weitere Bereiche»"),
        text("telefon", "«Telefon»"), text("email", "«E-Mail»"), text("adresse", "«Adresse»"), text("quellen", "«Quellen»"),
        text("aussagenTitel", "Titel über den Aussagen auf Leistungsseiten"), text("materialkundeTitel", "Titel «Materialkunde»"), text("fragenTitel", "Titel «Vor der Wahl klären»"), text("fragenText", "Text unter «Vor der Wahl klären»", undefined, 2), text("zumBereich", "«Zum Bereich»"),
        text("nichtGefundenTitel", "Fehlerseite: Titel"), text("nichtGefundenText", "Fehlerseite: Text", undefined, 2),
        defineField({ name: "nichtGefundenLink", title: "Fehlerseite: Link", type: "verweis", validation: (r) => r.required() }),
      ],
    }),
    defineField({
      name: "formular", title: "Anfrageformular", type: "object", group: "formular",
      description: "Das Formular versendet nichts. Es bereitet eine E-Mail im E-Mail-Programm der Besucherin oder des Besuchers vor. Die Texte müssen das ehrlich sagen.",
      fields: [
        text("titel", "Titel"), text("einleitung", "Einleitung", "Muss erklären, dass sich das E-Mail-Programm öffnet und die Website nichts sendet.", 3),
        text("name", "Feld «Name»"), text("email", "Feld «E-Mail»"), text("telefon", "Feld «Telefon»"), text("anliegen", "Feld «Anliegen»"),
        defineField({ name: "anliegenOptionen", title: "Auswahl «Anliegen»", type: "array", of: [defineArrayMember({ type: "object", name: "anliegenOption", fields: [defineField({ name: "wert", title: "Kennung (klein, ohne Leerzeichen)", type: "string", validation: (r) => r.required().regex(/^[a-z0-9-]+$/, { name: "Kleinbuchstaben, Ziffern, Bindestrich" }) }), defineField({ name: "titel", title: "Beschriftung", type: "string", validation: (r) => r.required() })], preview: { select: { title: "titel", subtitle: "wert" } } })], validation: (r) => r.required().min(1) }),
        text("nachricht", "Feld «Nachricht»"), text("nachrichtHilfe", "Hilfetext unter der Nachricht"), text("pflicht", "Hinweis auf Pflichtfelder"), text("datenschutzHinweis", "Hinweis vor dem Link zur Datenschutzerklärung"),
        defineField({ name: "datenschutzLink", title: "Link zur Datenschutzerklärung", type: "verweis", validation: (r) => r.required() }),
        text("absenden", "Knopf", "Ehrlich beschriften, zum Beispiel «E-Mail vorbereiten». Nicht «Senden»."), text("hinweisNachher", "Hinweis nach dem Klick", "Keine Versandbestätigung: Die Website weiss nicht, ob die E-Mail gesendet wurde.", 3),
        text("kopieren", "Knopf «Nachricht kopieren»"), text("kopiert", "Meldung nach dem Kopieren"), text("kopierenFehler", "Meldung, wenn das Kopieren nicht geht"), text("betreff", "Betreff der E-Mail"),
        text("fehlerName", "Fehlermeldung Name"), text("fehlerEmail", "Fehlermeldung E-Mail"), text("fehlerNachricht", "Fehlermeldung Nachricht"), text("ohneJavascript", "Text ohne JavaScript"),
      ],
    }),
    defineField({
      name: "einwilligung", title: "Datenschutz-Einstellungen", type: "object", group: "einwilligung",
      description: "Solange keine Kategorie eingetragen ist, erscheint kein Banner. Eine Kategorie nur eintragen, wenn die Website tatsächlich einen einwilligungspflichtigen Dienst einbindet (das braucht eine Entwicklerin oder einen Entwickler).",
      fields: [
        text("fussLink", "Link in der Fusszeile"), text("ruhendTitel", "Titel, wenn nichts einzustellen ist"), text("ruhendText", "Text, wenn nichts einzustellen ist", undefined, 3),
        text("bannerTitel", "Banner: Titel"), text("bannerText", "Banner: Text", undefined, 3), text("alleAkzeptieren", "Knopf «Alle akzeptieren»"), text("nurNotwendige", "Knopf «Nur notwendige»"), text("einstellungen", "Knopf «Einstellungen»"),
        text("auswahlSpeichern", "Knopf «Auswahl speichern»"), text("widerrufen", "Knopf «Einwilligung widerrufen»"), text("notwendigTitel", "Kategorie «Notwendig»: Titel"), text("notwendigText", "Kategorie «Notwendig»: Text"), text("datenschutzerklaerung", "Link «Datenschutzerklärung»"),
        defineField({ name: "kategorien", title: "Optionale Kategorien", type: "array", of: [defineArrayMember({ type: "object", name: "einwilligungKategorie", fields: [defineField({ name: "kennung", title: "Kennung (Kleinbuchstaben)", type: "string", validation: (r) => r.required().regex(/^[a-z]+$/, { name: "nur Kleinbuchstaben" }) }), defineField({ name: "titel", title: "Titel", type: "string", validation: (r) => r.required() }), defineField({ name: "beschreibung", title: "Beschreibung", type: "text", rows: 2, validation: (r) => r.required() })], preview: { select: { title: "titel", subtitle: "kennung" } } })] }),
      ],
    }),
    defineField({ name: "seo", title: "Suchmaschinen (Standard)", type: "object", group: "seo", fields: [text("titelZusatz", "Zusatz im Seitentitel", "Wird an jeden Seitentitel angehängt, zum Beispiel «Casatex Zürich AG»."), text("beschreibung", "Standardbeschreibung", "Gilt für Seiten ohne eigene Beschreibung.", 3)] }),
  ],
  preview: { prepare: () => ({ title: "Navigation, Fusszeile und Formulartexte" }) },
});

// ── Seiten ─────────────────────────────────────────────────────────────────
const abschnittText = (name: string, title: string) => defineField({ name, title, type: "object", group: "inhalt", fields: [text("titel", "Titel"), text("text", "Text", undefined, 3)] });

export const startseite = defineType({
  name: "startseite",
  title: "Startseite",
  type: "document",
  groups: seoGruppe,
  fields: [
    defineField({
      name: "hero", title: "Einstieg", type: "object", group: "inhalt",
      fields: [
        defineField({ name: "titel", title: "Titel", type: "string", description: "Höchstens 34 Zeichen, damit er auf zwei Zeilen passt.", validation: (r) => r.required().max(34).custom(schreibweise) }),
        defineField({ name: "text", title: "Text", type: "text", rows: 3, description: "Höchstens 20 Wörter.", validation: (r) => r.required().custom((t: string | undefined) => (t && t.trim().split(/\s+/).length > 20 ? "Bitte auf höchstens 20 Wörter kürzen." : schreibweise(t))) }),
        defineField({ name: "knopf", title: "Hauptknopf", type: "verweis", validation: (r) => r.required() }),
        defineField({ name: "zweiterKnopf", title: "Zweiter Knopf", type: "verweis", validation: (r) => r.required() }),
        text("wechselTitel", "Überschrift der Materialwahl"), text("imBild", "Einleitung der Bildbeschreibung", "Zum Beispiel «Im Bild»"),
        defineField({ name: "boeden", title: "Böden zur Auswahl", type: "array", of: [defineArrayMember({ type: "bodenwahl" })], description: "Der erste Boden wird beim Laden gezeigt.", validation: (r) => r.required().min(1).max(6) }),
      ],
    }),
    abschnittText("leistungen", "Abschnitt «Unsere Bereiche»"),
    defineField({ name: "materialien", title: "Abschnitt «Materialien»", type: "object", group: "inhalt", fields: [text("titel", "Titel"), text("text", "Text", undefined, 3), defineField({ name: "link", title: "Link", type: "verweis", validation: (r) => r.required() }), defineField({ name: "bild", title: "Bild", type: "bildMitText", validation: (r) => r.required() })] }),
    defineField({ name: "ueber", title: "Abschnitt «Über Casatex»", type: "object", group: "inhalt", description: "Die Aussagen darunter stammen von der Seite «Über Casatex».", fields: [text("titel", "Titel"), text("text", "Text", undefined, 3), defineField({ name: "link", title: "Link", type: "verweis", validation: (r) => r.required() })] }),
    abschnittText("referenzen", "Abschnitt «Referenzen» (erscheint erst, wenn Referenzen erfasst sind)"),
    abschnittText("partner", "Abschnitt «Partner und Marken» (erscheint erst, wenn Partner erfasst sind)"),
    abschnittText("kontakt", "Abschnitt «Kontakt»"),
    ...seoFelder,
  ],
  preview: { prepare: () => ({ title: "Startseite" }) },
});

export const leistungenSeite = defineType({
  name: "leistungenSeite",
  title: "Leistungen und Materialien",
  type: "document",
  groups: seoGruppe,
  fields: [
    { ...text("titel", "Titel"), group: "inhalt" }, { ...text("einleitung", "Einleitung", undefined, 3), group: "inhalt" },
    defineField({ name: "bild", title: "Bild im Seitenkopf", type: "bildMitText", group: "inhalt", validation: (r) => r.required() }),
    { ...text("bereicheTitel", "Titel über den Bereichen"), group: "inhalt" }, { ...text("materialkundeTitel", "Titel der Materialkunde"), group: "inhalt" }, { ...text("materialkundeText", "Einleitung der Materialkunde", "Muss klarstellen, dass es um allgemeine Materialinformation geht.", 3), group: "inhalt" },
    defineField({ name: "gruppen", title: "Materialgruppen", type: "array", group: "inhalt", description: "Reihenfolge und Beschriftung der Gruppen in der Materialkunde.", of: [defineArrayMember({ type: "object", name: "materialgruppe", fields: [defineField({ name: "kennung", title: "Gruppe", type: "string", options: { list: GRUPPEN }, validation: (r) => r.required() }), text("titel", "Titel"), text("text", "Kurztext")], preview: { select: { title: "titel", subtitle: "text" } } })], validation: (r) => r.required().min(1) }),
    defineField({ name: "aufruf", title: "Aufruf am Seitenende", type: "aufruf", group: "inhalt", validation: (r) => r.required() }),
    ...seoFelder,
  ],
  preview: { prepare: () => ({ title: "Leistungen und Materialien" }) },
});

export const ueberSeite = defineType({
  name: "ueberSeite",
  title: "Über Casatex",
  type: "document",
  groups: seoGruppe,
  fields: [
    { ...text("titel", "Titel"), group: "inhalt" }, { ...text("einleitung", "Einleitung", undefined, 3), group: "inhalt" },
    defineField({ name: "bild", title: "Bild im Seitenkopf", type: "bildMitText", group: "inhalt", validation: (r) => r.required() }),
    { ...text("aussagenTitel", "Titel über den Aussagen"), group: "inhalt" },
    defineField({ name: "aussagen", title: "Aussagen über das Unternehmen", type: "array", of: [defineArrayMember({ type: "aussage" })], group: "inhalt", description: "Jede Aussage braucht eine Quelle. Die ersten Aussagen erscheinen auch auf der Startseite.", validation: (r) => r.required().min(1) }),
    defineField({
      name: "zweck", title: "Zitat (zum Beispiel Unternehmenszweck)", type: "object", group: "inhalt",
      fields: [text("titel", "Titel"), text("zitat", "Zitat", "Wörtlich und ohne Anführungszeichen eingeben; die Website setzt sie.", 3), text("text", "Quellenangabe unter dem Zitat"), defineField({ name: "herkunft", title: "Quellen", type: "array", of: [defineArrayMember({ type: "herkunft" })], validation: (r) => r.required().min(1) }), defineField({ name: "freigabe", title: "Freigabe", type: "string", options: { list: [{ title: "Demo", value: "demo" }, { title: "Live", value: "live" }], layout: "radio" }, initialValue: "demo", validation: (r) => r.required() })],
    }),
    defineField({ name: "aufruf", title: "Aufruf am Seitenende", type: "aufruf", group: "inhalt", validation: (r) => r.required() }),
    ...seoFelder,
  ],
  preview: { prepare: () => ({ title: "Über Casatex" }) },
});

export const kontaktSeite = defineType({
  name: "kontaktSeite",
  title: "Kontakt und Anfahrt",
  type: "document",
  groups: seoGruppe,
  description: "Telefon, E-Mail, Adresse und Öffnungszeiten stehen unter «Unternehmen und Kontakt».",
  fields: [
    { ...text("titel", "Titel"), group: "inhalt" }, { ...text("einleitung", "Einleitung", undefined, 3), group: "inhalt" }, { ...text("direktTitel", "Titel «Direkt erreichen»"), group: "inhalt" },
    { ...text("anfahrtTitel", "Titel «Anfahrt»"), group: "inhalt" }, { ...text("anfahrtText", "Text zur Anfahrt", undefined, 3), group: "inhalt" }, { ...text("oeffnungszeitenTitel", "Titel «Öffnungszeiten»"), group: "inhalt" },
    ...seoFelder,
  ],
  preview: { prepare: () => ({ title: "Kontakt und Anfahrt" }) },
});

export const rechtSeite = defineType({
  name: "rechtSeite",
  title: "Rechtliche Seite",
  type: "document",
  groups: seoGruppe,
  fields: [
    defineField({ name: "slug", title: "Seite", type: "slug", group: "inhalt", readOnly: true, description: "Fest vorgegeben: impressum oder datenschutz.", validation: (r) => r.required() }),
    { ...text("titel", "Titel"), group: "inhalt" },
    defineField({ name: "einleitung", title: "Einleitung (optional)", type: "text", rows: 3, group: "inhalt", validation: (r) => r.custom(schreibweise) }),
    { ...text("stand", "Stand", "Datum der letzten inhaltlichen Änderung, zum Beispiel «5. Oktober 2026»."), group: "inhalt" },
    defineField({
      name: "inhalt", title: "Text", type: "array", group: "inhalt",
      description: "Rechtstexte bitte nur nach Rücksprache ändern. Zwischentitel der Stufe 2 werden zu Sprungmarken. Im Impressum fügt die Website unter dem Zwischentitel «Bildnachweis» die Liste aller Bildnachweise automatisch ein.",
      of: [defineArrayMember({ type: "block", styles: [{ title: "Absatz", value: "normal" }, { title: "Zwischentitel", value: "h2" }, { title: "Kleiner Zwischentitel", value: "h3" }], lists: [{ title: "Aufzählung", value: "bullet" }], marks: { decorators: [{ title: "Fett", value: "strong" }], annotations: [{ name: "link", type: "object", title: "Link", fields: [defineField({ name: "href", title: "Ziel", type: "string", validation: (r) => r.required().custom(linkzielErlaubt) })] }] } })],
      validation: (r) => r.required().min(1),
    }),
    ...seoFelder,
  ],
  preview: { select: { title: "titel", subtitle: "stand" } },
});

// ── Leistungen und Materialien ─────────────────────────────────────────────
export const material = defineType({
  name: "material",
  title: "Material",
  type: "document",
  description: "Allgemeine Materialkunde. Hier steht nichts über das Angebot des Betriebs.",
  fields: [
    defineField({ name: "titel", title: "Titel", type: "string", validation: (r) => r.required().custom(schreibweise) }),
    slug("titel"),
    defineField({ name: "gruppe", title: "Gruppe", type: "string", options: { list: GRUPPEN, layout: "radio" }, validation: (r) => r.required() }),
    text("kurz", "Kurztext", "Ein Satz für Übersichten und Handmuster.", 2),
    defineField({ name: "abschnitte", title: "Abschnitte", type: "array", of: [defineArrayMember({ type: "abschnitt" })], description: "Zum Beispiel «Material» und «Im Alltag». Allgemein formulieren, ohne «wir».", validation: (r) => r.required().min(1) }),
    defineField({ name: "eigenschaften", title: "Eigenschaften (Stichworte)", type: "array", of: [defineArrayMember({ type: "string" })], options: { layout: "tags" }, validation: (r) => r.max(5) }),
    defineField({ name: "bild", title: "Handmuster", type: "bildMitText", description: "Quadratischer Ausschnitt der Oberfläche von oben. Ohne Bild zeigt die Website eine Fläche mit dem Namen." }),
    defineField({ name: "muster", title: "Verlegemuster (nur Parkett)", type: "array", of: [defineArrayMember({ type: "verlegemuster" })] }),
    reihenfolge,
  ],
  orderings: [{ title: "Reihenfolge", name: "reihenfolge", by: [{ field: "reihenfolge", direction: "asc" }] }],
  preview: { select: { title: "titel", subtitle: "kurz", media: "bild" } },
});

export const leistung = defineType({
  name: "leistung",
  title: "Leistung",
  type: "document",
  description: "Ein Leistungsbereich mit eigener Seite. Eine neue Leistung erscheint nach dem nächsten Build der Website.",
  groups: seoGruppe,
  fields: [
    defineField({ name: "titel", title: "Titel", type: "string", group: "inhalt", validation: (r) => r.required().custom(schreibweise) }),
    { ...slug("titel"), group: "inhalt" },
    { ...text("kurztitel", "Kurztitel"), group: "inhalt" },
    { ...text("kurz", "Kurztext", "Ein Satz für die Übersicht.", 2), group: "inhalt" },
    { ...text("einleitung", "Einleitung der Seite", "Zwei bis drei Sätze, allgemein formuliert.", 4), group: "inhalt" },
    defineField({ name: "aussagen", title: "Was Casatex in diesem Bereich macht", type: "array", of: [defineArrayMember({ type: "aussage" })], group: "inhalt", description: "Nur, was belegt oder vom Unternehmen bestätigt ist. Jede Aussage braucht eine Quelle.", validation: (r) => r.required().min(1) }),
    defineField({ name: "bild", title: "Bild", type: "bildMitText", group: "inhalt", validation: (r) => r.required() }),
    defineField({ name: "boden", title: "Bodentextur im Seitenkopf", type: "bildMitText", group: "inhalt", description: "Quadratische, nahtlos wiederholbare Textur von oben.", validation: (r) => r.required() }),
    defineField({ name: "materialien", title: "Materialien dieses Bereichs", type: "array", of: [defineArrayMember({ type: "reference", to: [{ type: "material" }] })], group: "inhalt", validation: (r) => r.required().min(1).unique() }),
    defineField({ name: "fragen", title: "Vor der Wahl klären", type: "array", of: [defineArrayMember({ type: "abschnitt" })], group: "inhalt", description: "Allgemeine Punkte, keine Zusagen." }),
    { ...reihenfolge, group: "inhalt" },
    ...seoFelder,
  ],
  orderings: [{ title: "Reihenfolge", name: "reihenfolge", by: [{ field: "reihenfolge", direction: "asc" }] }],
  preview: { select: { title: "titel", subtitle: "kurz", media: "bild" } },
});

// ── Referenzen und Partner (optional) ──────────────────────────────────────
export const referenz = defineType({
  name: "referenz",
  title: "Referenz",
  type: "document",
  description: "Ausgeführte Arbeit von Casatex. Der Abschnitt «Referenzen» erscheint auf der Startseite, sobald die erste Referenz veröffentlicht ist.",
  fields: [
    defineField({ name: "titel", title: "Titel", type: "string", validation: (r) => r.required().custom(schreibweise) }),
    defineField({ name: "ort", title: "Ort (optional)", type: "string" }), defineField({ name: "jahr", title: "Jahr (optional)", type: "string" }),
    text("text", "Beschreibung", undefined, 4),
    defineField({ name: "bild", title: "Bild", type: "bildMitText", description: "Nur eigene Bilder mit geklärten Rechten. «Materialbeispiel» hier ausschalten." }),
    defineField({ name: "herkunft", title: "Quelle oder Freigabe", type: "array", of: [defineArrayMember({ type: "herkunft" })], description: "Zum Beispiel die Freigabe der Bauherrschaft.", validation: (r) => r.required().min(1) }),
    defineField({ name: "freigabe", title: "Freigabe", type: "string", options: { list: [{ title: "Demo", value: "demo" }, { title: "Live", value: "live" }], layout: "radio" }, initialValue: "live", validation: (r) => r.required() }),
    reihenfolge,
  ],
  preview: { select: { title: "titel", subtitle: "ort", media: "bild" } },
});

export const partner = defineType({
  name: "partner",
  title: "Partner oder Marke",
  type: "document",
  description: "Hersteller, Marken und Verbände. Der Abschnitt erscheint auf der Startseite, sobald der erste Eintrag veröffentlicht ist. Nur eintragen, was tatsächlich besteht.",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "art", title: "Art", type: "string", options: { list: [{ title: "Marke oder Hersteller", value: "marke" }, { title: "Verband", value: "verband" }, { title: "Partner", value: "partner" }], layout: "radio" }, validation: (r) => r.required() }),
    defineField({ name: "url", title: "Website (optional)", type: "string", validation: (r) => r.custom(linkzielErlaubt) }),
    defineField({ name: "logo", title: "Logo (optional)", type: "bildMitText", description: "Nur mit Erlaubnis des Partners." }),
    defineField({ name: "herkunft", title: "Quelle", type: "array", of: [defineArrayMember({ type: "herkunft" })], validation: (r) => r.required().min(1) }),
    defineField({ name: "freigabe", title: "Freigabe", type: "string", options: { list: [{ title: "Demo", value: "demo" }, { title: "Live", value: "live" }], layout: "radio" }, initialValue: "live", validation: (r) => r.required() }),
    reihenfolge,
  ],
  preview: { select: { title: "name", subtitle: "art", media: "logo" } },
});
