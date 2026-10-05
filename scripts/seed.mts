// Import der lokalen Inhalte (data/*.json, public/bilder) nach Sanity.
//
//   npm run seed -- --probe     Trockenlauf ohne Zugang: baut alle Dokumente, prüft sie gegen das Domainmodell und vergleicht
//                               sie mit den lokalen Inhalten (Parität). Schreibt nichts, braucht kein Sanity-Projekt.
//   npm run seed                legt fehlende Dokumente an (bestehende bleiben unangetastet)
//   npm run seed -- --force     überschreibt bestehende Dokumente mit dem lokalen Stand
//
// Der echte Lauf braucht SANITY_PROJECT_ID, SANITY_DATASET und SANITY_API_WRITE_TOKEN (Token mit Schreibrecht, nur lokal in
// .env.local, nie im Repository). Die Dokumente entstehen als veröffentlichte Dokumente. Anleitung: docs/SANITY-VERCEL-EINRICHTUNG.md
import { createReadStream, readFileSync } from "node:fs";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";
import { z } from "zod";
import { createClient } from "@sanity/client";
import { lokaleQuelle } from "../lib/content/local";
import {
  einstellungenSchema, kontaktSeiteSchema, leistungSchema, leistungenSeiteSchema, materialSchema, pruefen, rechtSeiteSchema, startseiteSchema, texteSchema, ueberSeiteSchema,
} from "../lib/content/modell";
import { normalisieren, portableTextZuBloecken } from "../lib/content/sanity";
import { inline, type RohBlock } from "../lib/content/text";

const probe = process.argv.includes("--probe");
const force = process.argv.includes("--force");
const lesen = (datei: string) => JSON.parse(readFileSync(path.join("data", datei), "utf8"));
type Doc = { _id: string; _type: string } & Record<string, unknown>;
type Roh = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any -- frei geformte JSON-Dateien

const bilder = lesen("bilder.json") as Record<string, { breite: number; hoehe: number; alt: string; legende: string | null; symbolbild: boolean; nachweis: { urheber: string; quelle: string; lizenz: string }; quellen: { webp: { breite: number; url: string }[] } }>;
const assetIds = new Map<string, string>();

let zaehler = 0;
const key = (praefix: string) => `${praefix}${(zaehler++).toString(36)}`;
/** Array-Einträge brauchen in Sanity `_key` und (in gemischten Arrays) `_type`. */
const liste = <T extends Roh>(eintraege: T[] | undefined, typ: string) => (eintraege ?? []).map((e) => ({ _type: typ, _key: e._key ?? key(typ.slice(0, 3)), ...e }));
const verweis = (l: Roh) => ({ _type: "verweis", text: l.text, ziel: l.ziel });
const herkunft = (h: Roh[]) => liste(h, "herkunft");
const belege = (b: Roh) => ({ _type: "belege", herkunft: herkunft(b.herkunft), freigabe: b.freigabe });
const aussagen = (a: Roh[]) => liste(a, "aussage").map((x) => ({ ...x, herkunft: herkunft(x.herkunft), ...(x.link ? { link: verweis(x.link) } : {}) }));
const slug = (current: string) => ({ _type: "slug", current });
function bildFeld(id: string) {
  const b = bilder[id];
  if (!b) throw new Error(`Bild «${id}» fehlt in data/bilder.json.`);
  const ref = assetIds.get(id) ?? `image-probe${id.replace(/[^a-z0-9]/g, "")}-${b.breite}x${b.hoehe}-webp`;
  return { _type: "bildMitText", asset: { _type: "reference", _ref: ref }, alt: b.alt, ...(b.legende ? { legende: b.legende } : {}), symbolbild: b.symbolbild, nachweis: { urheber: b.nachweis.urheber, quelle: b.nachweis.quelle, lizenz: b.nachweis.lizenz } };
}

