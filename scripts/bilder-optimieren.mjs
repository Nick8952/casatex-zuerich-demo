// Erzeugt aus den Originalen in assets/originale/ die Web-Varianten in public/bilder/
// und schreibt das Bildverzeichnis data/bilder.json (Masse, Varianten, Alternativtext, Bildnachweis).
// Aufruf: npm run bilder   (idempotent: public/bilder wird neu aufgebaut)
//
// Zuordnung id → Originaldatei samt Nachweis: scripts/bilder-liste.json. Herkunft jeder Datei: assets/originale/HERKUNFT.md
// Arten:
//   "kachel"  quadratische, nahtlos wiederholbare Textur (Bodenfläche, Handmuster). Mit "nahtlos": true wird ein Foto erst
//             kachelbar gemacht: grossflächige Helligkeitsunterschiede ausgleichen, Ränder mit dem versetzten Bild überblenden.
//   "foto"    Foto mit festem Seitenverhältnis ("verhaeltnis": "3:2")
//   "logo"    unverändertes Firmenlogo, nur verkleinert (nie hochskaliert, kein AVIF, damit die Kanten sauber bleiben)
// Dateinamen tragen einen Inhalts-Hash, damit Browser nach Bildwechseln nichts Altes zeigen. Es wird nie hochskaliert.
import sharp from "sharp";
import { mkdir, readdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

const WURZEL = path.resolve(import.meta.dirname, "..");
const QUELLE = path.join(WURZEL, "assets/originale");
const ZIEL = path.join(WURZEL, "public/bilder");
const BILDER = JSON.parse(await readFile(path.join(WURZEL, "scripts/bilder-liste.json"), "utf8"));

/** Foto in eine nahtlos kachelbare Textur überführen (für gleichmässige Oberflächen wie Teppich oder Kork). */
async function nahtlosMachen(eingabe, kante) {
  const { data, info } = await eingabe.resize(kante, kante, { fit: "cover" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const weich = await sharp(data, { raw: info }).blur(kante / 14).raw().toBuffer();
  const n = info.width * info.height;
  const mittel = [0, 0, 0];
  for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) mittel[k] += data[i * 3 + k];
  for (let k = 0; k < 3; k++) mittel[k] /= n;
  // 1) Helligkeit ausgleichen: Bild minus stark weichgezeichnetes Bild plus Mittelwert
  const flach = new Float32Array(n * 3);
  for (let i = 0; i < n * 3; i++) flach[i] = data[i] - weich[i] + mittel[i % 3];
  // 2) Ränder überblenden: an den Kanten zeigt sich das um die halbe Kante versetzte Bild, in der Mitte das Original
  const aus = Buffer.alloc(n * 3);
  const halb = kante / 2;
  const stufe = (t) => t * t * (3 - 2 * t);
  for (let y = 0; y < kante; y++) {
    for (let x = 0; x < kante; x++) {
      const rand = Math.min(x, kante - 1 - x, y, kante - 1 - y) / (kante * 0.22);
      const w = stufe(Math.max(0, Math.min(1, rand)));
      const i = (y * kante + x) * 3;
      const j = (((y + halb) % kante) * kante + ((x + halb) % kante)) * 3;
      for (let k = 0; k < 3; k++) aus[i + k] = Math.max(0, Math.min(255, Math.round(flach[i + k] * w + flach[j + k] * (1 - w))));
    }
  }
  return sharp(aus, { raw: { width: kante, height: kante, channels: 3 } });
}

/**
 * Logo auf weissem Grund (JPEG) → Logo mit transparentem Grund. Je Bildpunkt gilt: Deckkraft = 1 − hellster Kanal,
 * die Farbe wird so zurückgerechnet, dass das Logo auf Weiss exakt gleich aussieht wie die Vorlage. Formen und Farben bleiben unverändert.
 */
async function weissZuTransparent(eingabe) {
  const { data, info } = await eingabe.removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const n = info.width * info.height;
  const aus = Buffer.alloc(n * 4);
  for (let i = 0; i < n; i++) {
    const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
    const a = 1 - Math.min(r, g, b) / 255;
    const zurueck = (c) => (a < 0.004 ? 0 : Math.max(0, Math.min(255, Math.round((c - 255 * (1 - a)) / a))));
    aus[i * 4] = zurueck(r); aus[i * 4 + 1] = zurueck(g); aus[i * 4 + 2] = zurueck(b); aus[i * 4 + 3] = Math.round(a * 255);
  }
  return sharp(aus, { raw: { width: info.width, height: info.height, channels: 4 } });
}

function verhaeltnis(text) {
  const [b, h] = text.split(":").map(Number);
  if (!b || !h) throw new Error(`Seitenverhältnis «${text}» ist ungültig (erwartet z. B. "3:2").`);
  return b / h;
}

// Erst alle Quellen prüfen, in einen temporären Ordner rendern und zum Schluss atomar austauschen (kein halber Bestand bei Fehlern).
for (const [id, cfg] of Object.entries(BILDER)) {
  const meta = await sharp(path.join(QUELLE, cfg.datei)).metadata().catch(() => null);
  if (!meta?.width || !meta?.height) throw new Error(`Bild «${id}»: ${cfg.datei} fehlt oder ist nicht lesbar.`);
  if (typeof cfg.alt !== "string") throw new Error(`Bild «${id}»: Alternativtext fehlt (leer "" nur für rein dekorative Bilder).`);
  if (!cfg.nachweis?.urheber || !cfg.nachweis?.quelle || !cfg.nachweis?.lizenz) throw new Error(`Bild «${id}»: Bildnachweis (urheber, quelle, lizenz) ist unvollständig.`);
}
const TEMP = `${ZIEL}.neu`;
await rm(TEMP, { recursive: true, force: true });
await mkdir(TEMP, { recursive: true });

async function schreiben(id, pipe, format) {
  const fertig = format === "avif" ? pipe.avif({ quality: 50, effort: 6 }) : format === "jpg" ? pipe.jpeg({ quality: 84, mozjpeg: true }) : (format === "webp-logo" ? pipe.webp({ lossless: true }) : pipe.webp({ quality: 72 }));
  const { data, info } = await fertig.toBuffer({ resolveWithObject: true });
  const endung = format === "avif" ? "avif" : format === "jpg" ? "jpg" : "webp";
  const hash = createHash("sha1").update(data).digest("hex").slice(0, 8);
  const dateiname = `${id}-${info.width}-${hash}.${endung}`;
  await writeFile(path.join(TEMP, dateiname), data);
  return { breite: info.width, hoehe: info.height, url: `/bilder/${dateiname}`, bytes: data.length };
}

const verzeichnis = {};
for (const [id, cfg] of Object.entries(BILDER)) {
  const pfad = path.join(QUELLE, cfg.datei);
  const meta = await sharp(pfad).metadata();
  let basis = sharp(pfad).rotate();
  let quellBreite = meta.width;
  let quellHoehe = meta.height;
  if (cfg.ausschnitt) {
    basis = sharp(await basis.extract(cfg.ausschnitt).toBuffer());
    quellBreite = cfg.ausschnitt.width;
    quellHoehe = cfg.ausschnitt.height;
  }
  const ratio = cfg.art === "kachel" ? 1 : cfg.verhaeltnis ? verhaeltnis(cfg.verhaeltnis) : quellBreite / quellHoehe;
  const maxBreite = Math.floor(Math.min(quellBreite, quellHoehe * ratio));
  const breiten = [...new Set(cfg.breiten.map((b) => Math.min(b, maxBreite)))].sort((a, b) => a - b);
  const avif = [];
  const webp = [];
  for (const b of breiten) {
    const h = Math.round(b / ratio);
    let pipe;
    if (cfg.art === "kachel" && cfg.nahtlos) pipe = await nahtlosMachen(basis.clone(), b);
    else pipe = basis.clone().resize({ width: b, height: h, fit: "cover", position: cfg.position ?? "centre", withoutEnlargement: true });
    const puffer = await pipe.png().toBuffer();
    if (cfg.art === "logo") {
      webp.push(await schreiben(id, await weissZuTransparent(sharp(puffer)), "webp-logo"));
    } else {
      avif.push(await schreiben(id, sharp(puffer), "avif"));
      webp.push(await schreiben(id, sharp(puffer), "webp"));
    }
  }
  const groesste = webp[webp.length - 1];
  verzeichnis[id] = {
    id,
    art: cfg.art,
    original: `assets/originale/${cfg.datei}`,
    breite: groesste.breite,
    hoehe: groesste.hoehe,
    alt: cfg.alt,
    legende: cfg.legende ?? null,
    symbolbild: cfg.symbolbild === true,
    nachweis: cfg.nachweis,
    abgerufen: cfg.abgerufen,
    bearbeitung: cfg.bearbeitung ?? null,
    quellen: {
      avif: avif.map(({ breite, url }) => ({ breite, url })),
      webp: webp.map(({ breite, url }) => ({ breite, url })),
    },
    bytes: { avif: avif.map((v) => v.bytes), webp: webp.map((v) => v.bytes) },
  };
}

// Vorschaubild für geteilte Links (Open Graph, 1200 × 630): oben Wandfläche mit unverändertem Logo, unten die Parketttextur.
{
  const wand = "#f1f0ec";
  const logo = await sharp(path.join(QUELLE, BILDER["logo-casatex"].datei)).resize({ width: 520 }).flatten({ background: "#ffffff" }).toBuffer();
  const logoMeta = await sharp(logo).metadata();
  const logoPlatte = await sharp({ create: { width: logoMeta.width + 80, height: logoMeta.height + 60, channels: 3, background: "#ffffff" } }).composite([{ input: logo, left: 40, top: 30 }]).png().toBuffer();
  const boden = await sharp(path.join(QUELLE, BILDER["boden-parkett"].datei)).resize(1200, 1200).extract({ left: 0, top: 300, width: 1200, height: 270 }).toBuffer();
  const leiste = await sharp({ create: { width: 1200, height: 10, channels: 3, background: "#ffffff" } }).png().toBuffer();
  const og = sharp({ create: { width: 1200, height: 630, channels: 3, background: wand } }).composite([
    { input: logoPlatte, left: 80, top: 70 },
    { input: boden, left: 0, top: 360 },
    { input: leiste, left: 0, top: 350 },
  ]);
  const { breite, hoehe, url, bytes } = await schreiben("og-casatex", og, "jpg");
  verzeichnis["og-casatex"] = {
    id: "og-casatex", art: "foto", original: "erzeugt aus logo-casatex und boden-parkett", breite, hoehe,
    alt: "Casatex, Böden + Beläge. Logo über einer Parkettfläche im Fischgratmuster.", legende: null, symbolbild: true,
    nachweis: { urheber: "Casatex Zürich AG (Logo); Jenelle van Heerden, Sergej Majboroda (Textur)", titel: "Vorschaubild", quelle: "erzeugt von scripts/bilder-optimieren.mjs", lizenz: "Logo vorbehaltlich Freigabe; Textur CC0 1.0" },
    abgerufen: BILDER["logo-casatex"].abgerufen, bearbeitung: "Montage aus Logo und Textur",
    quellen: { avif: [], webp: [{ breite, url }] }, bytes: { avif: [], webp: [bytes] },
  };
}

const ALT = `${ZIEL}.alt`;
await rm(ALT, { recursive: true, force: true });
let hatteAlt = false;
try { await rename(ZIEL, ALT); hatteAlt = true; } catch { /* noch kein Bestand */ }
try {
  await rename(TEMP, ZIEL);
} catch (err) {
  if (hatteAlt) await rename(ALT, ZIEL);
  throw err;
}
await rm(ALT, { recursive: true, force: true });
await mkdir(path.join(WURZEL, "data"), { recursive: true });
await writeFile(path.join(WURZEL, "data/bilder.json"), JSON.stringify(verzeichnis, null, 2) + "\n");
const summe = Object.values(verzeichnis).reduce((s, b) => s + [...b.bytes.avif, ...b.bytes.webp].reduce((a, c) => a + c, 0), 0);
console.log(`${Object.keys(verzeichnis).length} Bilder → data/bilder.json, ${(await readdir(ZIEL)).length} Dateien in public/bilder (${Math.round(summe / 1024)} KB)`);
for (const b of Object.values(verzeichnis)) console.log(`  ${b.id.padEnd(22)} ${b.breite}×${b.hoehe}  avif ${b.bytes.avif.map((x) => Math.round(x / 1024) + "KB").join("/") || "-"}  webp ${b.bytes.webp.map((x) => Math.round(x / 1024) + "KB").join("/")}`);
