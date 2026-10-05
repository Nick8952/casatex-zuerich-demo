// Prüft den fertigen statischen Export (out/) so, wie er auf GitHub Pages liegt:
//  - jede erwartete Seite hat eine index.html, 404.html und .nojekyll sind da, keine leeren Seiten
//  - alle internen href/src beginnen mit dem Unterpfad und zeigen auf vorhandene Dateien (Gross-/Kleinschreibung wie auf GitHub Pages)
//  - keine Ressourcen von fremden Hosts (Skripte, Stylesheets, Bilder, Schriften, iframes), auch keine preconnects
//  - Demo: jede Seite trägt <meta name="robots" content="noindex…">, es gibt KEINE Sitemap, robots.txt sperrt nicht, kein JSON-LD
//    Mit INDEXIERUNG=1: kein noindex, Sitemap vorhanden und in robots.txt genannt, JSON-LD parsebar
//  - <html lang="de-CH">, Canonical absolut auf die eigene Adresse, genau eine h1, Titel vorhanden, Sprungziele vorhanden
//  - Schreibweise im ausgelieferten Text: kein «ß», keine Gedankenstriche
//  - Budgets: grösste vorgeladene Bodentextur, JavaScript je Seite, Gewicht aller Bilder
// Aufruf: npm run export:pruefen   (nach npm run build)
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const WURZEL = path.resolve(import.meta.dirname, "..", "out");
const DATA = path.resolve(import.meta.dirname, "..", "data");
const vercel = process.env.DEPLOY_TARGET === "vercel";
const basePath = vercel ? "" : (process.env.BASE_PATH ?? "/casatex-zuerich-demo").replace(/\/$/, "");
const indexierung = process.env.INDEXIERUNG === "1";
const siteUrl = (process.env.SITE_URL || (vercel ? "https://casatex-zuerich-demo.vercel.app" : `https://nick8952.github.io${basePath}`)).replace(/\/$/, "");
// Budgets (unkomprimiert, in Bytes). Bewusst knapp über dem Ist-Stand: Wer sie reisst, soll es merken.
const BUDGET = { vorgeladenesBild: 150_000, jsJeSeite: 720_000, bildMax: 260_000 };
const fehler = [];

async function dateien(ordner, endung) {
  const liste = [];
  for (const e of await readdir(ordner, { withFileTypes: true })) {
    const p = path.join(ordner, e.name);
    if (e.isDirectory()) liste.push(...(await dateien(p, endung)));
    else if (e.name.endsWith(endung)) liste.push(p);
  }
  return liste;
}
async function existiertGenau(p) {
  try {
    await stat(p);
    return (await readdir(path.dirname(p))).includes(path.basename(p));
  } catch {
    return false;
  }
}
const groesse = async (p) => (await stat(p).catch(() => null))?.size ?? 0;

let seiten;
try {
  seiten = await dateien(WURZEL, ".html");
} catch {
  console.error("✗ out/ fehlt: zuerst `npm run build` ausführen.");
  process.exit(1);
}
if (!seiten.length) { console.error("✗ out/ enthält keine HTML-Dateien."); process.exit(1); }

const leistungen = JSON.parse(await readFile(path.join(DATA, "leistungen.json"), "utf8"));
const erwartet = ["index.html", "404.html", ".nojekyll", "robots.txt", "leistungen/index.html", "ueber-casatex/index.html", "kontakt/index.html", "impressum/index.html", "datenschutz/index.html", ...leistungen.map((l) => `leistungen/${l.slug}/index.html`)];
for (const s of erwartet) if (!(await existiertGenau(path.join(WURZEL, s)))) fehler.push(`Fehlt im Export: ${s}`);

{
  const robots = await readFile(path.join(WURZEL, "robots.txt"), "utf8").catch(() => "");
  const hatSitemap = await existiertGenau(path.join(WURZEL, "sitemap.xml"));
  if (/Disallow:\s*\/\s*$/m.test(robots)) fehler.push("robots.txt sperrt alles: Suchmaschinen könnten dann das noindex der Seiten nicht lesen");
  if (!indexierung && (hatSitemap || /Sitemap:/.test(robots))) fehler.push("Demo: es darf keine Sitemap geben (alle Seiten sind noindex)");
  if (indexierung && (!hatSitemap || !/Sitemap:/.test(robots))) fehler.push("INDEXIERUNG=1: Sitemap fehlt oder steht nicht in robots.txt");
  if (indexierung && hatSitemap) {
    const sm = await readFile(path.join(WURZEL, "sitemap.xml"), "utf8");
    for (const m of sm.matchAll(/<loc>([^<]+)<\/loc>/g)) if (!m[1].startsWith(siteUrl + "/")) fehler.push(`Sitemap: Adresse ausserhalb der eigenen Domain: ${m[1]}`);
  }
}