/** Lokaler Fliesstext → Portable Text */
function portableText(roh: RohBlock[]) {
  const block = (style: string, text: string, extra: Roh = {}) => {
    const markDefs: Roh[] = [];
    const children = inline(text).map((t) => {
      if (typeof t === "string") return { _type: "span", _key: key("s"), text: t, marks: [] };
      if (t.link) { const k = key("l"); markDefs.push({ _key: k, _type: "link", href: t.link }); return { _type: "span", _key: key("s"), text: t.text, marks: [k] }; }
      return { _type: "span", _key: key("s"), text: t.text, marks: t.fett ? ["strong"] : [] };
    });
    return { _type: "block", _key: key("b"), style, markDefs, children, ...extra };
  };
  return roh.flatMap((b) => {
    if (typeof b === "string") return [block("normal", b)];
    if ("liste" in b) return b.liste.map((p) => block("normal", p, { listItem: "bullet", level: 1 }));
    return [block(b.stufe === 3 ? "h3" : "h2", b.titel)];
  });
}

function dokumenteBauen(): Doc[] {
  const e = lesen("einstellungen.json"), t = lesen("texte.json"), s = lesen("startseite.json");
  const ls = lesen("seiten/leistungen.json"), us = lesen("seiten/ueber-casatex.json"), ks = lesen("seiten/kontakt.json");
  const docs: Doc[] = [];
  docs.push({ _id: "einstellungen", _type: "einstellungen", ...e, logo: bildFeld(e.logo), seoBild: bildFeld(e.seoBild), oeffnungszeiten: liste(e.oeffnungszeiten, "oeffnungszeit"), herkunft: herkunft(e.herkunft) });
  docs.push({
    _id: "texte", _type: "texte", demoHinweis: t.demoHinweis, navigation: liste(t.navigation, "verweis"),
    kopf: { ...t.kopf, aufruf: verweis(t.kopf.aufruf), materialkundeLink: verweis(t.kopf.materialkundeLink) },
    footer: { ...t.footer, rechtliches: liste(t.footer.rechtliches, "verweis"), bildnachweis: verweis(t.footer.bildnachweis) },
    ui: { ...t.ui, nichtGefundenLink: verweis(t.ui.nichtGefundenLink) },
    formular: { ...t.formular, anliegenOptionen: liste(t.formular.anliegenOptionen, "anliegenOption"), datenschutzLink: verweis(t.formular.datenschutzLink) },
    einwilligung: { ...t.einwilligung, kategorien: liste(t.einwilligung.kategorien, "einwilligungKategorie") },
    seo: t.seo,
  });
  docs.push({
    _id: "startseite", _type: "startseite", ...s,
    hero: { ...s.hero, knopf: verweis(s.hero.knopf), zweiterKnopf: verweis(s.hero.zweiterKnopf), boeden: liste(s.hero.boeden, "bodenwahl").map((b) => ({ ...b, bild: bildFeld(b.bild) })) },
    materialien: { ...s.materialien, link: verweis(s.materialien.link), bild: bildFeld(s.materialien.bild) },
    ueber: { ...s.ueber, link: verweis(s.ueber.link) },
    belege: belege(s.belege),
  });
  docs.push({ _id: "leistungenSeite", _type: "leistungenSeite", ...ls, bild: bildFeld(ls.bild), gruppen: liste(ls.gruppen, "materialgruppe"), aufruf: { _type: "aufruf", ...ls.aufruf, knopf: verweis(ls.aufruf.knopf) }, belege: belege(ls.belege) });
  docs.push({ _id: "ueberSeite", _type: "ueberSeite", ...us, bild: bildFeld(us.bild), aussagen: aussagen(us.aussagen), zweck: { ...us.zweck, herkunft: herkunft(us.zweck.herkunft) }, aufruf: { _type: "aufruf", ...us.aufruf, knopf: verweis(us.aufruf.knopf) }, belege: belege(us.belege) });
  docs.push({ _id: "kontaktSeite", _type: "kontaktSeite", ...ks });
  for (const name of ["impressum", "datenschutz"]) {
    const { bloecke, slug: s2, ...rest } = lesen(`seiten/${name}.json`);
    docs.push({ _id: `rechtSeite-${name}`, _type: "rechtSeite", ...rest, slug: slug(s2), inhalt: portableText(bloecke) });
  }
  for (const m of lesen("materialien.json") as Roh[]) {
    const { bild, muster, abschnitte, slug: s2, ...rest } = m;
    docs.push({ _id: `material-${s2}`, _type: "material", ...rest, slug: slug(s2), abschnitte: liste(abschnitte, "abschnitt"), ...(muster ? { muster: liste(muster, "verlegemuster") } : {}), ...(bild ? { bild: bildFeld(bild) } : {}) });
  }
  for (const l of lesen("leistungen.json") as Roh[]) {
    const { bild, boden, materialien, aussagen: a, fragen, slug: s2, ...rest } = l;
    docs.push({ _id: `leistung-${s2}`, _type: "leistung", ...rest, slug: slug(s2), aussagen: aussagen(a), bild: bildFeld(bild), boden: bildFeld(boden), materialien: (materialien as string[]).map((m) => ({ _type: "reference", _key: key("m"), _ref: `material-${m}` })), fragen: liste(fragen, "abschnitt") });
  }
  for (const r of lesen("referenzen.json") as Roh[]) docs.push({ _id: `referenz-${r._key}`, _type: "referenz", ...r, herkunft: herkunft(r.herkunft), ...(r.bild ? { bild: bildFeld(r.bild) } : {}) });
  for (const p of lesen("partner.json") as Roh[]) docs.push({ _id: `partner-${p._key}`, _type: "partner", ...p, herkunft: herkunft(p.herkunft), ...(p.logo ? { logo: bildFeld(p.logo) } : {}) });
  return docs;
}

