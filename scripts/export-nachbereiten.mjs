// Nach dem statischen Export:
//  - GitHub Pages liefert bei unbekannten Adressen out/404.html aus. Next schreibt die gestaltete Fehlerseite
//    (app/not-found.tsx) mit trailingSlash nach out/404/index.html; hier zusätzlich als out/404.html ablegen.
//  - .nojekyll setzen (Ordner mit Unterstrich wie _next werden sonst nicht ausgeliefert).
//  - In der Demo (ohne INDEXIERUNG=1) die Sitemap entfernen: Alle Seiten sind noindex, eine Sitemap wäre widersprüchlich.
import { copyFile, access, rm, writeFile } from "node:fs/promises";
import path from "node:path";
const out = path.resolve(import.meta.dirname, "..", "out");
const quelle = path.join(out, "404", "index.html");
try { await access(quelle); } catch { console.error("✗ out/404/index.html fehlt: Export unvollständig."); process.exit(1); }
await copyFile(quelle, path.join(out, "404.html"));
await writeFile(path.join(out, ".nojekyll"), "");
const indexierung = process.env.INDEXIERUNG === "1";
if (!indexierung) await rm(path.join(out, "sitemap.xml"), { force: true });
console.log(`✓ out/404.html und out/.nojekyll geschrieben${indexierung ? ", Sitemap bleibt (INDEXIERUNG=1)" : ", Sitemap entfernt (Demo ist noindex)"}.`);