let geprueft = 0;
let maxJs = 0;
let maxVorgeladen = 0;
for (const datei of seiten) {
  let html = await readFile(datei, "utf8");
  const rel = path.relative(WURZEL, datei);
  const hatNoindex = /<meta name="robots" content="noindex/.test(html);
  const istFehlerseite = /^(404\.html|404\/index\.html|_not-found\/index\.html)$/.test(rel);
  if (!indexierung && !hatNoindex) fehler.push(`${rel}: kein noindex`);
  // Fehlerseiten bleiben auch nach dem Go-Live noindex.
  if (indexierung && hatNoindex && !istFehlerseite) fehler.push(`${rel}: noindex trotz INDEXIERUNG=1`);
  if (!/<html[^>]*\blang="de-CH"/.test(html)) fehler.push(`${rel}: <html lang> ist nicht "de-CH"`);
  const sichtbar = html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  if (!istFehlerseite && sichtbar.length < 600) fehler.push(`${rel}: Seite wirkt leer (${sichtbar.length} Zeichen Text)`);
  if (sichtbar.includes("ß")) fehler.push(`${rel}: «ß» im Text`);
  if (/[—–]/.test(sichtbar)) fehler.push(`${rel}: Gedankenstrich im Text`);
  if (!istFehlerseite) {
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    const erwartetC = `${siteUrl}/${rel.replace(/index\.html$/, "")}`;
    if (!canonical) fehler.push(`${rel}: kein Canonical`);
    else if (canonical !== erwartetC) fehler.push(`${rel}: Canonical «${canonical}» ≠ erwartet «${erwartetC}»`);
    const og = html.match(/<meta property="og:url" content="([^"]+)"/)?.[1];
    if (og !== erwartetC) fehler.push(`${rel}: og:url «${og}» ≠ «${erwartetC}»`);
    const ogBild = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
    if (!ogBild?.startsWith(siteUrl + "/")) fehler.push(`${rel}: og:image fehlt oder liegt nicht unter ${siteUrl}`);
    else if (!(await existiertGenau(path.join(WURZEL, decodeURIComponent(ogBild.slice(siteUrl.length)))))) fehler.push(`${rel}: og:image zeigt auf eine fehlende Datei`);
    const h1 = (html.match(/<h1[\s>]/g) ?? []).length;
    if (h1 !== 1) fehler.push(`${rel}: ${h1} h1-Elemente`);
    const titel = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
    if (!titel.trim() || titel.length > 75) fehler.push(`${rel}: Titel leer oder zu lang (${titel.length} Zeichen: «${titel}»)`);
    if ((titel.match(/Casatex Zürich AG/g) ?? []).length > 1) fehler.push(`${rel}: Firmenname doppelt im Titel («${titel}»)`);
    const beschreibung = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "";
    if (beschreibung.length < 50 || beschreibung.length > 170) fehler.push(`${rel}: Beschreibung hat ${beschreibung.length} Zeichen (sinnvoll: 50 bis 170)`);
  }
  const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (!indexierung && jsonLd.length) fehler.push(`${rel}: JSON-LD in der Demo (erst mit INDEXIERUNG=1)`);
  if (indexierung && !istFehlerseite && !jsonLd.length) fehler.push(`${rel}: JSON-LD fehlt trotz INDEXIERUNG=1`);
  for (const m of jsonLd) { try { JSON.parse(m[1]); } catch { fehler.push(`${rel}: JSON-LD nicht parsebar`); } }
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const m of html.matchAll(/href="#([^"]+)"/g)) if (!ids.has(m[1])) fehler.push(`${rel}: Sprungziel #${m[1]} fehlt`);
  if (/<link rel="preconnect" href="(?!\/)/.test(html) || /<link rel="dns-prefetch"/.test(html)) fehler.push(`${rel}: externer preconnect/dns-prefetch`);
  html = html.replace(/<link rel="preconnect" href="\/"[^>]*>/g, "");
  for (const tag of html.matchAll(/<(script|link|img|source|video|audio|iframe|embed|object)\b[^>]*>/g)) {
    if (tag[1] === "link" && /rel="(canonical|alternate|next|prev)"/.test(tag[0])) continue;
    for (const attr of tag[0].matchAll(/(?:src|href|srcset|srcSet|imagesrcset|data)="([^"]+)"/g)) {
      for (const u of attr[1].split(",").map((s) => s.trim().split(" ")[0])) {
        if (/^(https?:)?\/\//.test(u)) fehler.push(`${rel}: externe Ressource in <${tag[1]}>: ${u}`);
      }
    }
  }
  for (const m of html.matchAll(/url\((?:&quot;|["'])?((?:https?:)?\/\/[^"')&]+)/g)) fehler.push(`${rel}: externe Ressource in CSS: ${m[1]}`);
  let js = 0;
  for (const m of html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)) js += await groesse(path.join(WURZEL, decodeURIComponent(m[1].split("?")[0].slice(basePath.length))));
  maxJs = Math.max(maxJs, js);
  if (js > BUDGET.jsJeSeite) fehler.push(`${rel}: ${Math.round(js / 1024)} KB JavaScript (Budget ${Math.round(BUDGET.jsJeSeite / 1024)} KB)`);
  for (const tag of html.matchAll(/<link\b[^>]*rel="preload"[^>]*>/g)) {
    if (!/as="image"/.test(tag[0])) continue;
    const href = tag[0].match(/href="([^"]+)"/)?.[1];
    if (!href) continue;
    const g = await groesse(path.join(WURZEL, decodeURIComponent(href.slice(basePath.length))));
    maxVorgeladen = Math.max(maxVorgeladen, g);
    if (g > BUDGET.vorgeladenesBild) fehler.push(`${rel}: vorgeladenes Bild ${Math.round(g / 1024)} KB (Budget ${Math.round(BUDGET.vorgeladenesBild / 1024)} KB): ${href}`);
  }
  for (const m of html.matchAll(/(?:href|src|srcset|srcSet|imagesrcset)="([^"]+)"/g)) {
    for (const rohUrl of m[1].split(",").map((s) => s.trim().split(" ")[0])) {
      if (!rohUrl || rohUrl.startsWith("#") || /^(mailto:|tel:|data:)/.test(rohUrl)) continue;
      if (/^(https?:)?\/\//.test(rohUrl)) continue;
      const url = rohUrl.split("?")[0].split("#")[0];
      if (basePath && !url.startsWith(basePath + "/") && url !== basePath) { fehler.push(`${rel}: Pfad ohne Unterpfad: ${rohUrl}`); continue; }
      let ziel = path.join(WURZEL, decodeURIComponent(url.slice(basePath.length)));
      if (url.endsWith("/")) ziel = path.join(ziel, "index.html");
      if (!(await existiertGenau(ziel)) && !(await existiertGenau(ziel + ".html")) && !(await existiertGenau(ziel + ".txt"))) fehler.push(`${rel}: Ziel fehlt: ${rohUrl}`);
      geprueft++;
    }
  }
}
let bildSumme = 0;
for (const b of [...(await dateien(path.join(WURZEL, "bilder"), ".avif")), ...(await dateien(path.join(WURZEL, "bilder"), ".webp"))]) {
  const g = await groesse(b);
  bildSumme += g;
  // Als WebP-Rückfall dürfen grosse Bodentexturen schwerer sein; AVIF ist das Format, das moderne Browser tatsächlich laden.
  if (b.endsWith(".avif") && g > BUDGET.bildMax) fehler.push(`Bild über Budget: ${path.basename(b)} ${Math.round(g / 1024)} KB (Budget ${Math.round(BUDGET.bildMax / 1024)} KB)`);
}
if (fehler.length) {
  console.error(`✗ ${fehler.length} Problem(e) im Export:\n` + [...new Set(fehler)].map((f) => `  - ${f}`).join("\n"));
  process.exit(1);
}
console.log(`✓ Export in Ordnung: ${seiten.length} HTML-Dateien, ${geprueft} interne Verweise${basePath ? ` unter ${basePath}` : ""}, noindex ${indexierung ? "aus (Indexierung erlaubt)" : "auf allen Seiten, keine Sitemap, kein JSON-LD"}.`);
console.log(`  Budgets: vorgeladenes Bild ${Math.round(maxVorgeladen / 1024)}/${Math.round(BUDGET.vorgeladenesBild / 1024)} KB · JavaScript je Seite höchstens ${Math.round(maxJs / 1024)}/${Math.round(BUDGET.jsJeSeite / 1024)} KB (unkomprimiert) · alle Bildvarianten zusammen ${Math.round(bildSumme / 1024)} KB`);