// ── Trockenlauf: Dokumente so lesen, wie die Website sie aus Sanity bekäme, und mit dem lokalen Stand vergleichen ──
function projizieren(wert: unknown, docs: Map<string, Doc>): unknown {
  if (Array.isArray(wert)) return wert.map((v) => projizieren(v, docs));
  if (!wert || typeof wert !== "object") return wert;
  const o = wert as Roh;
  if (o._type === "slug") return o.current;
  if (o._type === "block") return o; // Portable Text bleibt, wie er ist (die Website wandelt ihn selbst um)
  if (o._type === "reference") {
    const ziel = docs.get(o._ref);
    if (!ziel) throw new Error(`Verweis auf ein Dokument, das nicht angelegt wird: ${o._ref}`);
    return projizieren(ziel, docs);
  }
  if (o._type === "bildMitText") {
    const m = /-(\d+)x(\d+)-/.exec(o.asset._ref);
    return { assetId: o.asset._ref, url: `https://cdn.sanity.io/images/probe/production/${o.asset._ref}.webp`, breite: Number(m?.[1]), hoehe: Number(m?.[2]), alt: o.alt, legende: o.legende ?? null, symbolbild: o.symbolbild, nachweis: o.nachweis };
  }
  const aus: Roh = {};
  for (const [k, v] of Object.entries(o)) if (k !== "_type" && k !== "_id") aus[k] = projizieren(v, docs);
  return aus;
}
/** Für den Vergleich: Bilder (andere Adressen im CDN) und Sprungmarken (in Sanity aus dem Titel abgeleitet) ausblenden. */
function vergleichbar(wert: unknown): unknown {
  if (Array.isArray(wert)) return wert.map(vergleichbar);
  if (!wert || typeof wert !== "object") return wert;
  const o = wert as Roh;
  if ("quellen" in o && "breite" in o) return { alt: o.alt, legende: o.legende, symbolbild: o.symbolbild, nachweis: o.nachweis };
  const aus: Roh = {};
  for (const [k, v] of Object.entries(o)) if (k !== "anker" && v !== undefined) aus[k] = vergleichbar(v);
  return aus;
}
async function trockenlauf(liste2: Doc[]) {
  const docs = new Map(liste2.map((d) => [d._id, d]));
  const proj = (id: string) => normalisieren(projizieren(docs.get(id), docs));
  const q = lokaleQuelle;
  const unterschiede: string[] = [];
  const gleich = (name: string, ausSanity: unknown, lokal: unknown) => { if (!isDeepStrictEqual(vergleichbar(ausSanity), vergleichbar(lokal))) unterschiede.push(name); };
  gleich("Einstellungen", pruefen(einstellungenSchema, proj("einstellungen"), "Import: Einstellungen"), await q.getEinstellungen());
  gleich("Texte", pruefen(texteSchema, proj("texte"), "Import: Texte"), await q.getTexte());
  gleich("Startseite", pruefen(startseiteSchema, proj("startseite"), "Import: Startseite"), await q.getStartseite());
  gleich("Seite Leistungen", pruefen(leistungenSeiteSchema, proj("leistungenSeite"), "Import: Seite Leistungen"), await q.getLeistungenSeite());
  gleich("Seite Über Casatex", pruefen(ueberSeiteSchema, proj("ueberSeite"), "Import: Seite Über Casatex"), await q.getUeberSeite());
  gleich("Seite Kontakt", pruefen(kontaktSeiteSchema, proj("kontaktSeite"), "Import: Seite Kontakt"), await q.getKontaktSeite());
  const leistungen = liste2.filter((d) => d._type === "leistung").map((d) => proj(d._id));
  gleich("Leistungen", pruefen(z.array(leistungSchema), leistungen, "Import: Leistungen"), await q.getLeistungen());
  const materialien = liste2.filter((d) => d._type === "material").map((d) => proj(d._id));
  gleich("Materialien", pruefen(z.array(materialSchema), materialien, "Import: Materialien"), await q.getMaterialien());
  for (const name of ["impressum", "datenschutz"] as const) {
    const { inhalt, ...rest } = proj(`rechtSeite-${name}`) as Roh;
    gleich(`Rechtsseite ${name}`, pruefen(rechtSeiteSchema, { ...rest, bloecke: portableTextZuBloecken(inhalt) }, `Import: ${name}`), await q.getRechtSeite(name));
  }
  if (unterschiede.length) throw new Error(`Import weicht vom lokalen Stand ab: ${unterschiede.join(", ")}. scripts/seed.mts und lib/content/sanity.ts abgleichen.`);
}

