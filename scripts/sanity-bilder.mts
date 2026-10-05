// Spiegelt die Bilder aus Sanity in die Website, bevor sie gebaut wird.
//
// Warum: Die Website soll auch mit Sanity keine Anfragen an Dritte auslösen (kein cdn.sanity.io im Browser). Deshalb lädt dieses
// Skript beim Build alle Bild-Assets des Datasets, erzeugt daraus dieselben Varianten wie für lokale Bilder (AVIF und WebP,
// nie hochskaliert) und schreibt sie nach public/bilder/cms/. Das Verzeichnis data/cms-bilder.json ordnet jeder Asset-Kennung
// ihre Varianten zu; lib/content/sanity.ts liest es.
//
//   npm run sanity:bilder                    läuft automatisch vor jedem Build; ohne CONTENT_SOURCE=sanity tut es nichts
//   tsx scripts/sanity-bilder.mts --probe <Bilddatei>
//                                            verarbeitet eine lokale Datei wie ein Sanity-Bild (Selbsttest ohne Sanity-Projekt)
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { createClient } from "@sanity/client";

const BREITEN = [480, 960, 1600];
type Asset = { _id: string; url: string };
type Eintrag = { breite: number; hoehe: number; quellen: { avif: { breite: number; url: string }[]; webp: { breite: number; url: string }[] } };

/** Erzeugt die Varianten eines Bildes und schreibt sie in den Zielordner. Bilder mit Transparenz (Logos) bleiben verlustfrei. */
export async function variantenErzeugen(daten: Buffer, id: string, zielOrdner: string, urlBasis: string): Promise<Eintrag> {
  const meta = await sharp(daten).metadata();
  if (!meta.width || !meta.height) throw new Error(`Bild ${id} ist nicht lesbar.`);
  const name = id.replace(/^image-/, "").replace(/[^A-Za-z0-9-]/g, "").slice(0, 60);
  const breiten = [...new Set(BREITEN.map((b) => Math.min(b, meta.width as number)))].sort((a, b) => a - b);
  const eintrag: Eintrag = { breite: 0, hoehe: 0, quellen: { avif: [], webp: [] } };
  for (const b of breiten) {
    const basis = sharp(daten).rotate().resize({ width: b, withoutEnlargement: true });
    const webp = await (meta.hasAlpha ? basis.clone().webp({ lossless: true }) : basis.clone().webp({ quality: 72 })).toBuffer({ resolveWithObject: true });
    await writeFile(path.join(zielOrdner, `${name}-${b}.webp`), webp.data);
    eintrag.quellen.webp.push({ breite: webp.info.width, url: `${urlBasis}/${name}-${b}.webp` });
    eintrag.breite = webp.info.width;
    eintrag.hoehe = webp.info.height;
    if (!meta.hasAlpha) {
      const avif = await basis.clone().avif({ quality: 50, effort: 6 }).toBuffer();
      await writeFile(path.join(zielOrdner, `${name}-${b}.avif`), avif);
      eintrag.quellen.avif.push({ breite: webp.info.width, url: `${urlBasis}/${name}-${b}.avif` });
    }
  }
  return eintrag;
}

const probe = process.argv.indexOf("--probe");
if (probe > -1) {
  const datei = process.argv[probe + 1];
  if (!datei) { console.error("✗ --probe verlangt eine Bilddatei."); process.exit(1); }
  const ziel = path.join("pruefung", "cms-probe");
  await rm(ziel, { recursive: true, force: true });
  await mkdir(ziel, { recursive: true });
  const eintrag = await variantenErzeugen(await readFile(datei), "image-probe0000-1x1-webp", ziel, "/bilder/cms");
  console.log(`✓ Selbsttest: ${datei} → ${eintrag.quellen.webp.length} WebP, ${eintrag.quellen.avif.length} AVIF, grösste Variante ${eintrag.breite} × ${eintrag.hoehe} (in ${ziel}, nichts veröffentlicht).`);
} else if ((process.env.CONTENT_SOURCE ?? "").trim() !== "sanity") {
  console.log("· Bilder aus Sanity: übersprungen (Inhalte kommen aus data/*.json).");
} else {
  const projectId = (process.env.SANITY_PROJECT_ID ?? "").trim(), dataset = (process.env.SANITY_DATASET ?? "").trim();
  if (!/^[a-z0-9]{8,}$/.test(projectId) || !dataset) { console.error("✗ CONTENT_SOURCE=sanity verlangt SANITY_PROJECT_ID und SANITY_DATASET (siehe .env.example)."); process.exit(1); }
  const client = createClient({ projectId, dataset, apiVersion: "2025-02-19", useCdn: false, perspective: "published", token: process.env.SANITY_API_READ_TOKEN?.trim() || undefined });
  const assets = await client.fetch<Asset[]>(`*[_type == "sanity.imageAsset"]{ _id, url }`);
  const ziel = path.join("public", "bilder", "cms");
  await rm(ziel, { recursive: true, force: true });
  await mkdir(ziel, { recursive: true });
  const verzeichnis: Record<string, Eintrag> = {};
  for (const a of assets) {
    // Nur das Sanity-CDN des eigenen Projekts wird abgerufen (beim Build, nie im Browser der Besucher)
    if (!a.url.startsWith(`https://cdn.sanity.io/images/${projectId}/`)) throw new Error(`Unerwartete Bildadresse: ${a.url}`);
    const antwort = await fetch(a.url);
    if (!antwort.ok) throw new Error(`Bild ${a._id} liess sich nicht laden (${antwort.status}).`);
    verzeichnis[a._id] = await variantenErzeugen(Buffer.from(await antwort.arrayBuffer()), a._id, ziel, "/bilder/cms");
  }
  await writeFile(path.join("data", "cms-bilder.json"), JSON.stringify(verzeichnis, null, 2) + "\n");
  console.log(`✓ ${assets.length} Bilder aus Sanity gespiegelt → public/bilder/cms, data/cms-bilder.json`);
}
