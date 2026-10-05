// DOM-Audit aller Seiten in vier Breiten: Status, horizontaler Überlauf, zu kleine Touch-Ziele, Alt-Texte, genau eine h1,
// Reihenfolge der Überschriften, robots, externe Anfragen, Konsolenfehler, Speicher/Cookies, Sprunglink, von der fixierten
// Kopfzeile verdeckte Inhalte, fehlgeschlagene Anfragen (Bilder, Schriften, Skripte unter dem Unterpfad).
// Aufruf: node werkzeuge/qa/audit.mjs  (Vorschau-Server: npm run vorschau:pages)  ·  SEITEN=/,/kontakt/  BREITEN=360,1440  SCREENSHOTS=1
import { mkdirSync, writeFileSync } from "node:fs";
import { BASE, alleSeiten, browserStarten, externeAnfragen, warten } from "./chrome.mjs";
const seiten = process.env.SEITEN ? process.env.SEITEN.split(",") : [...alleSeiten(), "/diese-seite-gibt-es-nicht/"];
const breiten = (process.env.BREITEN ?? "360,390,768,1440").split(",").map(Number);
const screenshots = process.env.SCREENSHOTS === "1";
mkdirSync("pruefung/shots", { recursive: true });
const browser = await browserStarten();
const bericht = [];
for (const breite of breiten) {
  for (const seite of seiten) {
    const ctx = await browser.createBrowserContext();
    const p = await ctx.newPage();
    await p.setViewport({ width: breite, height: 900, deviceScaleFactor: 1 });
    // Ohne Animationen prüfen: sonst misst das Audit Elemente mitten im Einblenden
    await p.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    const konsole = [];
    const fehlgeschlagen = [];
    p.on("console", (m) => { if (m.type() === "error") konsole.push(m.text().slice(0, 160)); });
    p.on("pageerror", (e) => konsole.push("pageerror: " + e.message.slice(0, 160)));
    p.on("response", (r) => { if (r.status() >= 400 && r.url() !== BASE + seite) fehlgeschlagen.push(`${r.status()} ${r.url().replace(BASE, "")}`); });
    const extern = externeAnfragen(p);
    const resp = await p.goto(BASE + seite, { waitUntil: "networkidle0", timeout: 60000 });
    await warten(250);
    const audit = await p.evaluate(() => {
      const de = document.documentElement;
      const sichtbar = (el) => { const r = el.getBoundingClientRect(); const st = getComputedStyle(el); return r.width > 0 && r.height > 0 && st.visibility !== "hidden" && st.display !== "none"; };
      const name = (el) => `${el.tagName.toLowerCase()} «${(el.textContent || el.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ").slice(0, 30)}» ${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`;
      const zuKlein = [...document.querySelectorAll("a,button,input,select,textarea,summary,label[for]")].filter((el) => {
        if (!sichtbar(el)) return false;
        if (el.closest("dialog:not([open])")) return false;
        if (el.classList.contains("nur-sr")) return false;
        // Versteckte Radios der Materialwahl: geprüft wird ihre sichtbare Beschriftung (label)
        if (el.tagName === "INPUT" && getComputedStyle(el).opacity === "0") return false;
        if (el.tagName === "LABEL" && !el.closest(".bodenwahl")) return false;
        // Links im Fliesstext sind von der Mindestgrösse ausgenommen (WCAG 2.5.8, Ausnahme «inline»)
        if (el.tagName === "A" && el.closest("p,li,dd,figcaption,blockquote") && getComputedStyle(el).display === "inline") return false;
        const r = el.getBoundingClientRect();
        return r.width < 44 || r.height < 44;
      }).map(name);
      const breit = [...document.querySelectorAll("body *")].filter((el) => {
        if (el.closest("dialog") || el.closest(".raum")) return false; // die Bodenfläche ragt absichtlich über den Rand und ist beschnitten
        const r = el.getBoundingClientRect();
        return r.width > 0 && (r.right > de.clientWidth + 1 || r.left < -1);
      }).slice(0, 5).map((el) => el.tagName.toLowerCase() + "." + [...el.classList].slice(0, 2).join("."));
      const hs = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].filter((h) => !h.closest("dialog")).map((h) => Number(h.tagName[1]));
      let spruenge = 0; for (let i = 1; i < hs.length; i++) if (hs[i] > hs[i - 1] + 1) spruenge++;
      // Verdeckt die fixierte Kopfzeile ein Sprungziel? Jedes Ziel mit id muss nach dem Anspringen unterhalb der Kopfzeile liegen.
      const kopf = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
      const polster = parseFloat(getComputedStyle(de).scrollPaddingTop) || 0;
      return {
        overflow: de.scrollWidth > de.clientWidth + 1, breit, zuKlein, bilderOhneAlt: [...document.images].filter((i) => !i.hasAttribute("alt")).length,
        bilderOhneMasse: [...document.images].filter((i) => !i.getAttribute("width") || !i.getAttribute("height")).length,
        h1: document.querySelectorAll("main h1").length, spruenge, robots: document.querySelector("meta[name=robots]")?.content ?? null,
        title: document.title, lang: de.lang, storage: [...Object.keys(localStorage), ...Object.keys(sessionStorage)], cookies: document.cookie,
        skip: document.querySelector('a[href="#inhalt"]') !== null, main: !!document.querySelector("main#inhalt"),
        kopfVerdeckt: polster < kopf, textKlein: [...document.querySelectorAll("main p, main li, main dd, main label, main summary")].filter((el) => sichtbar(el) && parseFloat(getComputedStyle(el).fontSize) < 13).length,
      };
    });
    if (screenshots) await p.screenshot({ path: `pruefung/shots/${seite.replaceAll("/", "_") || "_"}-${breite}.png`, fullPage: true });
    const z = { status: resp?.status(), seite, breite, ...audit, extern: [...new Set(extern)], fehlgeschlagen: [...new Set(fehlgeschlagen)], konsole: konsole.filter((k) => !(/status of 404/.test(k) && resp?.status() === 404)) };
    bericht.push(z);
    const istFehlerseite = /gibt-es-nicht/.test(seite);
    const probleme = [
      z.status !== 200 && !istFehlerseite ? `status=${z.status}` : "", istFehlerseite && z.status !== 404 ? `Fehlerseite liefert ${z.status} statt 404` : "",
      z.overflow ? `ÜBERLAUF ${z.breit.join(",")}` : "", z.zuKlein.length ? `klein: ${z.zuKlein.slice(0, 3).join(" | ")}` : "", z.bilderOhneAlt ? `alt fehlt ${z.bilderOhneAlt}` : "",
      z.bilderOhneMasse ? `Bild ohne width/height ${z.bilderOhneMasse}` : "", z.h1 !== 1 ? `h1=${z.h1}` : "", z.spruenge ? `Überschriften-Sprünge ${z.spruenge}` : "",
      z.extern.length ? `EXTERN ${z.extern.join(",")}` : "", z.fehlgeschlagen.length ? `ANFRAGE FEHLGESCHLAGEN ${z.fehlgeschlagen.join(",")}` : "", z.konsole.length ? `KONSOLE ${z.konsole[0]}` : "",
      z.storage.length ? `storage ${z.storage}` : "", z.cookies ? "COOKIES" : "", !z.skip || !z.main ? "SKIP/MAIN fehlt" : "", z.kopfVerdeckt ? "Kopfzeile verdeckt Sprungziele" : "",
      z.textKlein ? `${z.textKlein} Texte kleiner als 13px` : "", !z.robots?.includes("noindex") ? "noindex fehlt" : "", z.lang !== "de-CH" ? `lang=${z.lang}` : "",
    ].filter(Boolean);
    z.probleme = probleme;
    console.log(`${z.status} ${breite} ${seite} ${probleme.length ? "→ " + probleme.join(" · ") : "ok"}`);
    await ctx.close();
  }
}
await browser.close();
writeFileSync("pruefung/audit.json", JSON.stringify(bericht, null, 1));
const fehler = bericht.filter((z) => z.probleme.length);
console.log(`\n${bericht.length} Prüfungen (${seiten.length} Seiten × ${breiten.length} Breiten), ${fehler.length} mit Befund → pruefung/audit.json`);
process.exitCode = fehler.length ? 1 : 0;