const docs = dokumenteBauen();
const zaehlung = docs.reduce<Record<string, number>>((z2, d) => ((z2[d._type] = (z2[d._type] ?? 0) + 1), z2), {});
const uebersicht = Object.entries(zaehlung).map(([t, n]) => `${n} × ${t}`).join(", ");

if (probe) {
  await trockenlauf(docs);
  console.log(`✓ Trockenlauf: ${docs.length} Dokumente gebaut (${uebersicht}), ${Object.keys(bilder).length} Bilder zugeordnet.`);
  console.log("  Jedes Dokument besteht das Domainmodell und entspricht nach dem Zurücklesen den lokalen Inhalten. Es wurde nichts geschrieben.");
} else {
  const projectId = (process.env.SANITY_PROJECT_ID ?? "").trim(), dataset = (process.env.SANITY_DATASET ?? "").trim(), token = (process.env.SANITY_API_WRITE_TOKEN ?? "").trim();
  if (!/^[a-z0-9]{8,}$/.test(projectId) || !dataset || !token) {
    console.error("✗ Für den Import fehlen SANITY_PROJECT_ID, SANITY_DATASET oder SANITY_API_WRITE_TOKEN (siehe .env.example).\n  Ohne Zugang lässt sich der Import mit «npm run seed -- --probe» prüfen.");
    process.exit(1);
  }
  const client = createClient({ projectId, dataset, token, apiVersion: "2025-02-19", useCdn: false });
  // Bilder hochladen (grösste WebP-Variante, so wie die Demo sie zeigt), dann die Dokumente mit den echten Bildkennungen neu bauen.
  // Wiederholte Läufe erzeugen keine Duplikate: Sanity vergibt die Asset-Kennung aus dem Inhalt der Datei, derselbe Upload
  // liefert also dasselbe Asset zurück.
  for (const [id, b] of Object.entries(bilder)) {
    const datei = path.join("public", b.quellen.webp[b.quellen.webp.length - 1].url);
    const asset = await client.assets.upload("image", createReadStream(datei), { filename: path.basename(datei) });
    assetIds.set(id, asset._id);
    console.log(`  Bild ${id} → ${asset._id}`);
  }
  zaehler = 0;
  const fertig = dokumenteBauen();
  let tx = client.transaction();
  for (const d of fertig) tx = force ? tx.createOrReplace(d) : tx.createIfNotExists(d);
  await tx.commit();
  console.log(`✓ ${fertig.length} Dokumente ${force ? "geschrieben (bestehende überschrieben)" : "angelegt (bestehende unverändert)"}: ${uebersicht}.`);
}
